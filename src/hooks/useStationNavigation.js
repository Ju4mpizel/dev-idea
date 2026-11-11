"use client";

import { useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";

/**
 * Selectores únicos de navegación (antes había 7 variantes distintas por estación).
 *
 * - highestStep: paso más avanzado con opciones generadas (o el actual si es mayor).
 * - isStepLocked: una estación entra en "Modo Consulta" cuando ya existe la
 *   siguiente generada; para cambiarla hay que "Reescribir desde aquí".
 */
export function selectHighestStep(state) {
  const generated = Object.keys(state.generatedOptions)
    .map(Number)
    .filter((n) => Number.isInteger(n));
  return Math.max(state.currentStep, ...generated);
}

export function isStepLocked(state, stepNumber) {
  return Boolean(state.generatedOptions[stepNumber + 1]);
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

/**
 * Selección de una opción por id sin `useEffect`: el valor efectivo se deriva en
 * cada render (elección del usuario -> decisión guardada -> primera opción), así
 * funciona aunque las opciones lleguen después de montar.
 */
export function useOptionSelection(options, savedOption) {
  const [pickedId, setPickedId] = useState(null);

  const selectedOption =
    options.find((o) => o.id === pickedId) ||
    options.find((o) => o.id === savedOption?.id) ||
    savedOption ||
    options[0] ||
    null;

  return {
    selectedOption,
    selectOption: (option) => setPickedId(option.id),
  };
}
