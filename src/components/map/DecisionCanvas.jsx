"use client";

import { useDecisionStore } from "@/hooks/useDecisionStore";
import { STATIONS } from "@/config/stations.config";

// Estaciones Modulares
import { Station0_Idea } from "./stations/Station0_Idea";
import { Station1_Naming } from "./stations/Station1_Naming";
import { Station2_Stack } from "./stations/Station2_Stack";
import { Station3_Architecture } from "./stations/Station3_Architecture";
import { StationNode } from "./stations/StationNode";
import { BlueprintShowcase } from "../workspace/BlueprintShowcase";

export function DecisionCanvas() {
  const currentStep = useDecisionStore((state) => state.currentStep);
  const goToStep = useDecisionStore((state) => state.goToStep);
  const previousStep = useDecisionStore((state) => state.previousStep);
  const startNewMap = useDecisionStore((state) => state.startNewMap);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const setLoading = useDecisionStore((state) => state.setLoading);
  const apiError = useDecisionStore((state) => state.apiError);
  const setApiError = useDecisionStore((state) => state.setApiError);
  const clearApiError = useDecisionStore((state) => state.clearApiError);
  const blueprint = useDecisionStore((state) => state.blueprint);
  const generatedOptions = useDecisionStore((state) => state.generatedOptions);
  const setStepOptions = useDecisionStore((state) => state.setStepOptions);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const registerAbortController = useDecisionStore(
    (state) => state.registerAbortController,
  );

  const requestStepAndNavigate = async (
    targetStep,
    blueprintPayload,
    forceNew = false,
  ) => {
    // Si ya existe en memoria, navegamos al instante
    const existingData =
      generatedOptions[targetStep] || generatedOptions[`step_${targetStep}`];

    if (!forceNew && existingData) {
      if (existingData?.dialogue || existingData?.companionComment) {
        setCompanion(
          existingData.mood || existingData.companionMood || "idle",
          existingData.dialogue || existingData.companionComment,
        );
      }
      goToStep(targetStep);
      return;
    }

    setLoading(true);
    clearApiError();

    // Movemos la vista a la estación destino para que muestre su skeleton de carga inmediatamente
    goToStep(targetStep);

    const controller = new AbortController();
    registerAbortController(controller);

    try {
      const currentStationConfig = STATIONS.find(
        (s) => s.stepNumber === Number(targetStep),
      );
      const stepId = currentStationConfig?.id || targetStep;

      const fullBlueprint = {
        ...blueprint,
        ...(blueprintPayload || {}),
      };

      const res = await fetch("/api/generate-step", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId,
          blueprint: fullBlueprint,
        }),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(
          json.error || "No se pudo generar la propuesta técnica.",
        );
      }

      const data = json.data;

      // Persistimos bajo clave numérica e ID de string
      setStepOptions(targetStep, data);
      setStepOptions(stepId, data);

      const dialogue =
        data.dialogue ||
        data.companionComment ||
        currentStationConfig?.defaultDialogue;
      const mood =
        data.mood ||
        data.companionMood ||
        currentStationConfig?.defaultMood ||
        "thinking";

      setCompanion(mood, dialogue);
    } catch (err) {
      if (err.name === "AbortError") return;
      setApiError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartNew = (newIdea, context) => {
    startNewMap(newIdea, context);
    const freshBlueprint = {
      idea: newIdea,
      context,
      selectedName: "",
      selectedStack: null,
      selectedArchitecture: null,
      selectedDiagrams: [],
      architectureNotes: "",
    };
    requestStepAndNavigate(1, freshBlueprint, true);
  };

  const handleResumeSaved = () => {
    goToStep(1);
  };

  // Pantalla de Error con Reintento
  if (apiError) {
    return (
      <div className="w-full max-w-lg p-6 rounded-2xl bg-neutral-900/80 border border-red-900/50 backdrop-blur-md flex flex-col items-center text-center gap-4">
        <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 font-bold text-sm">
          !
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">
            Respuesta interrumpida
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm">{apiError}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={previousStep}
            className="px-3.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 text-xs font-mono transition-colors cursor-pointer"
          >
            ← Volver
          </button>
          <button
            type="button"
            onClick={() => requestStepAndNavigate(currentStep, blueprint, true)}
            className="px-4 py-1.5 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Reintentar llamada
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl flex flex-col gap-4">
      {currentStep === 0 && (
        <Station0_Idea
          onStartNew={handleStartNew}
          onResumeSaved={handleResumeSaved}
        />
      )}

      {currentStep === 1 && (
        <Station1_Naming
          data={generatedOptions[1] || generatedOptions["naming"]}
          onNext={() => requestStepAndNavigate(2, blueprint)}
        />
      )}

      {currentStep === 2 && (
        <Station2_Stack
          data={generatedOptions[2] || generatedOptions["stack"]}
          onNext={(extraFields) => requestStepAndNavigate(3, extraFields)}
        />
      )}

      {currentStep === 3 && (
        <Station3_Architecture
          data={generatedOptions[3] || generatedOptions["architecture"]}
          onNext={() => requestStepAndNavigate(4, blueprint)}
        />
      )}

      {currentStep >= 4 && currentStep <= 9 && (
        <StationNode
          station={STATIONS.find((s) => s.stepNumber === currentStep)}
          data={
            generatedOptions[currentStep] ||
            generatedOptions[
              STATIONS.find((s) => s.stepNumber === currentStep)?.id
            ]
          }
          onAdvance={() => requestStepAndNavigate(currentStep + 1, blueprint)}
        />
      )}

      {currentStep === 10 && (
        <BlueprintShowcase
          data={generatedOptions[10] || generatedOptions["workspace"]}
          blueprint={blueprint}
        />
      )}
    </div>
  );
}
