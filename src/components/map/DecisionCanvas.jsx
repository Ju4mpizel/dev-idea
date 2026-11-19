"use client";

import { useEffect } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { getStation } from "@/config/stations.config";
import { normalizeStepResponse } from "@/lib/stepContracts";
import { layoutSurfacesFor } from "@/data/layoutCatalog";
import { recommendDataStorage } from "@/data/databases";
import {
  claimIdeaRun,
  fetchTestProject,
  requestStepGeneration,
} from "@/services/projectService";

import { IdeaStation } from "./stations/IdeaStation";
import { NamingStation } from "./stations/NamingStation";
import { RequirementsStation } from "./stations/RequirementsStations";
import { UserStoriesStation } from "./stations/UserStoriesStation";
import { StackStation } from "./stations/StackStation";
import { SystemTypeStation } from "./stations/SystemTypeStation";
import { LayoutStation } from "./stations/LayoutStation";
import { DiagramsStation } from "./stations/DiagramsStation";
import { DeployStation } from "./stations/DeployStation";
import { AiEcosystemStation } from "./stations/AiEcosystemStation";
import {
  MethodologyStation,
  MorphismStation,
} from "./stations/VisualAndDataStations";
import { DatabaseStation } from "./stations/DatabaseStation";
import { OptionStation } from "./stations/OptionStation";
import { BlueprintShowcase } from "../workspace/BlueprintShowcase";

/**
 * Componente de cada estación por id. Las que no aparecen aquí usan la
 * estación genérica de cartas (p. ej. arquitectura).
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
  layout: LayoutStation,
  deploy: DeployStation,
  "ai-ecosystem": AiEcosystemStation,
};

// Contador global de peticiones: permite ignorar aborts de peticiones ya
// reemplazadas (global porque cada estación monta su propio lienzo al animarse).
let requestSeq = 0;

// Modo prueba: duración de la "generación" simulada
const SIMULATED_GENERATION_MS = 5000;

/** Espera `ms` o rechaza con AbortError si se cancela (botón Pausar). */
function waitAbortable(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("Simulación cancelada", "AbortError"));
    });
  });
}

/**
 * Generación simulada del modo prueba: misma carga y animaciones que con la IA,
 * pero tras 5 s sirve las cartas del proyecto de prueba. Nunca llama a Gemini.
 */
async function simulateStepGeneration(targetStep) {
  const store = useDecisionStore.getState();
  const station = getStation(targetStep);
  if (!station) return;

  const requestId = ++requestSeq;
  const controller = new AbortController();
  store.registerAbortController(controller);
  store.setLoading(true);
  store.clearApiError();
  store.goToStep(targetStep);
  store.setCompanion("thinking", "Generando cartas de prueba... (simulado, sin IA)");

  try {
    await waitAbortable(SIMULATED_GENERATION_MS, controller.signal);
    const latest = useDecisionStore.getState();
    const data = normalizeStepResponse(
      station.id,
      latest.testFixture?.[station.id] || {},
      latest.blueprint,
    ).data;
    latest.setStepOptions(station.id, data);
    latest.setCompanion(data.companionMood, data.companionComment);
  } catch (err) {
    if (err.name === "AbortError") {
      const latest = useDecisionStore.getState();
      if (requestId === requestSeq && latest.currentStep === targetStep) {
        latest.previousStep();
      }
      return;
    }
    useDecisionStore.getState().setApiError(err.message);
  } finally {
    const latest = useDecisionStore.getState();
    latest.releaseAbortController(controller);
    if (requestId === requestSeq) latest.setLoading(false);
  }
}

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
  const simulationRequest = useDecisionStore((state) => state.simulationRequest);

  // "Simular desde aquí" (modo prueba): el primer lienzo montado lo atiende
  useEffect(() => {
    if (!simulationRequest) return;
    const request = useDecisionStore.getState().consumeSimulation();
    if (request) simulateStepGeneration(request.step);
  }, [simulationRequest]);

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
    const targetStation = getStation(targetStep);
    const { generatedOptions: cachedOptions } = useDecisionStore.getState();
    const existingData = cachedOptions[targetStation?.id];

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
    if (targetStation?.local) {
      const data = normalizeStepResponse(targetStation.id, {}).data;
      setStepOptions(targetStation.id, data);
      setCompanion(data.companionMood, data.companionComment);
      goToStep(targetStep);
      return;
    }

    // Base de datos: primero el interruptor "¿guardará datos?" (sin IA). Solo
    // se genera cuando la estación manda su `databasePreference`.
    if (targetStation?.id === "database" && !extraFields?.databasePreference) {
      const storage = recommendDataStorage({
        ...useDecisionStore.getState().blueprint,
        ...(extraFields || {}),
      });
      const data = {
        companionMood: "curious",
        companionComment: `${storage.reason} ¿Lo confirmas?`,
        options: [],
        needsSetup: true,
      };
      setStepOptions(targetStation.id, data);
      setCompanion(data.companionMood, data.companionComment);
      goToStep(targetStep);
      return;
    }

    // Sistema sin pantallas (API, bot): no hay layout que pedirle a la IA
    if (
      targetStation?.id === "layout" &&
      layoutSurfacesFor({
        ...useDecisionStore.getState().blueprint,
        ...(extraFields || {}),
      }).length === 0
    ) {
      const data = {
        companionMood: "thinking",
        companionComment:
          "Tu sistema no tiene pantallas propias, así que aquí no hay layout que elegir. Confirma y seguimos.",
        options: [],
        headless: true,
      };
      setStepOptions(targetStation.id, data);
      setCompanion(data.companionMood, data.companionComment);
      goToStep(targetStep);
      return;
    }

    // Modo prueba: nunca se llama a Gemini; se simula la generación
    if (useDecisionStore.getState().isTestProject) {
      await simulateStepGeneration(targetStep);
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

      const data = await requestStepGeneration({
        stepId: station?.id || targetStep,
        blueprint: fullBlueprint,
        ideaRunId: useDecisionStore.getState().ideaRunId,
        signal: controller.signal,
      });
      setStepOptions(targetStation.id, data);

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

  /**
   * Empieza una idea nueva: primero el servidor abre su ticket (cupo de 2 ideas
   * cada 3 horas). Lanza ApiError 429 si no queda cupo (lo muestra la Estación 0).
   */
  const handleStartNew = async (newIdea, context) => {
    const ticket = await claimIdeaRun(newIdea, context);
    const { ideaRunId, ...quota } = ticket;
    useDecisionStore.getState().setIdeaQuota(quota);
    startNewMap(newIdea, context, ideaRunId);
    requestStepAndNavigate(1, undefined, true);
  };

  // Proyecto de prueba: todo viene listo del servidor (sin Gemini), carga al instante
  const handleLoadTestProject = async () => {
    const project = await fetchTestProject();
    useDecisionStore.getState().loadTestProject(project);
    goToStep(project.targetStep);
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
          onLoadTestProject={handleLoadTestProject}
        />
      </div>
    );
  }

  if (station.id === "workspace") {
    return (
      <div className="w-full max-w-5xl flex flex-col gap-4 sm:gap-6">
        <BlueprintShowcase
          data={generatedOptions[station.id]}
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
        data={generatedOptions[station.id]}
        onNext={(extraFields) =>
          requestStepAndNavigate(currentStep + 1, extraFields)
        }
        onGenerate={() => requestStepAndNavigate(currentStep, {}, true)}
        // Genera con datos que la estación junta antes (p. ej. la base favorita)
        onGenerateWith={(extraFields) =>
          requestStepAndNavigate(currentStep, extraFields, true)
        }
      />
    </div>
  );
}
