"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { getStationGuide } from "@/data/stationGuides";
import { ArrivingStrobi } from "./ArrivingStrobi";
import { useAnimatingLayer } from "@/hooks/useAnimatingLayer";
import {
  X,
  Lightbulb,
  GraduationCap,
  Building2,
  Sparkles,
  BookOpen,
} from "lucide-react";

/**
 * Panel "¿Qué es...?": Dev-i sale de la cabecera y aparece al lado de la
 * estación explicando su concepto. En escritorio es un panel lateral; en móvil,
 * una hoja inferior. Se cierra con la X, con el fondo (móvil), con Escape o al
 * confirmar la estación.
 */
export function StationInfoPanel() {
  const infoStationId = useDecisionStore((s) => s.infoStationId);
  const closeStationInfo = useDecisionStore((s) => s.closeStationInfo);
  const guide = infoStationId ? getStationGuide(infoStationId) : null;
  const panelLayer = useAnimatingLayer();

  return (
    <AnimatePresence>
      {guide && (
        <>
          {/* Fondo solo en móvil / tablet */}
          <motion.div
            key="info-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeStationInfo}
            className="xl:hidden fixed inset-0 z-40 bg-black/60 will-change-[opacity]"
          />

          <motion.aside
            key={`info-${infoStationId}`}
            role="dialog"
            aria-label={guide.question}
            tabIndex={-1}
            onKeyDown={(e) => e.key === "Escape" && closeStationInfo()}
            initial={{ opacity: 0, x: 60, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            {...panelLayer}
            className="fixed z-50 flex flex-col
              inset-x-3 bottom-3 max-h-[78dvh]
              xl:inset-x-auto xl:bottom-auto xl:top-24 xl:right-6 xl:w-[340px] xl:max-h-[calc(100dvh-120px)]"
          >
            <ArrivingStrobi />

            <div className="flex-1 min-h-0 rounded-3xl bg-neutral-900/95 border border-sky-900/60 shadow-[0_20px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/5 flex flex-col overflow-hidden">
              <div className="flex items-start justify-between gap-2 px-4 sm:px-5 pt-7 pb-3 border-b border-neutral-800">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                    <BookOpen className="w-3 h-3" /> Dev-i te explica
                  </span>
                  <h3 className="text-sm sm:text-base font-bold text-white leading-snug mt-0.5">
                    {guide.question}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={closeStationInfo}
                  aria-label="Cerrar explicación"
                  autoFocus
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 sm:px-5 py-4 flex flex-col gap-3.5 text-xs sm:text-[13px] leading-relaxed">
                <p className="text-neutral-200">{guide.concept}</p>

                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-100/90 flex gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    <b className="text-amber-300">Imagínalo así: </b>
                    {guide.analogy}
                  </p>
                </div>

                <ul className="space-y-1.5">
                  {guide.keyPoints.map((point) => (
                    <li
                      key={point}
                      className="flex items-baseline gap-2 text-neutral-300"
                    >
                      <span className="text-sky-400 font-mono shrink-0">›</span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>

                <div className="grid grid-cols-1 gap-2">
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex gap-2">
                    <GraduationCap className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    <p className="text-neutral-400">
                      <b className="text-neutral-200">En la universidad: </b>
                      {guide.university}
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800 flex gap-2">
                    <Building2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-neutral-400">
                      <b className="text-neutral-200">En la industria: </b>
                      {guide.industry}
                    </p>
                  </div>
                </div>

                <p className="text-sky-200/90 flex gap-2">
                  <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                  <span>
                    <b>Consejo:</b> {guide.tip}
                  </span>
                </p>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
