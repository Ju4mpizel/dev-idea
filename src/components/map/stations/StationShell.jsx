"use client";

import { useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { useStationNavigation } from "@/hooks/useStationNavigation";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { getStationGuide } from "@/data/stationGuides";
import { getStationCategories } from "@/data/stationCategories";
import {
  Lock,
  RotateCcw,
  ArrowRight,
  SkipForward,
  HelpCircle,
  Layers,
} from "lucide-react";

/**
 * Estructura común de las estaciones con cartas: cabecera (título + botón
 * "¿Qué es...?" + toolbar), contenido (el mazo) y pie fijo con
 * "Omitir" / "Reescribir desde aquí" + resumen de selección + "Confirmar".
 * La lógica de bloqueo vive aquí y en `useStationNavigation`.
 */
export function StationShell({
  station,
  onSkip = null,
  confirmLabel = "Confirmar y Avanzar",
  onConfirm,
  confirmDisabled = false,
  selectionSummary = null,
  // Contenido en el centro del pie (p. ej. el campo de nombre propio)
  footerCenter = null,
  rewriteTitle,
  rewriteDescription = "Se desbloquearán las opciones de esta estación. Todo lo calculado más adelante se descartará.",
  // Fuerza el modo de edición aunque haya estaciones posteriores (p. ej. una
  // estación nueva que un proyecto antiguo aún no tiene decidida)
  forceEditable = false,
  children,
}) {
  const { stepNumber } = station;
  const isLoading = useDecisionStore((s) => s.isLoading);
  const infoStationId = useDecisionStore((s) => s.infoStationId);
  const openStationInfo = useDecisionStore((s) => s.openStationInfo);
  const closeStationInfo = useDecisionStore((s) => s.closeStationInfo);
  const isCategoriesOpen = useDecisionStore((s) => s.isCategoriesOpen);
  const toggleCategories = useDecisionStore((s) => s.toggleCategories);
  const navigation = useStationNavigation(stepNumber);
  const { highestStep, returnToFlow, rewriteFromHere } = navigation;
  const isLockedHistory = navigation.isLockedHistory && !forceEditable;
  const [confirmRewriteOpen, setConfirmRewriteOpen] = useState(false);

  const guide = getStationGuide(station.id);
  const hasCategories = Boolean(getStationCategories(station.id));
  const isInfoOpen = infoStationId === station.id;

  const handlePrimary = () => {
    closeStationInfo();
    if (isLockedHistory) returnToFlow();
    else onConfirm();
  };

  const handleRewriteConfirm = () => {
    rewriteFromHere();
    setConfirmRewriteOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-3 sm:gap-4">
      {/* Cabecera: fila 1 = estación + controles · fila 2 = título + "¿Qué es?" */}
      <div className="flex flex-col gap-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5 min-w-0">
            <span className="truncate">
              Estación {stepNumber} · {station.title}
            </span>
            {isLockedHistory && (
              <span className="shrink-0 text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                <span className="hidden sm:inline">Modo Consulta</span>
              </span>
            )}
          </span>
          <TopBarControls />
        </div>

        <div className="flex items-center gap-2">
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight text-balance">
            {station.subtitle}
          </h2>
          {hasCategories && (
            <button
              type="button"
              onClick={toggleCategories}
              aria-pressed={isCategoriesOpen}
              title="Ver la tabla de categorías de esta estación"
              className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] sm:text-[11px] font-mono transition-colors cursor-pointer ${
                isCategoriesOpen
                  ? "bg-violet-400 border-violet-400 text-neutral-950"
                  : "border-violet-900/70 bg-violet-950/30 text-violet-300 hover:bg-violet-900/40"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Categorías</span>
            </button>
          )}
          {guide && (
            <button
              type="button"
              onClick={() =>
                isInfoOpen ? closeStationInfo() : openStationInfo(station.id)
              }
              aria-pressed={isInfoOpen}
              title={guide.question}
              className={`shrink-0 flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] sm:text-[11px] font-mono transition-colors cursor-pointer ${
                isInfoOpen
                  ? "bg-sky-400 border-sky-400 text-neutral-950"
                  : "border-sky-900/70 bg-sky-950/30 text-sky-300 hover:bg-sky-900/40"
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">¿Qué es?</span>
            </button>
          )}
        </div>
      </div>

      {children}

      {/* Pie de navegación (siempre a la misma altura gracias al mazo fijo) */}
      <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
        <div className="w-full sm:w-auto flex items-center gap-2">
          {isLockedHistory ? (
            <button
              type="button"
              onClick={() => setConfirmRewriteOpen(true)}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 hover:text-amber-200 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reescribir desde aquí</span>
            </button>
          ) : (
            onSkip && (
              <button
                type="button"
                disabled={isLoading}
                onClick={() => {
                  closeStationInfo();
                  onSkip();
                }}
                className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <SkipForward className="w-3.5 h-3.5" />
                <span>Omitir estación</span>
              </button>
            )
          )}
        </div>

        {footerCenter && (
          <div className="w-full sm:flex-1 sm:max-w-sm">{footerCenter}</div>
        )}

        <div className="w-full sm:w-auto flex items-center gap-3">
          {selectionSummary && !isLockedHistory && (
            <span className="hidden sm:inline text-[11px] font-mono text-neutral-500 whitespace-nowrap">
              {selectionSummary}
            </span>
          )}
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
