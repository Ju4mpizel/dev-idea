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
const STORE_VERSION = 4;
const STORAGE_KEY = "dev-idea-blueprint-cache";

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

/**
 * Reconstruye las cartas de un proyecto antiguo (sin `generated_options`) a partir
 * de sus decisiones. Solo restaura la cadena CONTINUA de estaciones desde el inicio:
 * si falta una estación obligatoria, el usuario retoma desde ahí.
 */
function rebuildOptionsFromDecisions(blueprint) {
  const options = {};
  for (const station of DECISION_STATIONS) {
    const { stepNumber, blueprintKey, optionsKey, skippable } = station;
    const value = blueprint[blueprintKey];

    // Estaciones de catálogo fijo (sin cartas): basta con la decisión
    if (station.local) {
      if (!hasDecisionValue(value)) break;
      options[stepNumber] = normalizeStepResponse(stepNumber, {}).data;
      continue;
    }
    if (!optionsKey) continue;

    if (!hasDecisionValue(value)) {
      if (!skippable) break;
      options[stepNumber] = normalizeStepResponse(stepNumber, {
        [optionsKey]: [],
        skipped: true,
      }).data;
      continue;
    }

    const items =
      station.id === "naming"
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

    options[stepNumber] = normalizeStepResponse(stepNumber, {
      [optionsKey]: items,
    }).data;
  }
  return options;
}

let activeAbortController = null;

const abortActiveRequest = () => {
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
};

export const useDecisionStore = create(
  persist(
    (set) => ({
      currentStep: 0,
      currentIdeaDraft: "",
      setCurrentIdeaDraft: (draft) => set({ currentIdeaDraft: draft }),

      // Identificadores de sesión y sincronización con Supabase
      currentUser: null,
      setCurrentUser: (user) => set({ currentUser: user }),
      cloudProjectId: null,
      setCloudProjectId: (id) => set({ cloudProjectId: id }),
      // idle | saving | saved | error
      cloudSyncStatus: "idle",
      cloudSyncError: null,
      setCloudSync: (status, error = null) =>
        set({ cloudSyncStatus: status, cloudSyncError: error }),

      isLoading: false,
      apiError: null,

      companionMood: "idle",
      companionDialogue: "Cuéntame qué quieres armar y calibramos el camino.",
      strobiColor: "#5b7fe5",
      setStrobiColor: (hex) => set({ strobiColor: hex }),

      // Panel "¿Qué es...?" de la estación (Strobi se mueve a su lado)
      infoStationId: null,
      openStationInfo: (stationId) =>
        set({
          infoStationId: stationId,
          isRouteMapOpen: false,
          isPlanOpen: false,
        }),
      closeStationInfo: () => set({ infoStationId: null }),

      // Panel izquierdo con la tabla de categorías de la estación actual
      isCategoriesOpen: false,
      toggleCategories: () =>
        set((state) => ({ isCategoriesOpen: !state.isCategoriesOpen })),
      closeCategories: () => set({ isCategoriesOpen: false }),

      // Panel "💡 Mi plano": resumen de lo decidido (uno solo a la derecha)
      isPlanOpen: false,
      togglePlan: () =>
        set((state) => ({
          isPlanOpen: !state.isPlanOpen,
          infoStationId: null,
          isRouteMapOpen: false,
        })),
      closePlan: () => set({ isPlanOpen: false }),

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
        set((state) => ({
          isRouteMapOpen: !state.isRouteMapOpen,
          infoStationId: null,
          isPlanOpen: false,
        })),
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
        set({ currentStep: stepNumber, apiError: null, infoStationId: null }),

      previousStep: () =>
        set((state) => ({
          currentStep: Math.max(state.currentStep - 1, 0),
          apiError: null,
          infoStationId: null,
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
        abortActiveRequest();
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

        // Proyectos nuevos guardan todas las cartas; los antiguos se reconstruyen
        const savedOptions = filterNumericOptions(row.generated_options || {});
        const restoredOptions = Object.keys(savedOptions).length
          ? normalizeAllOptions(savedOptions)
          : rebuildOptionsFromDecisions(restoredBlueprint);

        const steps = Object.keys(restoredOptions).map(Number);
        const lastStep = steps.length ? Math.max(...steps) : 0;
        const targetStep = Math.max(
          1,
          Math.min(Number(project.current_step) || lastStep, lastStep || 1),
        );

        set({
          cloudProjectId: project.id,
          currentStep: targetStep,
          isMapCardActive: false,
          blueprint: restoredBlueprint,
          generatedOptions: restoredOptions,
          companionMood: "happy",
          companionDialogue: `Proyecto "${project.title}" cargado en la Estación ${targetStep}. Puedes revisar tu elección o seguir avanzando.`,
        });

        return targetStep;
      },

      startNewMap: (newIdea, context = "startup") => {
        abortActiveRequest();
        set({
          currentStep: 0,
          currentIdeaDraft: "",
          cloudProjectId: null,
          cloudSyncStatus: "idle",
          cloudSyncError: null,
          isMapCardActive: false,
          isRouteMapOpen: false,
          infoStationId: null,
          isPlanOpen: false,
          isLoading: false,
          apiError: null,
          companionMood: "idle",
          companionDialogue: `Iniciando nuevo análisis para: "${newIdea}".`,
          blueprint: createInitialBlueprint({ idea: newIdea, context }),
          generatedOptions: {},
        });
      },

      clearAllMemory: () => {
        abortActiveRequest();
        set({
          currentStep: 0,
          currentIdeaDraft: "",
          cloudProjectId: null,
          cloudSyncStatus: "idle",
          cloudSyncError: null,
          isMapCardActive: false,
          isRouteMapOpen: false,
          infoStationId: null,
          isPlanOpen: false,
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
      name: STORAGE_KEY,
      version: STORE_VERSION,
      storage: createJSONStorage(() => localStorage),
      // v0/v1/v2 -> v3: el mapa pasó de 11 a 14 estaciones (requisitos, historias
      // y base de datos se insertaron antes del stack). Las decisiones antiguas ya
      // no encajan en la nueva cadena, así que se conserva la idea, el contexto y el
      // nombre (estación 1, sin cambios) y el usuario retoma desde Requisitos.
      // v3 -> v4: se insertó "Tipo de sistema" como estación 2, así que las
      // cartas de la estación 2 en adelante se corren un puesto.
      migrate: (persisted, version) => {
        if (!persisted || version >= STORE_VERSION) return persisted;
        if (version === 3) {
          return {
            ...persisted,
            generatedOptions: Object.fromEntries(
              Object.entries(persisted.generatedOptions || {}).map(
                ([key, value]) => {
                  const step = Number(key);
                  return [
                    Number.isInteger(step) && step >= 2 ? String(step + 1) : key,
                    value,
                  ];
                },
              ),
            ),
          };
        }
        const old = persisted.blueprint || {};
        const naming = filterNumericOptions(
          persisted.generatedOptions,
          (step) => step === 1,
        );
        return {
          ...persisted,
          cloudProjectId: null,
          blueprint: createInitialBlueprint({
            idea: old.idea || "",
            context: old.context || "startup",
            selectedName: old.selectedName || "",
          }),
          generatedOptions: normalizeAllOptions(naming),
        };
      },
      partialize: (state) => ({
        blueprint: state.blueprint,
        generatedOptions: state.generatedOptions,
        cloudProjectId: state.cloudProjectId,
        strobiColor: state.strobiColor,
      }),
    },
  ),
);
