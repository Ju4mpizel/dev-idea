"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Star,
  Terminal,
  Orbit,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Wallet,
  Rocket,
  Target,
  X,
  Plus,
} from "lucide-react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked } from "@/hooks/useStationNavigation";
import { TechIcon } from "@/components/ui/TechChip";
import { getTechIcon } from "@/lib/techIcons";
import {
  AI_TOOLS,
  AI_TOOL_KINDS,
  getAiTool,
  toAiToolDecision,
} from "@/data/aiTools";
import { getAiMode } from "@/data/devPreferences";
import { StationShell } from "./StationShell";

// Misma altura que las demás estaciones: el pie queda siempre en su sitio
const GALLERY_HEIGHT = "h-[clamp(300px,calc(100dvh-440px),540px)]";

const FALLBACK_ICONS = {
  terminal: Terminal,
  orbit: Orbit,
  chat: MessageCircle,
};

const FILTERS = [
  { id: "all", label: "Todas" },
  { id: "featured", label: "Destacadas" },
  ...Object.entries(AI_TOOL_KINDS).map(([id, k]) => ({ id, label: k.label })),
];

const subscribeNoop = () => () => {};
const useIsClient = () =>
  useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

/** Logo de la herramienta: el oficial si existe, si no un ícono genérico. */
export function AiToolLogo({ tool, size }) {
  if (tool.icon && getTechIcon(tool.icon)) {
    return <TechIcon name={tool.icon} size={size} />;
  }
  const Icon = FALLBACK_ICONS[tool.fallbackIcon] || Sparkles;
  return (
    <Icon className="text-neutral-200" style={{ width: size, height: size }} />
  );
}

/** Ids elegidos guardados (acepta el formato antiguo de un solo objeto). */
function savedIdsOf(saved) {
  const list = Array.isArray(saved) ? saved : saved ? [saved] : [];
  return new Set(list.map((t) => t?.id).filter((id) => getAiTool(id)));
}

/** Carta con el detalle de una herramienta. */
function ToolDetail({ tool, isSelected, isLocked, onToggle, onClose }) {
  // Escape cierra la carta
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const kind = AI_TOOL_KINDS[tool.kind];
  return (
    <motion.div
      key="ai-tool-detail"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.article
        initial={{ opacity: 0, y: 12, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 12, scale: 0.97 }}
        transition={{ duration: 0.18 }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={tool.name}
        className="w-full max-w-sm max-h-[85dvh] overflow-y-auto scrollbar-thin rounded-3xl bg-neutral-950 border border-neutral-800 shadow-2xl"
      >
        {/* Cabecera con el logo grande */}
        <div className="relative px-5 pt-5 pb-4 border-b border-neutral-800/80 bg-gradient-to-b from-neutral-900 to-neutral-950">
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute top-3 right-3 p-1.5 rounded-lg text-neutral-500 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3.5">
            <span className="w-14 h-14 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0">
              <AiToolLogo tool={tool} size={30} />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold text-white leading-tight">
                {tool.name}
              </h3>
              <p className="text-[11px] text-neutral-500 font-mono">
                {tool.vendor}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-neutral-700 bg-neutral-900 text-neutral-300">
                  {kind.label}
                </span>
                {tool.featured && (
                  <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-amber-800/70 bg-amber-950/50 text-amber-300 flex items-center gap-1">
                    <Star className="w-2.5 h-2.5 fill-current" /> Destacada
                  </span>
                )}
              </div>
            </div>
          </div>
          <p className="text-xs text-neutral-300 leading-relaxed mt-3">
            {tool.tagline}
          </p>
        </div>

        <div className="px-5 py-4 flex flex-col gap-3.5">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
              En qué te ayuda
            </p>
            <ul className="space-y-1.5">
              {tool.helpsWith.map((item) => (
                <li
                  key={item}
                  className="text-[12px] text-neutral-200 leading-snug flex items-start gap-2"
                >
                  <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-px" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="grid gap-2 text-[11px] leading-snug">
            <p className="flex items-start gap-2 text-neutral-300">
              <Target className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-px" />
              <span>
                <b className="text-neutral-100">Ideal para: </b>
                {tool.bestFor}
              </span>
            </p>
            <p className="flex items-start gap-2 text-neutral-300">
              <Rocket className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-px" />
              <span>
                <b className="text-neutral-100">Cómo empezar: </b>
                {tool.start}
              </span>
            </p>
            <p className="flex items-start gap-2 text-neutral-300">
              <Wallet className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-px" />
              <span>
                <b className="text-neutral-100">Precio: </b>
                {tool.pricing}{" "}
                <span className="text-neutral-500">
                  (orientativo, revísalo en su sitio)
                </span>
              </span>
            </p>
          </div>
        </div>

        <div className="px-5 pb-5 flex items-center gap-2">
          <a
            href={tool.url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            Sitio <ExternalLink className="w-3.5 h-3.5" />
          </a>
          <button
            type="button"
            disabled={isLocked}
            onClick={onToggle}
            className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isSelected
                ? "bg-emerald-400 text-neutral-950 hover:bg-emerald-300"
                : "bg-white text-neutral-950 hover:bg-neutral-200"
            }`}
          >
            {isSelected ? (
              <>
                <Check className="w-4 h-4" /> En mi kit
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" /> Agregar a mi kit
              </>
            )}
          </button>
        </div>
      </motion.article>
    </motion.div>
  );
}

/**
 * Estación "Ecosistema de IA": galería fija de herramientas para programar.
 * Tocar un ícono abre su carta; el usuario arma su kit (varias) o la omite.
 */
export function AiEcosystemStation({ station, onNext }) {
  const { stepNumber, blueprintKey } = station;
  const saved = useDecisionStore((s) => s.blueprint[blueprintKey]);
  const updateBlueprint = useDecisionStore((s) => s.updateBlueprint);
  const setCompanion = useDecisionStore((s) => s.setCompanion);
  const isLocked = useDecisionStore((s) => isStepLocked(s, stepNumber));
  const isClient = useIsClient();

  const [pickedIds, setPickedIds] = useState(null);
  // Abre en el tipo de herramienta que el usuario dijo usar en "Tu entorno"
  const aiKind = useDecisionStore(
    (s) => getAiMode(s.blueprint.selectedStack?.preferences?.ai)?.kind || null,
  );
  const [filter, setFilter] = useState(() =>
    aiKind && AI_TOOL_KINDS[aiKind] ? aiKind : "all",
  );
  const [openId, setOpenId] = useState(null);

  const selectedIds = pickedIds ?? savedIdsOf(saved);
  const selectedTools = AI_TOOLS.filter((t) => selectedIds.has(t.id));
  const openTool = getAiTool(openId);

  const visibleTools = AI_TOOLS.filter((t) =>
    filter === "all"
      ? true
      : filter === "featured"
        ? t.featured
        : t.kind === filter,
  );

  const toggle = (tool) => {
    if (isLocked) return;
    const next = new Set(selectedIds);
    if (next.has(tool.id)) {
      next.delete(tool.id);
    } else {
      next.add(tool.id);
      setCompanion("celebrate", `${tool.name} entra a tu kit. ${tool.bestFor}`);
    }
    setPickedIds(next);
  };

  const decision = selectedTools.map(toAiToolDecision);

  const handleConfirm = () => {
    if (!decision.length) return;
    updateBlueprint({ [blueprintKey]: decision });
    onNext({ [blueprintKey]: decision });
  };

  const handleSkip = () => {
    updateBlueprint({ [blueprintKey]: [] });
    onNext({ [blueprintKey]: [] });
  };

  return (
    <StationShell
      station={station}
      onSkip={handleSkip}
      onConfirm={handleConfirm}
      confirmDisabled={!decision.length}
      confirmLabel={
        decision.length
          ? `Confirmar kit (${decision.length})`
          : "Elige al menos una"
      }
      selectionSummary={
        decision.length
          ? `${decision.length} ${decision.length === 1 ? "herramienta" : "herramientas"}`
          : null
      }
      rewriteTitle="¿Cambiar tu kit de IA?"
      rewriteDescription="Se desbloqueará la galería de herramientas. El cierre del proyecto calculado después se descartará."
    >
      <div
        className={`${GALLERY_HEIGHT} w-full rounded-3xl border border-neutral-800 bg-neutral-950/70 flex flex-col overflow-hidden`}
      >
        {/* Filtros */}
        <div className="shrink-0 px-3 sm:px-4 pt-3 pb-2.5 border-b border-neutral-800/80 flex flex-col gap-2">
          <p className="text-[11px] sm:text-xs text-neutral-400 flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            Toca una herramienta para ver en qué te ayuda. Las destacadas son
            las más usadas hoy.
          </p>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={`shrink-0 px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px] font-mono transition-colors cursor-pointer ${
                  filter === f.id
                    ? "bg-white border-white text-neutral-950"
                    : "border-neutral-800 bg-neutral-900/60 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Galería de íconos */}
        <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-3 sm:p-4">
          <div className="grid grid-cols-3 xs:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-2.5">
            {visibleTools.map((tool) => {
              const isSelected = selectedIds.has(tool.id);
              return (
                <button
                  key={tool.id}
                  type="button"
                  onClick={() => setOpenId(tool.id)}
                  aria-label={`${tool.name}: ver detalle`}
                  className={`relative h-[92px] rounded-2xl border flex flex-col items-center justify-center gap-1 px-1.5 transition-[border-color,background-color,transform] duration-200 cursor-pointer hover:-translate-y-0.5 ${
                    isSelected
                      ? "border-emerald-400 bg-emerald-950/20 ring-1 ring-emerald-400/60"
                      : tool.featured
                        ? "border-amber-700/60 bg-neutral-900/80 hover:border-amber-500/80"
                        : "border-neutral-800 bg-neutral-900/60 hover:border-neutral-600"
                  } ${isLocked && !isSelected ? "opacity-40 grayscale" : ""}`}
                >
                  {tool.featured && (
                    <Star className="absolute top-1.5 left-1.5 w-3 h-3 text-amber-400 fill-amber-400" />
                  )}
                  {isSelected && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-neutral-950 stroke-[3]" />
                    </span>
                  )}
                  <AiToolLogo tool={tool} size={26} />
                  <span className="text-[10px] sm:text-[11px] font-semibold text-neutral-100 text-center leading-tight line-clamp-2">
                    {tool.name}
                  </span>
                  <span className="text-[8px] sm:text-[9px] font-mono uppercase tracking-wider text-neutral-500 truncate max-w-full">
                    {AI_TOOL_KINDS[tool.kind].label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isClient &&
        createPortal(
          <AnimatePresence>
            {openTool && (
              <ToolDetail
                tool={openTool}
                isSelected={selectedIds.has(openTool.id)}
                isLocked={isLocked}
                onToggle={() => toggle(openTool)}
                onClose={() => setOpenId(null)}
              />
            )}
          </AnimatePresence>,
          document.body,
        )}
    </StationShell>
  );
}
