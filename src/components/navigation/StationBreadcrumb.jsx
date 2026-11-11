"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { STATIONS } from "@/config/stations.config";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { X, Check, Lightbulb, Flag, Lock, Sparkles } from "lucide-react";

// Geometría del recorrido: el SVG y los nodos comparten estas medidas, así la
// línea siempre pasa por el centro de cada nodo.
const COLUMN_WIDTH = 260;
const CENTER_X = COLUMN_WIDTH / 2;
const ROW_HEIGHT = 88; // alto fijo de cada fila (nodo 44px + etiqueta + aire)
const NODE_SIZE = 44;
const ZIGZAG = [0, -38, 0, 38, -38, 0, 38, -38, 0, 38, 0];

const nodeOffset = (index) => ZIGZAG[index % ZIGZAG.length];
const nodeCenter = (index) => ({
  x: CENTER_X + nodeOffset(index),
  y: index * ROW_HEIGHT + NODE_SIZE / 2,
});

export function StationBreadcrumb() {
  const currentStep = useDecisionStore((state) => state.currentStep);
  const goToStep = useDecisionStore((state) => state.goToStep);
  const generatedOptions = useDecisionStore((state) => state.generatedOptions);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const setIsResumingPreviousMap = useDecisionStore(
    (state) => state.setIsResumingPreviousMap,
  );
  const isRouteMapOpen = useDecisionStore((state) => state.isRouteMapOpen);
  const toggleRouteMap = useDecisionStore((state) => state.toggleRouteMap);

  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const activeNodeRef = useRef(null);

  // Auto-scroll al nodo activo cuando cambia de estación y el panel está abierto
  useEffect(() => {
    if (isRouteMapOpen && activeNodeRef.current) {
      activeNodeRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [currentStep, isRouteMapOpen]);

  if (currentStep === 0) return null;

  const currentStation =
    STATIONS.find((s) => s.stepNumber === currentStep) || STATIONS[1];

  const handleStationClick = (stationStep) => {
    if (isLoading) return;

    if (stationStep === 0) {
      setShowExitConfirm(true);
      return;
    }

    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      toggleRouteMap();
    }

    goToStep(stationStep);
  };

  const handleConfirmExit = () => {
    if (setIsResumingPreviousMap) setIsResumingPreviousMap(true);
    toggleRouteMap();
    goToStep(0);
    setShowExitConfirm(false);
  };

  // Verifica con exactitud si la estación está completada en memoria
  const checkIsCompleted = (station) => {
    if (station.stepNumber === 0) return true;

    const data = generatedOptions[station.stepNumber];

    return Boolean(data && Object.keys(data).length > 0);
  };

  return (
    <>
      <AnimatePresence>
        {isRouteMapOpen && (
          <>
            {/* Backdrop en móvil y tablet para aislar el modal */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={toggleRouteMap}
              className="lg:hidden fixed inset-0 z-40 bg-black/75 backdrop-blur-sm cursor-pointer"
            />

            {/* Panel de Mapa Lateral / Modal */}
            <motion.aside
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              className="fixed z-50 
                inset-x-4 top-[10dvh] max-h-[80dvh] mx-auto w-auto max-w-[340px]
                lg:inset-auto lg:top-20 lg:right-8 lg:w-[310px] lg:max-h-[calc(100vh-100px)]
                bg-neutral-900/95 border border-neutral-700/80 backdrop-blur-2xl rounded-3xl p-4 sm:p-5 flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.9)] ring-1 ring-white/10 overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-800 shrink-0">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-xl bg-neutral-800 border border-neutral-700 flex items-center justify-center text-emerald-400">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5">
                      <span>Ruta de Desarrollo</span>
                      {isLoading && (
                        <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
                      )}
                    </h3>
                    <span className="text-[10px] font-mono text-neutral-400">
                      Fase {currentStation.stepNumber} de 10
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleRouteMap}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Recorrido vertical en zigzag */}
              <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 relative px-1 scrollbar-thin">
                <div
                  className="relative mx-auto"
                  style={{
                    width: COLUMN_WIDTH,
                    height: STATIONS.length * ROW_HEIGHT,
                  }}
                >
                  {/* SVG animado del camino (mismas coordenadas que los nodos) */}
                  <svg
                    className="absolute inset-0 pointer-events-none"
                    width={COLUMN_WIDTH}
                    height={STATIONS.length * ROW_HEIGHT}
                    fill="none"
                  >
                    {STATIONS.map((_, i) => {
                      if (i === STATIONS.length - 1) return null;
                      const from = nodeCenter(i);
                      const to = nodeCenter(i + 1);
                      const midY = (from.y + to.y) / 2;
                      const d = `M ${from.x} ${from.y} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y}`;
                      const isPassed = currentStep > i;

                      return (
                        <g key={i}>
                          <path
                            d={d}
                            strokeWidth="2.5"
                            strokeDasharray="4 5"
                            className="stroke-neutral-800"
                          />
                          {isPassed && (
                            <motion.path
                              initial={{ pathLength: 0, opacity: 0 }}
                              animate={{ pathLength: 1, opacity: 1 }}
                              transition={{ duration: 0.6, ease: "easeInOut" }}
                              d={d}
                              strokeWidth="2.5"
                              strokeDasharray="4 5"
                              className="stroke-emerald-400"
                            />
                          )}
                        </g>
                      );
                    })}
                  </svg>

                  {/* Nodos de Estación */}
                  {STATIONS.map((station, index) => {
                    const isActive = currentStep === station.stepNumber;
                    const isCompleted = checkIsCompleted(station);
                    const canClick = !isLoading && (isCompleted || isActive);
                    const offsetX = nodeOffset(index);

                    return (
                      <div
                        key={station.id}
                        ref={isActive ? activeNodeRef : null}
                        style={{
                          height: ROW_HEIGHT,
                          transform: `translateX(${offsetX}px)`,
                        }}
                        className="relative z-10 flex flex-col items-center group"
                      >
                        <motion.button
                          type="button"
                          initial={false}
                          animate={
                            isActive
                              ? {
                                  scale: 1.08,
                                  transition: {
                                    duration: 0.3,
                                    ease: "easeOut",
                                  },
                                }
                              : { scale: 1 }
                          }
                          whileHover={canClick ? { scale: 1.15 } : {}}
                          whileTap={canClick ? { scale: 0.95 } : {}}
                          disabled={!canClick}
                          onClick={() => handleStationClick(station.stepNumber)}
                          className={`relative w-11 h-11 shrink-0 rounded-2xl flex items-center justify-center transition-colors duration-300 cursor-pointer ${
                            isActive
                              ? "bg-white text-neutral-950 shadow-[0_0_20px_rgba(255,255,255,0.45)] ring-2 ring-white/60"
                              : isCompleted
                                ? "bg-emerald-500 text-neutral-950 shadow-[0_0_14px_rgba(16,185,129,0.3)]"
                                : "bg-neutral-950/80 border border-neutral-800 text-neutral-600 opacity-40 cursor-not-allowed"
                          }`}
                        >
                          {isActive && (
                            <motion.span
                              animate={{
                                opacity: [0.35, 0.75, 0.35],
                                scale: [1, 1.18, 1],
                              }}
                              transition={{
                                duration: 2.2,
                                repeat: Infinity,
                                ease: "easeInOut",
                              }}
                              className="absolute -inset-1 rounded-2xl bg-white/20 pointer-events-none -z-10 blur-[2px]"
                            />
                          )}

                          {station.stepNumber === 0 ? (
                            <Lightbulb
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                isActive
                                  ? "text-neutral-950"
                                  : isCompleted
                                    ? "text-neutral-950"
                                    : "text-neutral-600"
                              }`}
                            />
                          ) : station.stepNumber === 10 ? (
                            <Flag
                              className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                isActive
                                  ? "text-neutral-950"
                                  : "text-neutral-400"
                              }`}
                            />
                          ) : isCompleted && !isActive ? (
                            <motion.div
                              initial={{ scale: 0, rotate: -45 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 20,
                              }}
                            >
                              <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                            </motion.div>
                          ) : !canClick ? (
                            <Lock className="w-3 h-3 text-neutral-700" />
                          ) : (
                            <span className="font-mono text-xs font-bold">
                              {station.stepNumber}
                            </span>
                          )}
                        </motion.button>

                        <div
                          className={`mt-1.5 px-2 py-0.5 rounded-lg text-[9px] font-mono whitespace-nowrap transition-all duration-300 ${
                            isActive
                              ? "bg-white text-neutral-950 font-bold scale-105 shadow-sm"
                              : isCompleted
                                ? "bg-neutral-950 text-neutral-300 border border-neutral-800"
                                : "text-neutral-600"
                          }`}
                        >
                          {station.stepNumber === 0
                            ? "00 · Entrada"
                            : station.stepNumber === 10
                              ? "⭐ ¡A Trabajar!"
                              : `${String(station.stepNumber).padStart(2, "0")} · ${station.title}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={showExitConfirm}
        onClose={() => setShowExitConfirm(false)}
        onConfirm={handleConfirmExit}
        tag="Estación 0 · Regreso"
        title="¿Volver a la estación principal?"
        description="El mapa actual se mantendrá en tu memoria local. Podrás reanudarlo cuando quieras desde la pantalla de inicio o comenzar un nuevo proyecto."
        confirmText="Volver al Inicio →"
        cancelText="Quedarme aquí"
      />
    </>
  );
}
