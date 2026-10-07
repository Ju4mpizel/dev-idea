import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

const INITIAL_BLUEPRINT = {
  idea: "",
  context: "startup",
  selectedName: "",
  selectedStack: null,
  selectedArchitecture: null,
  selectedDiagrams: [],
  architectureNotes: "",
};

let activeAbortController = null;

export const useDecisionStore = create(
  persist(
    (set, get) => ({
      currentStep: 0,
      currentIdeaDraft: "",
      setCurrentIdeaDraft: (draft) => set({ currentIdeaDraft: draft }),

      isLoading: false,
      apiError: null,

      companionMood: "idle",
      companionDialogue: "Cuéntame qué quieres armar y calibramos el camino.",

      blueprint: INITIAL_BLUEPRINT,
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

      // Trunca y purga en cascada desde un paso en adelante (para reescribir camino)
      truncateWorkflowFrom: (fromStep) =>
        set((state) => {
          const newGeneratedOptions = { ...state.generatedOptions };
          const newBlueprint = { ...state.blueprint };

          // Purgar de la memoria todas las estaciones posteriores
          Object.keys(newGeneratedOptions).forEach((key) => {
            const num = Number(key);
            if (!isNaN(num) && num > fromStep) {
              delete newGeneratedOptions[key];
            }
          });

          // Limpiar del blueprint según el paso donde nos encontramos
          if (fromStep <= 1) {
            newBlueprint.selectedStack = null;
            newBlueprint.selectedArchitecture = null;
            newBlueprint.selectedDiagrams = [];
            newBlueprint.architectureNotes = "";
            delete newGeneratedOptions["stack"];
            delete newGeneratedOptions["architecture"];
          } else if (fromStep === 2) {
            newBlueprint.selectedArchitecture = null;
            newBlueprint.selectedDiagrams = [];
            newBlueprint.architectureNotes = "";
            delete newGeneratedOptions["architecture"];
          }

          return {
            generatedOptions: newGeneratedOptions,
            blueprint: newBlueprint,
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

      registerAbortController: (controller) => {
        activeAbortController = controller;
      },

      startNewMap: (newIdea, context = "startup") => {
        if (activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }
        set({
          currentStep: 0,
          currentIdeaDraft: "",
          isMapCardActive: false,
          isRouteMapOpen: false,
          isLoading: false,
          apiError: null,
          companionMood: "idle",
          companionDialogue: `Iniciando nuevo análisis para: "${newIdea}".`,
          blueprint: {
            ...INITIAL_BLUEPRINT,
            idea: newIdea,
            context: context,
          },
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
          isMapCardActive: false,
          isRouteMapOpen: false,
          isLoading: false,
          apiError: null,
          companionMood: "idle",
          companionDialogue: "Memoria vaciada por completo. Lienzo en blanco.",
          blueprint: INITIAL_BLUEPRINT,
          generatedOptions: {},
        });
      },
    }),
    {
      name: "dev-idea-blueprint-cache",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        blueprint: state.blueprint,
        generatedOptions: state.generatedOptions,
      }),
    },
  ),
);
