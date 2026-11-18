"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { PHASES, getPhase } from "@/config/stations.config";
import {
  buildPlanEntries,
  buildPlanMarkdown,
  contextLabel,
  planComment,
} from "@/lib/planSummary";
import { SURFACES, SYSTEM_COMPLEMENTS } from "@/data/systemTypes";
import { TechChip } from "@/components/ui/TechChip";
import { ArrivingStrobi } from "./ArrivingStrobi";
import {
  X,
  Lightbulb,
  ChevronDown,
  Copy,
  Check,
  ArrowRight,
  SkipForward,
  CircleDashed,
} from "lucide-react";

/**
 * Panel "💡 Mi plano": todo lo que el usuario guardó hasta ahora, estación por
 * estación, con desplegables y colores por fase. Mismo patrón que "¿Qué es?":
 * panel a la derecha en escritorio, hoja inferior en móvil, Strobi encima.
 */
export function ProjectPlanPanel() {
  const isPlanOpen = useDecisionStore((s) => s.isPlanOpen);
  const currentStep = useDecisionStore((s) => s.currentStep);
  const closePlan = useDecisionStore((s) => s.closePlan);
  const visible = isPlanOpen && currentStep > 0;

  return (
    <AnimatePresence>
      {visible && (
        <>
          <motion.div
            key="plan-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePlan}
            className="xl:hidden fixed inset-0 z-40 bg-black/60 will-change-[opacity]"
          />
          <motion.aside
            key="plan-panel"
            role="dialog"
            aria-label="Mi plano"
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
            className="fixed z-50 flex flex-col will-change-transform
              inset-x-3 bottom-3 max-h-[85dvh]
              xl:inset-x-auto xl:bottom-auto xl:top-24 xl:right-6 xl:w-[340px] xl:max-h-[calc(100dvh-120px)]"
          >
            <ArrivingStrobi mood="reviewing" />
            <PlanContent onClose={closePlan} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function PlanContent({ onClose }) {
  const blueprint = useDecisionStore((s) => s.blueprint);
  const generatedOptions = useDecisionStore((s) => s.generatedOptions);
  const currentStep = useDecisionStore((s) => s.currentStep);
  const goToStep = useDecisionStore((s) => s.goToStep);
  const closePlan = useDecisionStore((s) => s.closePlan);

  const entries = useMemo(
    () => buildPlanEntries(blueprint, generatedOptions),
    [blueprint, generatedOptions],
  );
  const reached = entries.filter((e) => e.status !== "pending");
  const pending = entries.filter((e) => e.status === "pending");
  const progress = Math.round((reached.length / entries.length) * 100);

  const [openIds, setOpenIds] = useState(() => new Set());
  const [copied, setCopied] = useState(false);

  const toggle = (id) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const handleGoTo = (stepNumber) => {
    goToStep(stepNumber);
    // En móvil la hoja tapa la estación: se cierra; en escritorio se queda
    if (!window.matchMedia("(min-width: 1280px)").matches) closePlan();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildPlanMarkdown(blueprint, entries));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Portapapeles no disponible (p. ej. sin permisos)
    }
  };

  return (
    <div className="flex-1 min-h-0 rounded-3xl bg-neutral-900/95 border border-amber-900/50 shadow-[0_20px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/5 flex flex-col overflow-hidden">
      {/* Cabecera */}
      <div className="px-4 sm:px-5 pt-7 pb-3 border-b border-neutral-800 flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Lightbulb className="w-3 h-3" /> Mi plano
            </span>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug mt-0.5 truncate">
              {blueprint.selectedName || "Proyecto sin nombre"}
            </h3>
            <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">
              {blueprint.idea}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar mi plano"
            autoFocus
            className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-950 border border-neutral-800 text-neutral-400 shrink-0">
            {contextLabel(blueprint.context)}
          </span>
          <div className="flex-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-sky-400 to-emerald-400 transition-[width] duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-[10px] font-mono text-neutral-400 shrink-0">
            {reached.length}/{entries.length}
          </span>
        </div>

        <p className="text-[11px] sm:text-xs text-amber-100/90 bg-amber-950/20 border border-amber-900/40 rounded-xl px-2.5 py-2">
          {planComment(entries)}
        </p>
      </div>

      {/* Estaciones */}
      <div className="flex-1 min-h-0 overflow-y-auto scrollbar-thin px-3 sm:px-4 py-3 flex flex-col gap-2">
        <PhaseLegend />

        {reached.length === 0 && (
          <p className="text-xs text-neutral-500 text-center py-6">
            Confirma tu primera estación y aparecerá aquí.
          </p>
        )}

        {reached.map((entry) => (
          <PlanEntry
            key={entry.station.id}
            entry={entry}
            isOpen={openIds.has(entry.station.id)}
            isCurrent={entry.station.stepNumber === currentStep}
            onToggle={() => toggle(entry.station.id)}
            onGoTo={() => handleGoTo(entry.station.stepNumber)}
          />
        ))}

        {pending.length > 0 && (
          <div className="shrink-0 mt-2 flex flex-col gap-1">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-1">
              Por decidir
            </span>
            {pending.map(({ station }) => {
              const phase = getPhase(station);
              return (
                <div
                  key={station.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-dashed border-neutral-800 text-neutral-500"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 opacity-50 ${phase.dot}`}
                  />
                  <span className="text-[10px] font-mono w-5 shrink-0">
                    {station.stepNumber}
                  </span>
                  <span className="text-[11px] truncate">{station.title}</span>
                  <CircleDashed className="w-3 h-3 ml-auto shrink-0" />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pie: copiar */}
      <div className="shrink-0 border-t border-neutral-800 px-3 sm:px-4 py-2.5">
        <button
          type="button"
          onClick={handleCopy}
          disabled={reached.length === 0}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
          {copied ? "¡Resumen copiado!" : "Copiar resumen (Markdown)"}
        </button>
      </div>
    </div>
  );
}

function PhaseLegend() {
  return (
    <div className="shrink-0 flex items-center gap-x-3 gap-y-1 flex-wrap px-1 pb-1">
      {Object.entries(PHASES).map(([id, phase]) => (
        <span
          key={id}
          className="flex items-center gap-1 text-[10px] font-mono text-neutral-400"
        >
          <span className={`w-2 h-2 rounded-full ${phase.dot}`} />
          {phase.label}
        </span>
      ))}
    </div>
  );
}

/** Desplegable de una estación: cerrado = chips; abierto = todo el detalle. */
function PlanEntry({ entry, isOpen, isCurrent, onToggle, onGoTo }) {
  const { station, status, value, chips } = entry;
  const phase = getPhase(station);
  const isSkipped = status === "skipped";

  return (
    <div
      className={`shrink-0 rounded-2xl border overflow-hidden transition-colors ${
        isOpen ? `${phase.border} ${phase.soft}` : "border-neutral-800 bg-neutral-950/60"
      } ${isCurrent ? `ring-1 ${phase.ring}` : ""}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        disabled={isSkipped}
        className="w-full text-left px-3 py-2.5 flex items-start gap-2.5 cursor-pointer disabled:cursor-default"
      >
        <span
          className={`shrink-0 w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center text-neutral-950 ${phase.dot} ${isSkipped ? "opacity-40" : ""}`}
        >
          {station.stepNumber}
        </span>
        <span className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="flex items-center gap-1.5">
            <span
              className={`text-xs font-semibold ${isSkipped ? "text-neutral-500" : "text-white"}`}
            >
              {station.title}
            </span>
            {isCurrent && (
              <span className={`text-[9px] font-mono uppercase ${phase.text}`}>
                · Aquí
              </span>
            )}
          </span>
          {isSkipped ? (
            <span className="text-[10px] font-mono text-neutral-500 flex items-center gap-1">
              <SkipForward className="w-3 h-3" /> Omitida
            </span>
          ) : (
            <span className="flex flex-wrap gap-1">
              {chips.map((chip) => (
                <span
                  key={chip}
                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300 max-w-full truncate"
                >
                  {chip}
                </span>
              ))}
            </span>
          )}
        </span>
        {!isSkipped && (
          <ChevronDown
            className={`w-4 h-4 text-neutral-500 shrink-0 mt-1 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
          />
        )}
      </button>

      {/* Animación de alto con grid (barata, sin medir el contenido) */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${
          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          {isOpen && (
            <div className="px-3 pb-3 flex flex-col gap-2.5">
              <StationDetail station={station} value={value} />
              <button
                type="button"
                onClick={onGoTo}
                className={`self-start flex items-center gap-1 text-[11px] font-mono ${phase.text} hover:underline cursor-pointer`}
              >
                Ir a esta estación <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Detalle por estación ----------
const asList = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

const Text = ({ children, className = "" }) =>
  children ? (
    <p className={`text-[11px] sm:text-xs text-neutral-300 leading-relaxed ${className}`}>
      {children}
    </p>
  ) : null;

const Bullets = ({ items, marker, markerClass }) =>
  items?.length ? (
    <ul className="flex flex-col gap-0.5">
      {items.map((item) => (
        <li key={item} className="flex gap-1.5 text-[11px] text-neutral-400 leading-snug">
          <span className={`font-mono text-[9px] mt-0.5 shrink-0 ${markerClass}`}>
            {marker}
          </span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  ) : null;

const ProsCons = ({ pros, cons }) =>
  pros || cons ? (
    <div className="flex flex-col gap-1">
      {pros && <Text className="text-emerald-300/90">✓ {pros}</Text>}
      {cons && <Text className="text-amber-300/90">⚠ {cons}</Text>}
    </div>
  ) : null;

const Techs = ({ items }) =>
  items?.length ? (
    <div className="flex flex-wrap gap-1">
      {items.map((t) => (
        <TechChip
          key={t}
          name={t}
          className="rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300"
        />
      ))}
    </div>
  ) : null;

function StationDetail({ station, value }) {
  switch (station.id) {
    case "naming":
      return <Text>Tu proyecto se llama <b className="text-white">{value}</b>.</Text>;

    case "system-type": {
      const extras = (value.complements || [])
        .map((id) => SYSTEM_COMPLEMENTS.find((c) => c.id === id)?.title)
        .filter(Boolean);
      return (
        <>
          <Text>{value.summary}</Text>
          <div className="flex flex-wrap gap-1">
            {(value.surfaces || []).map((s) => (
              <span
                key={s}
                className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300"
              >
                {SURFACES[s] || s}
              </span>
            ))}
          </div>
          {extras.length > 0 && <Text>Complementos: {extras.join(", ")}</Text>}
        </>
      );
    }

    case "requirements":
      return asList(value).map((m) => (
        <div key={m.id || m.title} className="flex flex-col gap-1">
          <span className="text-[11px] font-semibold text-white">{m.title}</span>
          <Bullets items={m.functional} marker="RF" markerClass="text-sky-400" />
          <Bullets items={m.nonFunctional} marker="RNF" markerClass="text-violet-400" />
        </div>
      ));

    case "user-stories":
      return (
        <ul className="flex flex-col gap-1.5">
          {asList(value).map((s) => (
            <li key={s.id || s.title} className="text-[11px] text-neutral-300 leading-snug">
              Como <b className="text-white">{s.role || "usuario"}</b>, quiero{" "}
              {s.action || s.title}
              {s.benefit ? `, para ${s.benefit}` : ""}.
            </li>
          ))}
        </ul>
      );

    case "stack":
      return (
        <>
          <Text>
            <b className="text-white">{value.title}</b>
            {value.selectedLanguage ? ` · ${value.selectedLanguage}` : ""}
          </Text>
          <Techs items={value.tags} />
          <Text>{value.summary}</Text>
          <ProsCons pros={value.pros} cons={value.cons} />
        </>
      );

    case "diagrams":
      return (
        <ul className="flex flex-col gap-1.5">
          {asList(value).map((d) => (
            <li key={d.id || d.title} className="flex flex-col gap-0.5">
              <span className="text-[11px] font-semibold text-white">
                {d.title}
                {d.category ? (
                  <span className="ml-1.5 text-[9px] font-mono text-violet-300">
                    {d.category}
                  </span>
                ) : null}
              </span>
              <Text className="text-neutral-400">{d.summary}</Text>
            </li>
          ))}
        </ul>
      );

    default:
      return asList(value).map((item) => (
        <div key={item.id || item.title} className="flex flex-col gap-1.5">
          <Text>
            <b className="text-white">{item.title}</b>
            {item.tag ? <span className="text-neutral-500"> · {item.tag}</span> : null}
          </Text>
          <Text className="text-neutral-400">{item.summary}</Text>
          <Techs items={item.techs} />
          <ProsCons pros={item.pros} cons={item.cons} />
        </div>
      ));
  }
}
