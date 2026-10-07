"use client";

import { useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";

export function FloatingControls() {
  const currentStep = useDecisionStore((state) => state.currentStep);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const cancelRequest = useDecisionStore((state) => state.cancelRequest);
  const resetProject = useDecisionStore((state) => state.resetProject);
  const previousStep = useDecisionStore((state) => state.previousStep);

  const [showConfirmReset, setShowConfirmReset] = useState(false);

  return (
    <aside className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      {/* Botón de Cancelación Rápida (Solo visible si la IA está generando) */}
      {isLoading && (
        <button
          type="button"
          onClick={cancelRequest}
          title="Cancelar generación de IA"
          className="px-3.5 py-2 rounded-xl bg-red-950/80 border border-red-800/80 text-red-200 hover:bg-red-900/90 text-xs font-mono flex items-center gap-1.5 backdrop-blur-md shadow-2xl transition-all animate-pulse cursor-pointer"
        >
          <span className="w-2 h-2 rounded-full bg-red-400" />
          <span>Cancelar IA</span>
        </button>
      )}

      {/* Dock de navegación lateral */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-neutral-900/85 border border-neutral-800 backdrop-blur-xl shadow-2xl">
        {/* Volver Atrás (si no estamos en Estación 0) */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={previousStep}
            disabled={isLoading}
            title="Volver a la estación anterior"
            className="p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </button>
        )}

        {/* Botón Reiniciar con Confirmación Segura */}
        {showConfirmReset ? (
          <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
            <span className="text-[10px] font-mono text-neutral-400 px-2">
              ¿Reiniciar?
            </span>
            <button
              type="button"
              onClick={() => {
                resetProject();
                setShowConfirmReset(false);
              }}
              className="px-2 py-1 bg-red-900/80 hover:bg-red-800 text-white rounded text-[10px] font-mono cursor-pointer"
            >
              Sí
            </button>
            <button
              type="button"
              onClick={() => setShowConfirmReset(false)}
              className="px-2 py-1 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded text-[10px] font-mono cursor-pointer"
            >
              No
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setShowConfirmReset(true)}
            title="Reiniciar y borrar mapa actual"
            className="p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        )}
      </div>
    </aside>
  );
}
