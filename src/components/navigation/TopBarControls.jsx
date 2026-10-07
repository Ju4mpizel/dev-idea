"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Map, ArrowLeft, Trash2, Pause, RefreshCw } from "lucide-react";

export function TopBarControls() {
  const isLoading = useDecisionStore((state) => state.isLoading);
  const cancelRequest = useDecisionStore((state) => state.cancelRequest);
  const clearAllMemory = useDecisionStore((state) => state.clearAllMemory);
  const currentStep = useDecisionStore((state) => state.currentStep);
  const previousStep = useDecisionStore((state) => state.previousStep);

  const isRouteMapOpen = useDecisionStore((state) => state.isRouteMapOpen);
  const toggleRouteMap = useDecisionStore((state) => state.toggleRouteMap);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);

  return (
    <>
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900/80 border border-neutral-800/90 backdrop-blur-md select-none shadow-lg">
        {/* Indicador de Carga Compacto y Elegante */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-950 border border-emerald-500/40 text-emerald-400 shrink-0"
            >
              <RefreshCw className="w-3 h-3 animate-spin shrink-0 text-emerald-400" />
              <span className="text-[11px] font-mono whitespace-nowrap">
                Generando...
              </span>
              <button
                type="button"
                onClick={cancelRequest}
                title="Pausar / Cancelar generación"
                className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-md bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-400 transition-colors cursor-pointer text-[10px] font-mono"
              >
                <Pause className="w-2.5 h-2.5 fill-current" />
                <span>Pausar</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón: Ver Mapa / Ocultar Mapa */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={toggleRouteMap}
            title={
              isRouteMapOpen
                ? "Ocultar tarjeta de mapa"
                : "Mostrar tarjeta de mapa"
            }
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              isRouteMapOpen
                ? "bg-white text-neutral-950 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                : "hover:bg-neutral-800/80 text-neutral-300 hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{isRouteMapOpen ? "Ocultar Mapa" : "Ver Mapa"}</span>
          </button>
        )}

        {/* Separador fino */}
        {currentStep > 0 && (
          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />
        )}

        {/* Botón: Paso anterior */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={previousStep}
            disabled={isLoading}
            title="Volver a la estación anterior"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Paso anterior</span>
          </button>
        )}

        {/* Separador fino */}
        {currentStep > 0 && (
          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />
        )}

        {/* Botón: Purgar Memoria */}
        <button
          type="button"
          onClick={() => setConfirmClearOpen(true)}
          title="Purgar memoria y reiniciar lienzo"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-neutral-800/80 text-neutral-500 hover:text-red-400 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Purgar</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={clearAllMemory}
        variant="danger"
        tag="Memoria Volátil"
        title="¿Limpiar toda la memoria del proyecto?"
        description="Se descartarán las opciones calculadas, nombres y diagramas persistidos. Comenzarás de nuevo con el lienzo limpio."
        confirmText="Purgar Memoria"
        cancelText="Conservar"
      />
    </>
  );
}
