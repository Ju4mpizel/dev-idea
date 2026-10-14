import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { STATIONS } from "@/config/stations.config";

const INITIAL_BLUEPRINT = {
  idea: "",
  context: "startup",
  selectedName: "",
  selectedStack: null,
  selectedArchitecture: null,
  selectedMethodology: null,
  selectedDiagrams: [],
  selectedStyle: null,
  selectedLayout: null,
  selectedDeploy: null,
  selectedAiEcosystem: null,
  architectureNotes: "",
};

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

      // Trunca y purga en cascada desde un paso en adelante
      truncateWorkflowFrom: (fromStep) =>
        set((state) => {
          const newGeneratedOptions = { ...state.generatedOptions };
          const newBlueprint = { ...state.blueprint };

          // 1. Purgar opciones cacheadas posteriores
          Object.keys(newGeneratedOptions).forEach((key) => {
            const num = Number(key);
            if (!isNaN(num) && num > fromStep) {
              delete newGeneratedOptions[key];
            }
          });

          // 2. Limpieza dinámica del blueprint usando la lista de estaciones
          STATIONS.forEach((station) => {
            if (station.stepNumber > fromStep) {
              delete newGeneratedOptions[station.id];

              if (station.stepNumber === 1) {
                newBlueprint.selectedName = "";
              } else if (station.stepNumber === 2) {
                newBlueprint.selectedStack = null;
              } else if (station.stepNumber === 3) {
                newBlueprint.selectedArchitecture = null;
              } else if (station.stepNumber === 4) {
                newBlueprint.selectedMethodology = null;
              } else if (station.stepNumber === 5) {
                newBlueprint.selectedDiagrams = [];
              } else {
                newBlueprint[station.id] = null;
              }
            }
          });

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

      // Carga dinámica de proyectos traídos desde Supabase
      loadProjectFromCloud: (project) => {
        const bp = Array.isArray(project.blueprints)
          ? project.blueprints[0] || {}
          : project.blueprints || {};

        const restoredBlueprint = {
          ...INITIAL_BLUEPRINT,
          idea: bp.idea || project.title || "",
          context: bp.context || "startup",
          selectedName: bp.selected_name || project.title || "",
          selectedStack: bp.selected_stack || null,
          selectedArchitecture: bp.selected_architecture || null,
          selectedMethodology: bp.selected_methodology || null,
          selectedDiagrams: bp.selected_diagrams || [],
          selectedStyle: bp.selected_style || null,
          selectedLayout: bp.selected_layout || null,
          selectedDeploy: bp.selected_deploy || null,
          selectedAiEcosystem: bp.selected_ai_ecosystem || null,
          architectureNotes: bp.architecture_notes || "",
        };

        const restoredOptions = {};
        let lastCompletedStep = 0;

        // Construcción no hardcodeada basada en las decisiones que sí existen en el blueprint
        if (restoredBlueprint.selectedName) {
          restoredOptions[1] = {
            names: [
              {
                name: restoredBlueprint.selectedName,
                style: "Guardado",
                tagline: "Elegido previamente",
                rationale: "Nombre cargado desde la nube.",
              },
            ],
          };
          restoredOptions["naming"] = restoredOptions[1];
          lastCompletedStep = 1;
        }

        if (restoredBlueprint.selectedStack) {
          restoredOptions[2] = {
            stacks: [restoredBlueprint.selectedStack],
          };
          restoredOptions["stack"] = restoredOptions[2];
          lastCompletedStep = 2;
        }

        if (restoredBlueprint.selectedArchitecture) {
          restoredOptions[3] = {
            options: [restoredBlueprint.selectedArchitecture],
          };
          restoredOptions["architecture"] = restoredOptions[3];
          lastCompletedStep = 3;
        }

        if (restoredBlueprint.selectedMethodology) {
          restoredOptions[4] = {
            options: [restoredBlueprint.selectedMethodology],
          };
          restoredOptions["methodology"] = restoredOptions[4];
          lastCompletedStep = 4;
        }

        if (restoredBlueprint.selectedDiagrams?.length > 0) {
          restoredOptions[5] = {
            options: restoredBlueprint.selectedDiagrams,
          };
          restoredOptions["diagrams"] = restoredOptions[5];
          lastCompletedStep = 5;
        }

        if (restoredBlueprint.selectedStyle) {
          restoredOptions[6] = {
            options: [restoredBlueprint.selectedStyle],
          };
          restoredOptions["style"] = restoredOptions[6];
          lastCompletedStep = 6;
        }

        if (restoredBlueprint.selectedLayout) {
          restoredOptions[7] = {
            options: [restoredBlueprint.selectedLayout],
          };
          restoredOptions["layout"] = restoredOptions[7];
          lastCompletedStep = 7;
        }

        if (restoredBlueprint.selectedDeploy) {
          restoredOptions[8] = {
            options: [restoredBlueprint.selectedDeploy],
          };
          restoredOptions["deploy"] = restoredOptions[8];
          lastCompletedStep = 8;
        }

        if (restoredBlueprint.selectedAiEcosystem) {
          restoredOptions[9] = {
            options: [restoredBlueprint.selectedAiEcosystem],
          };
          restoredOptions["ai_ecosystem"] = restoredOptions[9];
          lastCompletedStep = 9;
        }

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
          cloudProjectId: null,
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
        cloudProjectId: state.cloudProjectId,
      }),
    },
  ),
);
