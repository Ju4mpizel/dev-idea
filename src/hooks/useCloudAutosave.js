"use client";

import { useEffect } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { syncProjectToCloud } from "@/services/projectService";
import { LAST_STEP, highestStepOf } from "@/config/stations.config";

// Espera tras el último cambio antes de guardar (agrupa ráfagas de cambios)
const DEBOUNCE_MS = 1500;

// Cola única: nunca hay dos guardados a la vez. Así el primer guardado (POST)
// termina y fija `cloudProjectId` antes de que el siguiente haga PUT, y no se
// crean proyectos duplicados.
let queue = Promise.resolve();

/** ¿Hay algo que valga la pena guardar? (una idea con al menos una estación) */
function hasProgress(state) {
  return (
    Boolean(state.blueprint.idea?.trim()) &&
    Object.keys(state.generatedOptions).length > 0
  );
}

async function saveSnapshot() {
  const state = useDecisionStore.getState();
  if (!state.currentUser || !hasProgress(state)) return;

  const highest = Math.max(
    state.currentStep,
    highestStepOf(state.generatedOptions),
  );

  state.setCloudSync("saving");
  try {
    const savedId = await syncProjectToCloud({
      projectId: state.cloudProjectId,
      blueprint: state.blueprint,
      generatedOptions: state.generatedOptions,
      currentStep: state.currentStep,
      isCompleted: highest >= LAST_STEP,
    });
    const latest = useDecisionStore.getState();
    // Si mientras tanto se empezó otro mapa, no se pisa su id
    if (savedId && latest.blueprint.idea === state.blueprint.idea) {
      latest.setCloudProjectId(savedId);
    }
    latest.setCloudSync("saved");
  } catch (err) {
    console.error("[Autoguardado]", err);
    useDecisionStore
      .getState()
      .setCloudSync("error", err?.message || "No se pudo guardar en la nube");
  }
}

/** Encola un guardado inmediato (también lo usa el botón de reintento). */
export function saveToCloudNow() {
  queue = queue.then(saveSnapshot, saveSnapshot);
  return queue;
}

/**
 * Autoguardado en Supabase: con sesión iniciada, cada cambio del blueprint, de
 * las cartas generadas o de la estación actual se guarda tras una pausa breve.
 */
export function useCloudAutosave() {
  const userId = useDecisionStore((s) => s.currentUser?.id);

  useEffect(() => {
    if (!userId) return undefined;
    let timer = null;

    const schedule = () => {
      clearTimeout(timer);
      timer = setTimeout(saveToCloudNow, DEBOUNCE_MS);
    };

    // Al iniciar sesión con un mapa local en curso, se sube enseguida
    if (hasProgress(useDecisionStore.getState())) schedule();

    const unsubscribe = useDecisionStore.subscribe((state, prev) => {
      if (
        state.blueprint !== prev.blueprint ||
        state.generatedOptions !== prev.generatedOptions ||
        state.currentStep !== prev.currentStep
      ) {
        schedule();
      }
    });

    // Guardado pendiente antes de cerrar la pestaña
    const flush = () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
        saveToCloudNow();
      }
    };
    window.addEventListener("pagehide", flush);

    return () => {
      clearTimeout(timer);
      unsubscribe();
      window.removeEventListener("pagehide", flush);
    };
  }, [userId]);
}
