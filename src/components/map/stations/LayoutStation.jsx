"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked } from "@/hooks/useStationNavigation";
import { CardDeck, DeckSkeleton } from "@/components/map/deck/CardDeck";
import {
  buildLayoutDecision,
  getLayout,
} from "@/data/layoutCatalog";
import { SelectionCard } from "./SelectionCard";
import { StationShell } from "./StationShell";
import { LayoutWireframe } from "./LayoutWireframe";
import { Check, ChevronDown, Star } from "lucide-react";

/** Los 2 primeros del ranking de Gemini se marcan como recomendados. */
const RECOMMENDED_COUNT = 2;

/**
 * Estación Layout: una carta por SUPERFICIE del sistema (sitio público, panel
 * admin, app...). Al elegir una carta se despliegan debajo los wireframes de
 * esa superficie; se elige uno por superficie y todo queda en esta estación.
 */
export function LayoutStation({ station, data, onNext, onGenerate }) {
  const { stepNumber, blueprintKey } = station;
  const saved = useDecisionStore((s) => s.blueprint[blueprintKey]);
  const updateBlueprint = useDecisionStore((s) => s.updateBlueprint);
  const setCompanion = useDecisionStore((s) => s.setCompanion);
  const isLoading = useDecisionStore((s) => s.isLoading);
  const isLocked = useDecisionStore((s) => isStepLocked(s, stepNumber));

  const surfaces = data?.options || [];
  const panelRef = useRef(null);

  // { [surface]: layoutId } · null = aún no se tocó nada (sale de lo guardado)
  const [picked, setPicked] = useState(null);
  const [openSurface, setOpenSurface] = useState(null);

  const savedSelections = Object.fromEntries(
    (saved?.selections || []).map((s) => [s.surface, s.layoutId]),
  );
  const selections = picked ?? savedSelections;

  const firstPending =
    surfaces.find((s) => !selections[s.surface])?.surface ??
    surfaces[0]?.surface ??
    null;
  const activeSurface =
    openSurface && surfaces.some((s) => s.surface === openSurface)
      ? openSurface
      : firstPending;
  const active = surfaces.find((s) => s.surface === activeSurface) || null;

  const isSingle = surfaces.length === 1;
  const doneCount = surfaces.filter((s) => selections[s.surface]).length;
  const allDone = surfaces.length > 0 && doneCount === surfaces.length;
  const selectedKeys = new Set(
    surfaces.filter((s) => selections[s.surface]).map((s) => s.id),
  );

  const openPanel = (surface) => {
    setOpenSurface(surface.surface);
    setCompanion(
      "thinking",
      `Elige cómo se verá «${surface.title}». Las ⭐ son las que mejor encajan con tu idea.`,
    );
    // En móvil el panel queda debajo del mazo: se acerca a la vista
    requestAnimationFrame(() =>
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );
  };

  const pickLayout = (surface, layoutId) => {
    if (isLocked) return;
    const next = { ...selections, [surface.surface]: layoutId };
    setPicked(next);
    const nextPending = surfaces.find((s) => !next[s.surface]);
    const layout = getLayout(layoutId);
    if (nextPending) {
      setCompanion(
        "happy",
        `«${layout?.title}» para ${surface.title}. Ahora elige el de «${nextPending.title}».`,
      );
      // Pasa sola a la siguiente superficie pendiente
      setTimeout(() => setOpenSurface(nextPending.surface), 450);
    } else {
      setCompanion(
        "happy",
        `«${layout?.title}» para ${surface.title}. ¡Listo! Confirma cuando quieras.`,
      );
    }
  };

  const decision = allDone
    ? buildLayoutDecision(
        Object.fromEntries(
          surfaces.map((s) => [s.surface, selections[s.surface]]),
        ),
      )
    : null;

  const handleConfirm = () => {
    if (!decision) return;
    updateBlueprint({ [blueprintKey]: decision });
    onNext({ [blueprintKey]: decision });
  };

  const renderCard = (surface, { isSelected, isDimmed }) => {
    const chosen = getLayout(selections[surface.surface]);
    const suggested = getLayout(surface.ranking?.[0]?.layoutId);
    const preview = chosen || suggested;
    const isOpen = surface.surface === activeSurface;
    return (
      <SelectionCard
        title={surface.title}
        subtitle={surface.summary}
        tag={chosen ? "Elegido" : "Por elegir"}
        level="medium"
        levelLabel="Superficie"
        beginnerTip={surface.beginnerTip}
        isSelected={isSelected}
        isDimmed={isDimmed}
        media={
          preview && (
            <div className="mb-2.5 rounded-xl border border-neutral-800 bg-neutral-950 p-2 flex items-center gap-2.5">
              <LayoutWireframe
                id={preview.id}
                className="w-20 shrink-0 text-neutral-500"
              />
              <span className="text-[11px] leading-snug text-neutral-400">
                {chosen ? "Elegiste" : "Sugerido"}:{" "}
                <b className="text-neutral-100">{preview.title}</b>
              </span>
            </div>
          )
        }
        footer={
          <span
            className={`flex items-center gap-1 text-[11px] font-mono ${isOpen ? "text-emerald-300" : "text-neutral-500"}`}
          >
            <ChevronDown className="w-3.5 h-3.5" />
            {isOpen ? "Wireframes abiertos abajo" : "Toca para ver los wireframes"}
          </span>
        }
      />
    );
  };

  return (
    <StationShell
      station={station}
      onConfirm={handleConfirm}
      confirmDisabled={!decision}
      confirmLabel="Confirmar layouts"
      selectionSummary={
        surfaces.length ? `${doneCount} de ${surfaces.length} elegidos` : null
      }
      rewriteTitle="¿Cambiar los layouts?"
      rewriteDescription="Se desbloqueará la elección de layouts. Deploy y todo lo calculado después se descartará."
    >
      {isLoading && surfaces.length === 0 ? (
        <DeckSkeleton size="compact" />
      ) : isSingle ? null : (
        // Con una sola superficie el mazo sobra: la cabecera va en el panel
        <CardDeck
          items={surfaces}
          getLabel={(s) => s.title}
          getLevel={() => "medium"}
          selectedKeys={selectedKeys}
          onToggle={openPanel}
          selection="single"
          // En Modo Consulta el mazo sigue abriendo los wireframes (solo lectura)
          isLocked={false}
          size="compact"
          renderCard={renderCard}
          emptyMessage={
            <div className="flex flex-col items-center gap-3">
              <span>Todavía no hay propuestas de layout.</span>
              {onGenerate && !isLocked && (
                <button
                  type="button"
                  onClick={onGenerate}
                  className="px-4 py-2 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  Generar con IA
                </button>
              )}
            </div>
          }
        />
      )}

      {active && (
        <div
          ref={panelRef}
          className="w-full rounded-3xl border border-neutral-800 bg-neutral-950/70 p-3 sm:p-4 flex flex-col gap-3 scroll-mt-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="min-w-0">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                {isSingle
                  ? `Superficie única · ${active.title}`
                  : `Wireframes · ${doneCount} de ${surfaces.length} superficies`}
              </span>
              <h3 className="text-sm sm:text-base font-semibold text-white leading-snug">
                ¿Cómo se verá «{active.title}»?
              </h3>
              {/* Lo que en el mazo iba en la carta: qué necesita esta parte */}
              {isSingle && (active.summary || active.beginnerTip) && (
                <div className="mt-1.5 flex flex-col gap-1.5">
                  {active.summary && (
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      {active.summary}
                    </p>
                  )}
                  {active.beginnerTip && (
                    <p className="text-[11px] text-amber-100/90 bg-amber-950/20 border border-amber-900/40 rounded-xl px-2.5 py-1.5 leading-relaxed">
                      <b className="text-amber-300">En simple: </b>
                      {active.beginnerTip}
                    </p>
                  )}
                </div>
              )}
            </div>
            {surfaces.length > 1 && (
              <div className="flex gap-1.5 flex-wrap">
                {surfaces.map((s) => {
                  const isActive = s.surface === activeSurface;
                  const isDone = Boolean(selections[s.surface]);
                  return (
                    <button
                      key={s.surface}
                      type="button"
                      onClick={() => setOpenSurface(s.surface)}
                      aria-pressed={isActive}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] transition-colors cursor-pointer ${
                        isActive
                          ? "bg-white text-neutral-950 border-white font-medium"
                          : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-100"
                      }`}
                    >
                      {isDone && (
                        <Check
                          className={`w-3 h-3 stroke-[3] ${isActive ? "text-emerald-600" : "text-emerald-400"}`}
                        />
                      )}
                      {s.title}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={active.surface}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              role="listbox"
              aria-label={`Layouts para ${active.title}`}
              className={`grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5 ${
                (active.ranking || []).length > 4 ? "lg:grid-cols-6" : "lg:grid-cols-4"
              }`}
            >
              {(active.ranking || []).map((entry, index) => {
                const layout = getLayout(entry.layoutId);
                if (!layout) return null;
                const isPicked = selections[active.surface] === layout.id;
                return (
                  <button
                    key={layout.id}
                    type="button"
                    role="option"
                    aria-selected={isPicked}
                    disabled={isLocked}
                    onClick={() => pickLayout(active, layout.id)}
                    className={`relative text-left rounded-2xl border p-2 sm:p-2.5 flex flex-col gap-1.5 transition-colors cursor-pointer disabled:cursor-default ${
                      isPicked
                        ? "bg-neutral-900 border-emerald-400/80 ring-1 ring-emerald-400/40"
                        : "bg-neutral-900/50 border-neutral-800 hover:border-neutral-600 hover:bg-neutral-900"
                    } ${isLocked && !isPicked ? "opacity-40" : ""}`}
                  >
                    <span className="relative rounded-xl bg-neutral-950 border border-neutral-800/80 p-1.5">
                      <LayoutWireframe
                        id={layout.id}
                        className={`w-full h-auto ${isPicked ? "text-neutral-300" : "text-neutral-500"}`}
                      />
                      {isPicked && (
                        <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-emerald-400 text-neutral-950 flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </span>
                    <span className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs font-semibold text-white leading-tight">
                        {layout.title}
                      </span>
                      {index < RECOMMENDED_COUNT && entry.reason && (
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400 shrink-0" />
                      )}
                    </span>
                    <span className="text-[10px] sm:text-[11px] text-neutral-400 leading-snug line-clamp-3">
                      {entry.reason || layout.summary}
                    </span>
                  </button>
                );
              })}
            </motion.div>
          </AnimatePresence>
        </div>
      )}
    </StationShell>
  );
}
