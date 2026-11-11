"use client";

import { useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { useStationNavigation } from "@/hooks/useStationNavigation";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { getLevelStyle } from "./levelStyles";
import { Lock, RotateCcw, ArrowRight, SkipForward } from "lucide-react";

/**
 * Estructura común de las estaciones 1-9: cabecera con badge de Modo Consulta,
 * toolbar, leyenda opcional, contenido y pie con "Reescribir desde aquí" +
 * "Confirmar" / "Volver al Flujo". La lógica de bloqueo vive aquí y en
 * `useStationNavigation`, no en cada estación.
 */
export function StationShell({
  stepNumber,
  eyebrow,
  title,
  legend = null,
  onSkip = null,
  confirmLabel = "Confirmar y Avanzar",
  onConfirm,
  confirmDisabled = false,
  rewriteTitle,
  rewriteDescription = "Se desbloquearán las opciones de esta estación. Todo lo calculado más adelante se descartará.",
  children,
}) {
  const isLoading = useDecisionStore((s) => s.isLoading);
  const { highestStep, isLockedHistory, returnToFlow, rewriteFromHere } =
    useStationNavigation(stepNumber);
  const [confirmRewriteOpen, setConfirmRewriteOpen] = useState(false);

  const handlePrimary = () => (isLockedHistory ? returnToFlow() : onConfirm());

  const handleRewriteConfirm = () => {
    rewriteFromHere();
    setConfirmRewriteOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <span>
              Estación {stepNumber} · {eyebrow}
            </span>
            {isLockedHistory && (
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Modo Consulta
              </span>
            )}
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            {title}
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {onSkip && !isLockedHistory && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onSkip}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Omitir</span>
            </button>
          )}
          <TopBarControls />
        </div>
      </div>

      {legend}

      {children}

      {/* Pie de navegación */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 pt-1">
        <div className="w-full sm:w-auto">
          {isLockedHistory && (
            <button
              type="button"
              onClick={() => setConfirmRewriteOpen(true)}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 hover:text-amber-200 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reescribir desde aquí</span>
            </button>
          )}
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <button
            type="button"
            disabled={isLoading || (!isLockedHistory && confirmDisabled)}
            onClick={handlePrimary}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            <span>
              {isLockedHistory
                ? `Volver al Flujo (Fase ${highestStep})`
                : confirmLabel}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmRewriteOpen}
        onClose={() => setConfirmRewriteOpen(false)}
        onConfirm={handleRewriteConfirm}
        variant="danger"
        tag="Reescritura de Flujo"
        title={rewriteTitle || `¿Reescribir desde la Estación ${stepNumber}?`}
        description={rewriteDescription}
        confirmText="Sí, desbloquear y reescribir"
        cancelText="Conservar como está"
      />
    </div>
  );
}

/** Leyenda de niveles de complejidad (sky / amber / rose). */
export function LevelLegend({ label, simple, medium, advanced }) {
  const items = [
    ["simple", simple],
    ["medium", medium],
    ["advanced", advanced],
  ];
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-3 py-2 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-[10px] sm:text-[11px] font-mono flex-wrap">
      <span className="text-neutral-500">{label}:</span>
      {items.map(([level, text]) => {
        const style = getLevelStyle(level);
        return (
          <div
            key={level}
            className={`flex items-center gap-1.5 ${style.text}`}
          >
            <span
              className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${style.accentDot}`}
            />
            <span>{text}</span>
          </div>
        );
      })}
    </div>
  );
}

/** Variantes de entrada escalonada para las grillas de opciones. */
export const staggerContainer = (stagger = 0.06) => ({
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: stagger } },
});
