"use client";

import { useDecisionStore } from "@/hooks/useDecisionStore";
import {
  highestStepOf,
  nextStepInMode,
  optionsForStep,
} from "@/config/stations.config";

/**
 * Selectores únicos de navegación (antes había 7 variantes distintas por estación).
 *
 * - highestStep: paso más avanzado con opciones generadas (o el actual si es mayor).
 * - isStepLocked: una estación entra en "Modo Consulta" cuando ya existe la
 *   siguiente generada; para cambiarla hay que "Reescribir desde aquí".
 */
export function selectHighestStep(state) {
  return Math.max(state.currentStep, highestStepOf(state.generatedOptions));
}

export function isStepLocked(state, stepNumber) {
  // La siguiente estación DEL MODO (las que el modo omite no cuentan)
  const next = nextStepInMode(stepNumber, state.blueprint?.mode);
  return next !== null && Boolean(optionsForStep(state.generatedOptions, next));
}

/** Estado de navegación de una estación + acciones de Modo Consulta. */
export function useStationNavigation(stepNumber) {
  const highestStep = useDecisionStore(selectHighestStep);
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, stepNumber));
  const goToStep = useDecisionStore((s) => s.goToStep);
  const truncateWorkflowFrom = useDecisionStore((s) => s.truncateWorkflowFrom);

  return {
    highestStep,
    isLockedHistory,
    returnToFlow: () => goToStep(highestStep),
    rewriteFromHere: () => truncateWorkflowFrom(stepNumber),
  };
}
