"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import {
  MODES,
  PHASES,
  STATIONS,
  getPhase,
  isStationInMode,
  resolveMode,
  stationsInMode,
} from "@/config/stations.config";
import { Check, Compass, HelpCircle, Scale, Sparkles, Zap } from "lucide-react";
import { introClass, introDelay } from "@/hooks/useIntro";

/** Ícono y colores de cada modo (clases completas para Tailwind). */
const MODE_STYLE = {
  quick: {
    Icon: Zap,
    tile: "bg-amber-400/15 border-amber-400/40 text-amber-300",
    active: "border-amber-400/80 bg-amber-950/30 ring-1 ring-amber-400/40",
    check: "bg-amber-400 text-neutral-950",
  },
  standard: {
    Icon: Scale,
    tile: "bg-sky-400/15 border-sky-400/40 text-sky-300",
    active: "border-sky-400/80 bg-sky-950/30 ring-1 ring-sky-400/40",
    check: "bg-sky-400 text-neutral-950",
  },
  complete: {
    Icon: Compass,
    tile: "bg-violet-400/15 border-violet-400/40 text-violet-300",
    active: "border-violet-400/80 bg-violet-950/30 ring-1 ring-violet-400/40",
    check: "bg-violet-400 text-neutral-950",
  },
};

const MODE_ORDER = ["quick", "standard", "complete"];

/** Estaciones que el usuario recorre (sin contar la 0 y el cierre). */
const decisionCount = (modeId) =>
  stationsInMode(modeId).filter((s) => s.stepNumber > 0 && s.id !== "workspace")
    .length;

/**
 * Modo del recorrido (Estación 0): Rápido, Estándar o Completo. Se aplica al
 * empezar un mapa nuevo; el mapa en curso conserva el suyo. "¿Qué incluye?"
 * despliega qué estaciones recorre cada modo.
 */
export function ModeSelector({ intro, isResuming }) {
  const preferredMode = useDecisionStore((s) => resolveMode(s.preferredMode));
  const setPreferredMode = useDecisionStore((s) => s.setPreferredMode);
  const currentMapMode = useDecisionStore((s) => resolveMode(s.blueprint.mode));
  const setCompanion = useDecisionStore((s) => s.setCompanion);
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  const choose = (modeId) => {
    setPreferredMode(modeId);
    const mode = MODES[modeId];
    setCompanion(
      "happy",
      modeId === "complete"
        ? `Modo Completo: recorremos las ${decisionCount(modeId)} estaciones. Ideal si lo vas a defender o quieres el plano entero.`
        : `Modo ${mode.label}: ${decisionCount(modeId)} estaciones. Lo que saltemos te lo sugiero yo en el cierre.`,
    );
  };

  return (
    <div>
      <div
        style={introDelay(intro, 1300)}
        className={`flex items-center justify-between gap-2 mb-2 ${introClass(intro, "intro-rise")}`}
      >
        <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500">
          Modo del recorrido
        </span>
        <button
          type="button"
          onClick={() => setIsInfoOpen((open) => !open)}
          aria-expanded={isInfoOpen}
          className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] sm:text-[11px] font-mono transition-colors cursor-pointer ${
            isInfoOpen
              ? "bg-sky-400 border-sky-400 text-neutral-950"
              : "border-sky-900/70 bg-sky-950/30 text-sky-300 hover:bg-sky-900/40"
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>¿Qué incluye?</span>
        </button>
      </div>

      <div
        role="radiogroup"
        aria-label="Modo del recorrido"
        className="grid grid-cols-3 gap-2"
      >
        {MODE_ORDER.map((modeId, i) => {
          const mode = MODES[modeId];
          const style = MODE_STYLE[modeId];
          const isActive = preferredMode === modeId;
          return (
            <button
              key={modeId}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => choose(modeId)}
              style={introDelay(intro, 1340 + i * 60)}
              className={`${introClass(intro, "intro-rise")} relative p-2 sm:p-3 rounded-xl border text-left transition-[background-color,border-color,box-shadow] cursor-pointer flex flex-col sm:flex-row items-center sm:items-start gap-1.5 sm:gap-2.5 ${
                isActive
                  ? style.active
                  : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800"
              }`}
            >
              <span
                className={`shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center ${style.tile}`}
              >
                <style.Icon className="w-4 h-4" />
              </span>
              <span className="min-w-0 flex flex-col items-center sm:items-start text-center sm:text-left">
                <span className="font-medium text-[11px] sm:text-xs text-neutral-100">
                  {mode.label}
                </span>
                <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500">
                  {decisionCount(modeId)} estaciones
                </span>
                <span className="hidden sm:block text-[10px] text-neutral-500 mt-0.5 leading-snug">
                  {mode.tagline}
                </span>
              </span>
              {isActive && (
                <span
                  className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${style.check}`}
                >
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isResuming && currentMapMode !== preferredMode && (
        <p className="mt-1.5 text-[10px] text-neutral-500">
          Tu mapa guardado sigue en modo {MODES[currentMapMode].label}; este se
          usará al empezar uno nuevo.
        </p>
      )}

      <AnimatePresence initial={false}>
        {isInfoOpen && (
          <motion.div
            key="mode-info"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <ModeInfo modeId={preferredMode} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Qué recorre el modo elegido y qué completa Dev-i en el cierre. */
function ModeInfo({ modeId }) {
  const mode = MODES[modeId];
  const route = STATIONS.filter((s) => s.stepNumber > 0 && s.id !== "workspace");
  const skipped = route.filter((s) => !isStationInMode(s, modeId));

  return (
    <div className="mt-2 rounded-xl border border-neutral-800 bg-neutral-950/70 p-3 flex flex-col gap-2.5">
      <p className="text-[11px] text-neutral-400 leading-relaxed">
        <b className="text-neutral-100">Modo {mode.label}:</b> {mode.tagline.toLowerCase()}.{" "}
        Ningún modo salta lo esencial: qué es tu sistema, qué hace, con qué se
        construye y dónde guarda los datos.
      </p>

      <div className="flex flex-wrap gap-1.5">
        {route.map((station) => {
          const isIn = isStationInMode(station, modeId);
          const phase = getPhase(station);
          return (
            <span
              key={station.id}
              className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] ${
                isIn
                  ? "border-neutral-700 bg-neutral-900 text-neutral-200"
                  : "border-neutral-900 text-neutral-600 line-through"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isIn ? phase.dot : "bg-neutral-700"}`}
              />
              {station.title}
            </span>
          );
        })}
      </div>

      {skipped.length > 0 ? (
        <p className="text-[10px] sm:text-[11px] text-neutral-500 leading-relaxed flex items-start gap-1.5">
          <Sparkles className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
          <span>
            Las tachadas no se te preguntan: en el cierre Dev-i te deja una
            sugerencia razonable para cada una, así tu AGENTS.md sale completo.
          </span>
        </p>
      ) : (
        <p className="text-[10px] sm:text-[11px] text-neutral-500">
          Recorres todas las estaciones y decides cada parte del plano.
        </p>
      )}

      <div className="flex flex-wrap gap-x-3 gap-y-1">
        {Object.entries(PHASES).map(([id, phase]) => (
          <span key={id} className="flex items-center gap-1 text-[10px] text-neutral-500">
            <span className={`w-1.5 h-1.5 rounded-full ${phase.dot}`} />
            {phase.label}
          </span>
        ))}
      </div>
    </div>
  );
}
