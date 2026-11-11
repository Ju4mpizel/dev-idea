"use client";

import { useRef } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { getStation } from "@/config/stations.config";

// Estaciones Modulares
import { Station0_Idea } from "./stations/Station0_Idea";
import { Station1_Naming } from "./stations/Station1_Naming";
import { Station2_Stack } from "./stations/Station2_Stack";
import { Station3_Architecture } from "./stations/Station3_Architecture";
import { Station4_Methodology } from "./stations/Station4_Methodology";
import { Station5_Diagrams } from "./stations/Station5_Diagrams";
import { Station6_Morphism } from "./stations/Station6_Morphism";
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
  const releaseAbortController = useDecisionStore(
    (state) => state.releaseAbortController,
  );

  // Identificador incremental: permite ignorar aborts de peticiones ya reemplazadas
  const requestSeqRef = useRef(0);

  /**
   * Navega a `targetStep` y, si no hay opciones en caché (o `forceNew`), las pide a Gemini.
   * El blueprint se lee del store en el momento exacto de la llamada y se combina con
   * los `extraFields` explícitos de la estación, evitando closures desactualizados.
   */
  const requestStepAndNavigate = async (
    targetStep,
    extraFields = {},
    forceNew = false,
  ) => {
    const { generatedOptions: cachedOptions } = useDecisionStore.getState();
    const existingData = cachedOptions[targetStep];

    if (!forceNew && existingData && Object.keys(existingData).length > 0) {
      if (existingData.companionComment) {
        setCompanion(
          existingData.companionMood || "idle",
          existingData.companionComment,
        );
      }
      goToStep(targetStep);
      return;
    }

    const requestId = ++requestSeqRef.current;
    const controller = new AbortController();
    registerAbortController(controller);

    setLoading(true);
    clearApiError();
    goToStep(targetStep);

    const station = getStation(targetStep);

    try {
      const fullBlueprint = {
        ...useDecisionStore.getState().blueprint,
        ...(extraFields || {}),
      };

      const res = await fetch("/api/generate-step", {
        method: "POST",
        signal: controller.signal,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stepId: station?.id || targetStep,
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
      setStepOptions(targetStep, data);

      // La API ya normaliza el contrato (src/lib/stepContracts.js)
      setCompanion(data.companionMood, data.companionComment);
    } catch (err) {
      if (err.name === "AbortError") {
        // Solo retrocedemos si el usuario canceló ESTA petición y sigue en su estación
        // (no si fue reemplazada por otra o si el mapa se reinició).
        const isLatest = requestId === requestSeqRef.current;
        const stillHere =
          useDecisionStore.getState().currentStep === targetStep;
        if (isLatest && stillHere) previousStep();
        return;
      }
      setApiError(err.message);
    } finally {
      releaseAbortController(controller);
      if (requestId === requestSeqRef.current) setLoading(false);
    }
  };

  const handleStartNew = (newIdea, context) => {
    startNewMap(newIdea, context);
    requestStepAndNavigate(1, undefined, true);
  };

  const handleResumeSaved = (targetStep) => {
    const stepToOpen =
      targetStep && targetStep > 0
        ? targetStep
        : currentStep && currentStep > 0
          ? currentStep
          : 1;
    goToStep(stepToOpen);
  };

  if (apiError) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-neutral-900/80 border border-red-900/50 backdrop-blur-md flex flex-col items-center text-center gap-3">
        <div className="w-9 h-9 rounded-full bg-red-950/60 border border-red-800 flex items-center justify-center text-red-400 font-bold text-sm">
          !
        </div>
        <div>
          <h3 className="text-sm font-semibold text-neutral-200">
            Respuesta interrumpida
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-xs">{apiError}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            type="button"
            onClick={previousStep}
            className="px-3 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900 text-neutral-300 hover:bg-neutral-800 text-xs font-mono transition-colors cursor-pointer"
          >
            ← Volver
          </button>
          <button
            type="button"
            onClick={() => requestStepAndNavigate(currentStep, undefined, true)}
            className="px-3.5 py-1.5 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-medium transition-colors cursor-pointer"
          >
            Reintentar llamada
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl flex flex-col gap-4 sm:gap-6">
      {currentStep === 0 && (
        <Station0_Idea
          onStartNew={handleStartNew}
          onResumeSaved={handleResumeSaved}
        />
      )}

      {currentStep === 1 && (
        <Station1_Naming
          data={generatedOptions[1]}
          onNext={(extraFields) => requestStepAndNavigate(2, extraFields)}
        />
      )}

      {currentStep === 2 && (
        <Station2_Stack
          data={generatedOptions[2]}
          onNext={(extraFields) => requestStepAndNavigate(3, extraFields)}
        />
      )}

      {currentStep === 3 && (
        <Station3_Architecture
          data={generatedOptions[3]}
          onNext={(extraFields) => requestStepAndNavigate(4, extraFields)}
        />
      )}

      {currentStep === 4 && (
        <Station4_Methodology
          data={generatedOptions[4]}
          onNext={(extraFields) => requestStepAndNavigate(5, extraFields)}
        />
      )}

      {currentStep === 5 && (
        <Station5_Diagrams
          data={generatedOptions[5]}
          onNext={(extraFields) => requestStepAndNavigate(6, extraFields)}
        />
      )}

      {currentStep === 6 && (
        <Station6_Morphism
          data={generatedOptions[6]}
          onNext={(extraFields) => requestStepAndNavigate(7, extraFields)}
        />
      )}

      {currentStep >= 7 && currentStep <= 9 && (
        <StationNode
          station={getStation(currentStep)}
          data={generatedOptions[currentStep]}
          onAdvance={(extraFields) =>
            requestStepAndNavigate(currentStep + 1, extraFields)
          }
        />
      )}

      {currentStep === 10 && (
        <BlueprintShowcase data={generatedOptions[10]} blueprint={blueprint} />
      )}
    </div>
  );
}
