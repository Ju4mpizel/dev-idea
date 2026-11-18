import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import {
  DECISION_STATIONS,
  createInitialBlueprint,
  dbRowToBlueprint,
  getEmptyValue,
  getStationById,
  hasDecisionValue,
  highestStepOf,
  resolveStation,
  toIdKeyedOptions,
} from "@/config/stations.config";
import { normalizeStepResponse } from "@/lib/stepContracts";

// Versión del esquema persistido en localStorage (ver `migrate` al final).
const STORE_VERSION = 5;
const STORAGE_KEY = "dev-idea-blueprint-cache";

/** Normaliza todas las opciones cacheadas al contrato vigente. */
function normalizeAllOptions(options = {}) {
  return Object.fromEntries(
    Object.entries(options).map(([stationId, data]) => [
      stationId,
      normalizeStepResponse(stationId, data).data,
    ]),
  );
}

/** Conserva las cartas de las estaciones cuyo paso cumple `keep(stepNumber)`. */
function filterOptionsByStep(options = {}, keep = () => true) {
  return Object.fromEntries(
    Object.entries(options).filter(([id]) => {
      const station = getStationById(id);
      return station && keep(station.stepNumber);
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
      if (!hasDecisionValue(value)) {
        if (!skippable) break;
        options[station.id] = normalizeStepResponse(station.id, {
          skipped: true,
        }).data;
        continue;
      }
      options[station.id] = normalizeStepResponse(station.id, {}).data;
      continue;
    }
    if (!optionsKey) continue;

    if (!hasDecisionValue(value)) {
      if (!skippable) break;
      options[station.id] = normalizeStepResponse(station.id, {
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

    options[station.id] = normalizeStepResponse(station.id, {
      [optionsKey]: items,
    }).data;
  }
  return options;
}

/**
 * Blueprint y cartas tras descartar todo lo posterior a `fromStep`
 * (base de "Reescribir desde aquí" y de "Simular desde aquí").
 */
function truncatedAfter(state, fromStep) {
  const blueprint = { ...state.blueprint };
  DECISION_STATIONS.forEach((station) => {
    if (station.stepNumber > fromStep) {
      blueprint[station.blueprintKey] = getEmptyValue(station.blueprintKey);
    }
  });
  return {
    blueprint,
    generatedOptions: filterOptionsByStep(
      state.generatedOptions,
      (step) => step <= fromStep,
    ),
  };
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
      // Ticket de la idea actual (límite de ideas): viaja en cada generación
      ideaRunId: null,
      setIdeaRunId: (id) => set({ ideaRunId: id }),
      // Cupo de ideas del usuario: { unlimited, used, limit, nextFreeAt }
      ideaQuota: null,
      setIdeaQuota: (quota) => set({ ideaQuota: quota }),
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

      // Panel "¿Qué es...?" de la estación (Dev-i se mueve a su lado)
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

      // Proyecto de prueba (herramientas de desarrollo): nunca se sube a la nube
      isTestProject: false,
      // Cartas del proyecto de prueba: la "generación simulada" las vuelve a servir
      testFixture: null,
      loadTestProject: ({ blueprint, generatedOptions, simulatedOptions }) => {
        abortActiveRequest();
        const fixture = normalizeAllOptions(toIdKeyedOptions(generatedOptions));
        set({
          isTestProject: true,
          // Cartas cargadas + las que solo sirve la simulación (p. ej. el cierre)
          testFixture: { ...fixture, ...(simulatedOptions || {}) },
          simulationRequest: null,
          ideaRunId: null,
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
          blueprint: createInitialBlueprint(blueprint),
          generatedOptions: fixture,
          companionMood: "proud",
          companionDialogue:
            "Proyecto de prueba cargado: todo decidido hasta el Deploy. Arma tu kit de IA cuando quieras.",
        });
      },

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

      // `stationRef`: id de la estación ("stack"); también acepta su número
      setStepOptions: (stationRef, options) =>
        set((state) => {
          const id = resolveStation(stationRef)?.id;
          if (!id) return {};
          return {
            generatedOptions: { ...state.generatedOptions, [id]: options },
          };
        }),

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
        set((state) => ({
          ...truncatedAfter(state, fromStep),
          currentStep: fromStep,
          companionMood: "curious",
          companionDialogue:
            "Camino reiniciado desde este punto. Elige de nuevo y recalcularemos la ruta.",
        })),

      // Modo prueba: descarta desde `stepNumber` (incluida) y pide al lienzo que
      // "regenere" esa estación con las cartas de prueba tras una carga simulada
      simulationRequest: null,
      simulateFromStep: (stepNumber) =>
        set((state) => ({
          ...truncatedAfter(state, stepNumber - 1),
          currentStep: stepNumber,
          isLoading: true,
          apiError: null,
          simulationRequest: { step: stepNumber, nonce: Date.now() },
        })),
      // Lo consume una sola vez el lienzo que esté montado
      consumeSimulation: () => {
        const request = useDecisionStore.getState().simulationRequest;
        if (request) set({ simulationRequest: null });
        return request;
      },

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
        // Filas antiguas guardaban las cartas por número de paso: se traducen a id
        const savedOptions = toIdKeyedOptions(row.generated_options || {});
        const restoredOptions = Object.keys(savedOptions).length
          ? normalizeAllOptions(savedOptions)
          : rebuildOptionsFromDecisions(restoredBlueprint);

        const lastStep = highestStepOf(restoredOptions);
        const targetStep = Math.max(
          1,
          Math.min(Number(project.current_step) || lastStep, lastStep || 1),
        );

        set({
          isTestProject: false,
          testFixture: null,
          simulationRequest: null,
          cloudProjectId: project.id,
          ideaRunId: project.idea_run_id || null,
          currentStep: targetStep,
          isMapCardActive: false,
          blueprint: restoredBlueprint,
          generatedOptions: restoredOptions,
          companionMood: "happy",
          companionDialogue: `Proyecto "${project.title}" cargado en la Estación ${targetStep}. Puedes revisar tu elección o seguir avanzando.`,
        });

        return targetStep;
      },

      // `ideaRunId`: ticket de la idea que emite el servidor (null = sin límite)
      startNewMap: (newIdea, context = "startup", ideaRunId = null) => {
        abortActiveRequest();
        set({
          isTestProject: false,
          testFixture: null,
          simulationRequest: null,
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
          ideaRunId,
          companionDialogue: `Iniciando nuevo análisis para: "${newIdea}".`,
          blueprint: createInitialBlueprint({ idea: newIdea, context }),
          generatedOptions: {},
        });
      },

      clearAllMemory: () => {
        abortActiveRequest();
        set({
          isTestProject: false,
          testFixture: null,
          simulationRequest: null,
          ideaRunId: null,
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
      // Migraciones del localStorage:
      // - v0/v1/v2: el mapa pasó de 11 a 14 estaciones; las decisiones antiguas ya
      //   no encajan, así que se conserva la idea, el contexto y el nombre.
      // - v3: cartas por número de paso, sin "Tipo de sistema".
      // - v4: cartas por número de paso, con "Tipo de sistema" en el paso 2.
      // - v5 (actual): cartas indexadas por id de estación; reordenar ya no
      //   obliga a migrar.
      migrate: (persisted, version) => {
        if (!persisted || version >= STORE_VERSION) return persisted;
        if (version === 3 || version === 4) {
          return {
            ...persisted,
            generatedOptions: toIdKeyedOptions(
              persisted.generatedOptions,
              version,
            ),
          };
        }
        const old = persisted.blueprint || {};
        const naming = toIdKeyedOptions(persisted.generatedOptions, 3);
        return {
          ...persisted,
          cloudProjectId: null,
          blueprint: createInitialBlueprint({
            idea: old.idea || "",
            context: old.context || "startup",
            selectedName: old.selectedName || "",
          }),
          generatedOptions: normalizeAllOptions(
            naming.naming ? { naming: naming.naming } : {},
          ),
        };
      },
      partialize: (state) => ({
        blueprint: state.blueprint,
        generatedOptions: state.generatedOptions,
        cloudProjectId: state.cloudProjectId,
        ideaRunId: state.ideaRunId,
        strobiColor: state.strobiColor,
        isTestProject: state.isTestProject,
        testFixture: state.testFixture,
      }),
    },
  ),
);
