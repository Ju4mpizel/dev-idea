"use client";

import { useDecisionStore } from "@/hooks/useDecisionStore";
import { getStation } from "@/config/stations.config";
import { normalizeStepResponse } from "@/lib/stepContracts";

import { IdeaStation } from "./stations/IdeaStation";
import { NamingStation } from "./stations/NamingStation";
import { RequirementsStation } from "./stations/RequirementsStations";
import { UserStoriesStation } from "./stations/UserStoriesStation";
import { StackStation } from "./stations/StackStation";
import { SystemTypeStation } from "./stations/SystemTypeStation";
import { DiagramsStation } from "./stations/DiagramsStation";
import {
  DatabaseStation,
  MethodologyStation,
  MorphismStation,
} from "./stations/VisualAndDataStations";
import { OptionStation } from "./stations/OptionStation";
import { BlueprintShowcase } from "../workspace/BlueprintShowcase";

/**
 * Componente de cada estación por id. Las que no aparecen aquí usan la
 * estación genérica de cartas (arquitectura, layout, deploy, ecosistema IA).
 */
const STATION_COMPONENTS = {
  naming: NamingStation,
  "system-type": SystemTypeStation,
  requirements: RequirementsStation,
  "user-stories": UserStoriesStation,
  stack: StackStation,
  database: DatabaseStation,
  methodology: MethodologyStation,
  diagrams: DiagramsStation,
  morphism: MorphismStation,
};

// Contador global de peticiones: permite ignorar aborts de peticiones ya
// reemplazadas (global porque cada estación monta su propio lienzo al animarse).
let requestSeq = 0;

/**
 * `step` llega como prop (no del store) para que la estación que sale durante
 * la animación de cambio conserve su contenido hasta desaparecer.
 */
export function DecisionCanvas({ step: currentStep }) {
  const goToStep = useDecisionStore((state) => state.goToStep);
  const previousStep = useDecisionStore((state) => state.previousStep);
  const startNewMap = useDecisionStore((state) => state.startNewMap);
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

    // Estaciones de catálogo fijo: se resuelven al instante, sin Gemini
    const targetStation = getStation(targetStep);
    if (targetStation?.local) {
      const data = normalizeStepResponse(targetStep, {}).data;
      setStepOptions(targetStep, data);
      setCompanion(data.companionMood, data.companionComment);
      goToStep(targetStep);
      return;
    }

    const requestId = ++requestSeq;
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

      const json = await res.json().catch(() => ({}));

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
        const isLatest = requestId === requestSeq;
        const stillHere =
          useDecisionStore.getState().currentStep === targetStep;
        if (isLatest && stillHere) previousStep();
        return;
      }
      setApiError(err.message);
    } finally {
      releaseAbortController(controller);
      if (requestId === requestSeq) setLoading(false);
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

  const station = getStation(currentStep);

  if (!station || station.id === "idea") {
    return (
      <div className="w-full max-w-5xl flex flex-col gap-4 sm:gap-6">
        <IdeaStation
          onStartNew={handleStartNew}
          onResumeSaved={handleResumeSaved}
        />
      </div>
    );
  }

  if (station.id === "workspace") {
    return (
      <div className="w-full max-w-5xl flex flex-col gap-4 sm:gap-6">
        <BlueprintShowcase
          data={generatedOptions[currentStep]}
          blueprint={blueprint}
        />
      </div>
    );
  }

  const StationComponent = STATION_COMPONENTS[station.id] || OptionStation;

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-4 sm:gap-6">
      <StationComponent
        key={station.id}
        station={station}
        data={generatedOptions[currentStep]}
        onNext={(extraFields) =>
          requestStepAndNavigate(currentStep + 1, extraFields)
        }
        onGenerate={() => requestStepAndNavigate(currentStep, {}, true)}
      />
    </div>
  );
}
