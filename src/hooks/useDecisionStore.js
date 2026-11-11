import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DECISION_STATIONS,
  createInitialBlueprint,
  dbRowToBlueprint,
  getEmptyValue,
  hasDecisionValue,
} from "@/config/stations.config";
import { normalizeStepResponse } from "@/lib/stepContracts";

// Versión del esquema persistido en localStorage (ver `migrate` al final).
const STORE_VERSION = 2;

/** Normaliza todas las opciones cacheadas al contrato vigente. */
function normalizeAllOptions(options = {}) {
  return Object.fromEntries(
    Object.entries(options).map(([step, data]) => [
      step,
      normalizeStepResponse(step, data).data,
    ]),
  );
}

/** Conserva solo las claves numéricas de generatedOptions que cumplan `keep`. */
function filterNumericOptions(options = {}, keep = () => true) {
  return Object.fromEntries(
    Object.entries(options).filter(([key]) => {
      const step = Number(key);
      return key !== "" && Number.isInteger(step) && keep(step);
    }),
  );
}

let activeAbortController = null;

export const useDecisionStore = create(
  persist(
    (set, get) => ({
      currentStep: 0,
      currentIdeaDraft: "",
      setCurrentIdeaDraft: (draft) => set({ currentIdeaDraft: draft }),

      // Identificadores de sesión y sincronización con Supabase
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      cloudProjectId: null,
      setCloudProjectId: (id) => set({ cloudProjectId: id }),
      isSyncingCloud: false,
      setIsSyncingCloud: (val) => set({ isSyncingCloud: val }),

      isLoading: false,
      apiError: null,

      companionMood: "idle",
      companionDialogue: "Cuéntame qué quieres armar y calibramos el camino.",

      blueprint: createInitialBlueprint(),
      generatedOptions: {},

      // Control del mapa en memoria (Estación 0)
      isMapCardActive: false,
      toggleMapCard: () =>
        set((state) => ({ isMapCardActive: !state.isMapCardActive })),
      setIsResumingPreviousMap: (val) => set({ isMapCardActive: Boolean(val) }),

      // Control del panel lateral desplegable del mapa en zigzag
      isRouteMapOpen: false,
      toggleRouteMap: () =>
        set((state) => ({ isRouteMapOpen: !state.isRouteMapOpen })),
      setIsRouteMapOpen: (val) => set({ isRouteMapOpen: Boolean(val) }),

      setCompanion: (mood, dialogue) =>
        set({ companionMood: mood, companionDialogue: dialogue }),

      setLoading: (isLoading) => set({ isLoading }),

      setApiError: (err) =>
        set({
          apiError: err,
          isLoading: false,
          companionMood: "uneasy-left",
          companionDialogue:
            "Los servidores titubearon un segundo... dale a reintentar y lo volvemos a empujar.",
        }),

      clearApiError: () => set({ apiError: null }),

      setStepOptions: (stepKey, options) =>
        set((state) => ({
          generatedOptions: {
            ...state.generatedOptions,
            [stepKey]: options,
          },
        })),

      updateBlueprint: (fields) =>
        set((state) => ({
          blueprint: { ...state.blueprint, ...fields },
        })),

      goToStep: (stepNumber) =>
        set({ currentStep: stepNumber, apiError: null }),

      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
          apiError: null,
        })),

      // Trunca y purga en cascada todo lo posterior a `fromStep`
      truncateWorkflowFrom: (fromStep) =>
        set((state) => {
          const blueprint = { ...state.blueprint };
          DECISION_STATIONS.forEach((station) => {
            if (station.stepNumber > fromStep) {
              blueprint[station.blueprintKey] = getEmptyValue(
                station.blueprintKey,
              );
            }
          });

          return {
            currentStep: fromStep,
            generatedOptions: filterNumericOptions(
              state.generatedOptions,
              (step) => step <= fromStep,
            ),
            blueprint,
            companionMood: "curious",
            companionDialogue:
              "Camino reiniciado desde este punto. Elige de nuevo y recalcularemos la ruta.",
          };
        }),

      cancelRequest: () => {
        if (activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }
        set({
          isLoading: false,
          companionMood: "idle",
          companionDialogue: "Petición cancelada. Ajustemos la idea.",
        });
      },

      // Registra la petición activa; una petición nueva cancela la anterior
      registerAbortController: (controller) => {
        if (activeAbortController && activeAbortController !== controller) {
          activeAbortController.abort();
        }
        activeAbortController = controller;
      },

      releaseAbortController: (controller) => {
        if (activeAbortController === controller) {
          activeAbortController = null;
        }
      },

      // Carga dinámica de proyectos traídos desde Supabase
      loadProjectFromCloud: (project) => {
        const row = Array.isArray(project.blueprints)
          ? project.blueprints[0] || {}
          : project.blueprints || {};

        const restoredBlueprint = dbRowToBlueprint(row);
        // `title` puede ser un fragmento de la idea: nunca se usa como nombre.
        restoredBlueprint.idea = restoredBlueprint.idea || project.title || "";

        // Reconstruye una opción por estación a partir de la decisión guardada
        const restoredOptions = {};
        let lastCompletedStep = 0;

        DECISION_STATIONS.forEach(
          ({ stepNumber, blueprintKey, optionsKey }) => {
            const value = restoredBlueprint[blueprintKey];
            if (!optionsKey || !hasDecisionValue(value)) return;

            const items =
              stepNumber === 1
                ? [
                    {
                      name: value,
                      style: "Guardado",
                      tagline: "Elegido previamente",
                      rationale: "Nombre cargado desde la nube.",
                    },
                  ]
                : Array.isArray(value)
                  ? value
                  : [value];

            // Pasa por el contrato: datos antiguos (p. ej. `pro`/`con`) se normalizan
            restoredOptions[stepNumber] = normalizeStepResponse(stepNumber, {
              [optionsKey]: items,
            }).data;
            lastCompletedStep = Math.max(lastCompletedStep, stepNumber);
          },
        );

        // Posicionamos estrictamente en el último paso que tiene selección real
        const targetStep = lastCompletedStep > 0 ? lastCompletedStep : 1;

        set({
          cloudProjectId: project.id,
          currentStep: targetStep,
          isMapCardActive: false,
          blueprint: restoredBlueprint,
          generatedOptions: restoredOptions,
          companionMood: "happy",
          companionDialogue: `Proyecto "${project.title}" cargado en la Estación ${targetStep}. Puedes revisar tu elección o avanzar con "Paso siguiente".`,
        });

        return targetStep;
      },

      startNewMap: (newIdea, context = "startup") => {
        if (activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }
        set({
          currentStep: 0,
          currentIdeaDraft: "",
          cloudProjectId: null,
          isMapCardActive: false,
          isRouteMapOpen: false,
          isLoading: false,
          apiError: null,
          companionMood: "idle",
          companionDialogue: `Iniciando nuevo análisis para: "${newIdea}".`,
          blueprint: createInitialBlueprint({ idea: newIdea, context }),
          generatedOptions: {},
        });
      },

      clearAllMemory: () => {
        if (activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }
        try {
          localStorage.removeItem("dev-idea-blueprint-cache");
        } catch (e) {
          console.error(e);
        }
        set({
          currentStep: 0,
          currentIdeaDraft: "",
          cloudProjectId: null,
          isMapCardActive: false,
          isRouteMapOpen: false,
          isLoading: false,
          apiError: null,
          companionMood: "idle",
          companionDialogue: "Memoria vaciada por completo. Lienzo en blanco.",
          blueprint: createInitialBlueprint(),
          generatedOptions: {},
        });
      },
    }),
    {
      name: "dev-idea-blueprint-cache",
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // v0 -> v1: elimina alias de texto/step_X en generatedOptions y mueve las
      //           claves que StationNode escribía por error (layout, deploy, ai-ecosystem).
      // v1 -> v2: normaliza las opciones cacheadas al contrato unificado
      //           (companionMood/companionComment, pros/cons, ids únicos).
      migrate: (persisted, version) => {
        if (!persisted) return persisted;
        if (version >= 1) {
          return version >= 2
            ? persisted
            : {
                ...persisted,
                generatedOptions: normalizeAllOptions(
                  persisted.generatedOptions,
                ),
              };
        }
        const legacy = { ...(persisted.blueprint || {}) };
        const renames = {
          layout: "selectedLayout",
          deploy: "selectedDeploy",
          "ai-ecosystem": "selectedAiEcosystem",
        };
        Object.entries(renames).forEach(([oldKey, newKey]) => {
          if (legacy[oldKey] && !legacy[newKey])
            legacy[newKey] = legacy[oldKey];
          delete legacy[oldKey];
        });
        return {
          ...persisted,
          blueprint: createInitialBlueprint(legacy),
          generatedOptions: normalizeAllOptions(
            filterNumericOptions(persisted.generatedOptions),
          ),
        };
      },
      partialize: (state) => ({
        blueprint: state.blueprint,
        generatedOptions: state.generatedOptions,
        cloudProjectId: state.cloudProjectId,
      }),
    },
  ),
);
