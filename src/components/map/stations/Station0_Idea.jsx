"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import {
  STROBI_RESUME_QUOTES,
  STROBI_DISCARD_QUOTES,
} from "@/data/strobiQuotes";

export function Station0_Idea({ onStartNew, onResumeSaved }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const currentIdeaDraft = useDecisionStore((state) => state.currentIdeaDraft);
  const setCurrentIdeaDraft = useDecisionStore(
    (state) => state.setCurrentIdeaDraft,
  );
  const isMapCardActive = useDecisionStore((state) => state.isMapCardActive);
  const toggleMapCard = useDecisionStore((state) => state.toggleMapCard);
  const clearAllMemory = useDecisionStore((state) => state.clearAllMemory);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const generatedOptions = useDecisionStore((state) => state.generatedOptions);
  const setCompanion = useDecisionStore((state) => state.setCompanion);

  const hasSavedBlueprint = Boolean(
    blueprint?.idea && (blueprint?.selectedName || generatedOptions[1]),
  );

  // Al llegar a la Estación 0, restauramos el diálogo inicial amigable si no hay tarjeta activada
  useEffect(() => {
    if (!isMapCardActive) {
      setCompanion(
        "idle",
        "Cuéntame qué quieres armar y calibramos el camino.",
      );
    }
  }, [isMapCardActive, setCompanion]);

  // Al seleccionar/deseleccionar la tarjeta guardada
  const handleToggleCard = () => {
    const willBeActive = !isMapCardActive;
    toggleMapCard();

    if (willBeActive) {
      const randomResume =
        STROBI_RESUME_QUOTES[
          Math.floor(Math.random() * STROBI_RESUME_QUOTES.length)
        ];
      setCompanion(randomResume.mood, randomResume.quote);
    } else {
      setCompanion(
        "idle",
        "Cuéntame qué quieres armar y calibramos el camino.",
      );
    }
  };

  // Al borrar la tarjeta guardada
  const handleDiscard = (e) => {
    e.stopPropagation();
    clearAllMemory();
    const randomDiscard =
      STROBI_DISCARD_QUOTES[
        Math.floor(Math.random() * STROBI_DISCARD_QUOTES.length)
      ];
    setCompanion(randomDiscard.mood, randomDiscard.quote);
  };

  const handleSubmit = () => {
    if (isMapCardActive && hasSavedBlueprint) {
      onResumeSaved();
    } else {
      if (!currentIdeaDraft.trim()) return;
      onStartNew(currentIdeaDraft.trim(), blueprint.context || "startup");
    }
  };

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
      {/* Formulario Principal de Creación */}
      <div
        className={`${
          hasSavedBlueprint ? "md:col-span-2" : "md:col-span-3 max-w-xl mx-auto"
        } w-full p-6 sm:p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl shadow-2xl flex flex-col gap-6`}
      >
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
            Estación 0 · Entrada & Contexto
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-1">
            ¿Qué software tienes en mente?
          </h2>
          <p className="text-xs text-neutral-400 mt-1">
            Escribe una descripción corta para calibrar los requerimientos
            técnicos.
          </p>
        </div>

        {/* Input no persistido: inicia limpio tras recargar */}
        <input
          type="text"
          value={currentIdeaDraft}
          onChange={(e) => {
            setCurrentIdeaDraft(e.target.value);
            if (isMapCardActive) {
              toggleMapCard();
              setCompanion(
                "idle",
                "Cuéntame qué quieres armar y calibramos el camino.",
              );
            }
          }}
          placeholder="Ej. Sistema de reservas para una pesquería local con pagos QR..."
          className="w-full px-4 py-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-sm outline-none focus:border-neutral-600 transition-colors font-sans"
        />

        {/* Selector de Contexto */}
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-2">
            Propósito del proyecto
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {[
              {
                id: "academic",
                title: "Académico / U",
                desc: "Fácil de defender y estructurado",
              },
              {
                id: "startup",
                title: "Startup / Trabajo",
                desc: "Escalable y enfocado a producto",
              },
              {
                id: "personal",
                title: "Personal / MVP",
                desc: "Rápido, ligero y experimental",
              },
            ].map((ctx) => (
              <button
                key={ctx.id}
                type="button"
                onClick={() => updateBlueprint({ context: ctx.id })}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  blueprint.context === ctx.id
                    ? "bg-neutral-800/90 border-neutral-500 text-white"
                    : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800 text-neutral-400"
                }`}
              >
                <div className="font-medium text-xs text-neutral-200">
                  {ctx.title}
                </div>
                <div className="text-[10px] text-neutral-500 mt-0.5">
                  {ctx.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Botón Adaptativo */}
        <div className="flex justify-end pt-2">
          <button
            type="button"
            disabled={
              isLoading || (!isMapCardActive && !currentIdeaDraft.trim())
            }
            onClick={handleSubmit}
            className={`px-6 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isMapCardActive && hasSavedBlueprint
                ? "bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                : "bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            <span>
              {isLoading
                ? "Calibrando..."
                : isMapCardActive && hasSavedBlueprint
                  ? "Continuar Mapa Guardado →"
                  : "Comenzar Nuevo Mapa →"}
            </span>
          </button>
        </div>
      </div>

      {/* Tarjeta Lateral de Memoria Local */}
      {hasSavedBlueprint && (
        <aside className="w-full flex flex-col gap-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
              Memoria Local
            </span>
            <span className="text-[10px] font-mono text-emerald-400">
              1 Mapa Guardado
            </span>
          </div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            onClick={handleToggleCard}
            className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer select-none backdrop-blur-md flex flex-col justify-between ${
              isMapCardActive
                ? "bg-neutral-900/90 border-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/50"
                : "bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 opacity-60 hover:opacity-100"
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                  {blueprint.selectedName || "Borrador"}
                </span>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isMapCardActive
                      ? "border-emerald-400 bg-emerald-400"
                      : "border-neutral-700"
                  }`}
                >
                  {isMapCardActive && (
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                  )}
                </div>
              </div>

              <h4 className="text-sm font-semibold text-neutral-100 line-clamp-2">
                "{blueprint.idea}"
              </h4>
              <p className="text-[11px] text-neutral-400 mt-2 font-mono">
                Stack: {blueprint.selectedStack?.title || "Pendiente"}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-800/80 flex items-center justify-between text-[11px] font-mono">
              <span
                className={
                  isMapCardActive
                    ? "text-emerald-400 font-medium"
                    : "text-neutral-500"
                }
              >
                {isMapCardActive ? "● Activado" : "○ Click para activar"}
              </span>
              <button
                type="button"
                onClick={handleDiscard}
                className="text-neutral-500 hover:text-red-400 transition-colors"
              >
                Descartar
              </button>
            </div>
          </motion.div>
        </aside>
      )}
    </div>
  );
}
