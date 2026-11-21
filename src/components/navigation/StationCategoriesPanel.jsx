"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useAnimatingLayer } from "@/hooks/useAnimatingLayer";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { getStation, stationNumberInMode } from "@/config/stations.config";
import { getStationCategories } from "@/data/stationCategories";
import { getLevelStyle } from "@/components/map/stations/levelStyles";
import { X, Layers } from "lucide-react";

const LEVEL_ORDER = ["simple", "medium", "advanced"];

/**
 * Panel deslizable de la IZQUIERDA: tabla de categorías de la estación actual
 * (qué significa cada nivel de las cartas y el catálogo completo de opciones).
 * Se mantiene abierto al cambiar de estación y muestra la nueva.
 */
export function StationCategoriesPanel() {
  const isOpen = useDecisionStore((s) => s.isCategoriesOpen);
  const close = useDecisionStore((s) => s.closeCategories);
  const panelLayer = useAnimatingLayer();
  const currentStep = useDecisionStore((s) => s.currentStep);
  const mode = useDecisionStore((s) => s.blueprint.mode);

  const station = getStation(currentStep);
  const categories = station ? getStationCategories(station.id) : null;
  const visible = isOpen && Boolean(categories);

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="categories-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="xl:hidden fixed inset-0 z-40 bg-black/60 will-change-[opacity]"
          />
          <motion.aside
            key="categories-panel"
            {...panelLayer}
            role="dialog"
            aria-label={categories.title}
            initial={{ x: -380, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -380, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 30 }}
            className="fixed z-50 left-0 top-0 bottom-0 w-[min(340px,88vw)]
              xl:left-6 xl:top-24 xl:bottom-auto xl:max-h-[calc(100dvh-120px)]
              flex flex-col bg-neutral-900/95 border-r xl:border border-neutral-800 xl:rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.85)] overflow-hidden"
          >
            <div className="flex items-start justify-between gap-2 px-4 pt-4 pb-3 border-b border-neutral-800">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-violet-300 flex items-center gap-1.5">
                  <Layers className="w-3 h-3" /> Estación {stationNumberInMode(station, mode)}{" "}
                  · {station.navLabel}
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  {categories.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Cerrar categorías"
                className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-4 py-4 flex flex-col gap-5">
              {/* Significado de cada nivel de carta */}
              {categories.levels && station.legend && (
                <section>
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-2">
                    {station.legend.label} de las cartas
                  </h4>
                  <div className="flex flex-col gap-2">
                    {LEVEL_ORDER.map((level) => {
                      const style = getLevelStyle(level);
                      return (
                        <div
                          key={level}
                          className="p-2.5 rounded-xl bg-neutral-950 border border-neutral-800"
                        >
                          <span
                            className={`inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border ${style.badge}`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${style.accentDot}`}
                            />
                            {station.legend[level]}
                          </span>
                          <p className="text-xs text-neutral-300 leading-relaxed mt-1.5">
                            {categories.levels[level]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}

              {/* Catálogo completo de la estación */}
              {categories.catalog?.map((group) => (
                <section key={group.group}>
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-2">
                    {group.group}
                  </h4>
                  <dl className="rounded-xl border border-neutral-800 overflow-hidden divide-y divide-neutral-800">
                    {group.items.map((item) => (
                      <div
                        key={item.name}
                        className="px-3 py-2 bg-neutral-950/70 grid grid-cols-[minmax(92px,auto)_1fr] gap-x-3 gap-y-0.5"
                      >
                        <dt className="text-xs font-semibold text-neutral-100">
                          {item.name}
                        </dt>
                        <dd className="text-[11px] text-neutral-400 leading-snug">
                          {item.desc}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              ))}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
