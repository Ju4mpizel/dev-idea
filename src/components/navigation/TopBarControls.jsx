"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { LAST_STEP, nextStepInMode } from "@/config/stations.config";
import { CloudSyncBadge } from "@/components/navigation/CloudSyncBadge";
import { selectHighestStep } from "@/hooks/useStationNavigation";
import {
  ArrowLeft,
  ArrowRight,
  Trash2,
  Pause,
  RefreshCw,
  Map as MapIcon,
  Lightbulb,
} from "lucide-react";

export function TopBarControls() {
  const isLoading = useDecisionStore((state) => state.isLoading);
  const cancelRequest = useDecisionStore((state) => state.cancelRequest);
  const clearAllMemory = useDecisionStore((state) => state.clearAllMemory);
  const currentStep = useDecisionStore((state) => state.currentStep);
  const previousStep = useDecisionStore((state) => state.previousStep);
  const goToStep = useDecisionStore((state) => state.goToStep);

  const isRouteMapOpen = useDecisionStore((state) => state.isRouteMapOpen);
  const toggleRouteMap = useDecisionStore((state) => state.toggleRouteMap);
  const isPlanOpen = useDecisionStore((state) => state.isPlanOpen);
  const togglePlan = useDecisionStore((state) => state.togglePlan);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  const maxStepReached = useDecisionStore(selectHighestStep);
  const mode = useDecisionStore((state) => state.blueprint.mode);
  // Siguiente estación DEL MODO (en Rápido, de Requisitos se salta a Stack)
  const nextStep = nextStepInMode(currentStep, mode);

  const canGoNext =
    currentStep > 0 &&
    nextStep !== null &&
    nextStep <= maxStepReached &&
    currentStep < LAST_STEP;

  return (
    <>
      <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-0.5 sm:gap-1.5 p-1 rounded-2xl bg-neutral-900/80 border border-neutral-800/90 backdrop-blur-md select-none shadow-lg">
        {/* Indicador de Carga */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-xl bg-neutral-950 border border-emerald-500/40 text-emerald-400 shrink-0"
            >
              <RefreshCw className="w-3 h-3 animate-spin shrink-0 text-emerald-400" />
              <span className="hidden sm:inline text-[11px] font-mono whitespace-nowrap">
                Generando...
              </span>
              <button
                type="button"
                onClick={cancelRequest}
                title="Pausar generación"
                className="flex items-center gap-1 ml-0.5 sm:ml-1 px-1 sm:px-1.5 py-0.5 rounded-md bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-400 transition-colors cursor-pointer text-[9px] sm:text-[10px] font-mono"
              >
                <Pause className="w-2.5 h-2.5 fill-current" />
                <span className="hidden md:inline">Pausar</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Estado del autoguardado en la nube */}
        {currentStep > 0 && <CloudSyncBadge compact />}

        {/* Ver / Ocultar Mapa */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={toggleRouteMap}
            aria-label={isRouteMapOpen ? "Ocultar mapa" : "Ver mapa de ruta"}
            className={`min-h-9 flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 ${
              isRouteMapOpen
                ? "bg-white text-neutral-950 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                : "hover:bg-neutral-800/80 text-neutral-300 hover:text-white"
            }`}
          >
            <MapIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {isRouteMapOpen ? "Ocultar" : "Mapa"}
            </span>
          </button>
        )}

        {/* 💡 Mi plano: todo lo decidido hasta ahora */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={togglePlan}
            aria-pressed={isPlanOpen}
            aria-label={isPlanOpen ? "Cerrar mi plano" : "Ver mi plano"}
            title="Mi plano: lo que elegiste hasta ahora"
            className={`min-h-9 min-w-9 flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer shrink-0 ${
              isPlanOpen
                ? "bg-amber-400 text-neutral-950 font-semibold shadow-[0_0_15px_rgba(251,191,36,0.35)]"
                : "hover:bg-neutral-800/80 text-amber-300 hover:text-amber-200"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Mi plano</span>
          </button>
        )}

        {currentStep > 0 && (
          <div className="hidden sm:block w-[1px] h-4 bg-neutral-800 mx-0.5 shrink-0" />
        )}

        {/* Botón: Paso anterior */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={previousStep}
            disabled={isLoading}
            aria-label="Estación anterior"
            className="min-h-9 min-w-9 flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden md:inline">Anterior</span>
          </button>
        )}

        {/* Botón: Paso siguiente */}
        {canGoNext && (
          <button
            type="button"
            onClick={() => goToStep(nextStep)}
            disabled={isLoading}
            aria-label="Estación siguiente"
            className="min-h-9 min-w-9 flex items-center justify-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono transition-colors cursor-pointer shrink-0"
          >
            <span className="hidden md:inline">Siguiente</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </button>
        )}

        {currentStep > 0 && (
          <div className="hidden sm:block w-[1px] h-4 bg-neutral-800 mx-0.5 shrink-0" />
        )}

        {/* Botón: Purgar Memoria */}
        <button
          type="button"
          onClick={() => setConfirmClearOpen(true)}
          title="Purgar memoria"
          aria-label="Purgar memoria"
          className="min-h-9 min-w-9 justify-center p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-neutral-800/80 text-neutral-500 hover:text-red-400 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Purgar</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={clearAllMemory}
        variant="danger"
        tag="Memoria Volátil"
        title="¿Limpiar toda la memoria del proyecto?"
        description="Se descartarán las opciones calculadas en este borrador local. Si lo guardaste en la nube, seguirá disponible en tu cuenta."
        confirmText="Purgar Memoria"
        cancelText="Conservar"
      />
    </>
  );
}
