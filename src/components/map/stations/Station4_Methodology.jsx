"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { SelectionCard } from "./SelectionCard";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import {
  Lock,
  RotateCcw,
  ArrowRight,
  SkipForward,
  Kanban,
  Repeat,
  Target,
  Zap,
  CalendarDays,
  Workflow,
  ShieldCheck,
} from "lucide-react";

function getMethodologyIcon(title = "", summary = "") {
  const text = `${title} ${summary}`.toLowerCase();

  if (
    text.includes("kanban") ||
    text.includes("wip") ||
    text.includes("tablero")
  ) {
    return Kanban;
  }
  if (
    text.includes("scrum") ||
    text.includes("sprint") ||
    text.includes("ceremonia")
  ) {
    return Repeat;
  }
  if (
    text.includes("shape up") ||
    text.includes("enfoque") ||
    text.includes("apetito") ||
    text.includes("sniper")
  ) {
    return Target;
  }
  if (
    text.includes("xp") ||
    text.includes("extreme") ||
    text.includes("tdd") ||
    text.includes("trunk")
  ) {
    return Zap;
  }
  if (
    text.includes("academ") ||
    text.includes("formal") ||
    text.includes("cascada")
  ) {
    return ShieldCheck;
  }
  if (text.includes("semanal") || text.includes("calendario")) {
    return CalendarDays;
  }
  return Workflow;
}

export function Station4_Methodology({ data, onNext }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const generatedOptions = useDecisionStore((state) => state.generatedOptions);
  const currentStep = useDecisionStore((state) => state.currentStep);
  const goToStep = useDecisionStore((state) => state.goToStep);
  const truncateWorkflowFrom = useDecisionStore(
    (state) => state.truncateWorkflowFrom,
  );

  const [confirmRewriteOpen, setConfirmRewriteOpen] = useState(false);

  const highestStep = Math.max(
    ...Object.keys(generatedOptions)
      .map(Number)
      .filter((n) => !isNaN(n)),
    currentStep,
    blueprint.selectedDiagrams?.length > 0 ? 5 : 4,
    4,
  );

  const isLockedHistory = Boolean(
    highestStep > 4 ||
    generatedOptions[5] ||
    generatedOptions["diagrams"] ||
    blueprint.selectedDiagrams?.length > 0,
  );

  const options = data?.options || [];
  const [selectedId, setSelectedId] = useState(
    blueprint.selectedMethodology?.id || options[0]?.id || "",
  );

  useEffect(() => {
    if (!selectedId && options.length > 0) {
      setSelectedId(blueprint.selectedMethodology?.id || options[0]?.id);
    }
  }, [options, blueprint.selectedMethodology, selectedId]);

  const selectedOption =
    options.find((o) => o.id === selectedId) ||
    blueprint.selectedMethodology ||
    options[0] ||
    null;

  const handleSelect = (option) => {
    if (isLockedHistory) return;
    setSelectedId(option.id);
    updateBlueprint({ selectedMethodology: option });
    setCompanion(
      "working",
      `Flujo "${option.title}" seleccionado. Una cadencia de trabajo realista para mantener el ritmo de desarrollo.`,
    );
  };

  const handleConfirm = () => {
    if (isLockedHistory) {
      goToStep(highestStep);
      return;
    }

    if (!selectedOption) return;
    updateBlueprint({ selectedMethodology: selectedOption });
    onNext({ selectedMethodology: selectedOption });
  };

  const handleRewriteConfirm = () => {
    truncateWorkflowFrom(4);
    setConfirmRewriteOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.06 },
    },
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <span>Estación 4 · Metodología de Trabajo</span>
            {isLockedHistory && (
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Modo Consulta
              </span>
            )}
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Cadencia de sprints y flujo de desarrollo
          </h2>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {!isLockedHistory && (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer shrink-0"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Omitir</span>
            </button>
          )}
          <TopBarControls />
        </div>
      </div>

      {/* Leyenda responsiva */}
      <div className="flex items-center gap-3 sm:gap-4 px-3 py-2 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-[10px] sm:text-[11px] font-mono flex-wrap">
        <span className="text-neutral-500">Carga Operativa:</span>
        <div className="flex items-center gap-1.5 text-sky-400">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-400" />
          <span>Ágil / Cero Fricción</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400" />
          <span>Iterativo / Semanal</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400" />
          <span>Estructurado</span>
        </div>
      </div>

      {/* Skeletons Shimmer durante carga */}
      {isLoading && options.length === 0 ? (
        <SkeletonGrid
          count={4}
          columns="grid-cols-1 md:grid-cols-2"
          height="h-[250px]"
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
        >
          {options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            const isDimmed = isLockedHistory && !isSelected;
            const IconComponent = getMethodologyIcon(opt.title, opt.summary);

            return (
              <div
                key={opt.id}
                className={`transition-opacity duration-300 w-full flex ${
                  isDimmed
                    ? "opacity-35 grayscale pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <SelectionCard
                  icon={
                    <IconComponent className="w-4 h-4 mr-1.5 text-neutral-300 shrink-0" />
                  }
                  title={opt.title || opt.name}
                  subtitle={opt.summary || opt.description}
                  tag={opt.tag}
                  pros={opt.pros}
                  cons={opt.cons}
                  techs={opt.techs || []}
                  level={opt.level || "medium"}
                  isSelected={isSelected}
                  onClick={() => handleSelect(opt)}
                />
              </div>
            );
          })}
        </motion.div>
      )}

      {/* Botones Inferiores Responsivos */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 pt-1">
        <div className="w-full sm:w-auto">
          {(isLockedHistory || Boolean(blueprint.selectedMethodology)) && (
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
            disabled={!selectedOption || isLoading}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            {isLockedHistory ? (
              <>
                <span>Volver al Flujo (Fase {highestStep})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Confirmar Metodología</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmRewriteOpen}
        onClose={() => setConfirmRewriteOpen(false)}
        onConfirm={handleRewriteConfirm}
        variant="danger"
        tag="Reescritura de Flujo"
        title="¿Cambiar la metodología de trabajo?"
        description="Se desbloquearán las opciones de metodología. Ten en cuenta que los diagramas y configuraciones calculadas más adelante se descartarán."
        confirmText="Sí, desbloquear y reescribir"
        cancelText="Conservar como está"
      />
    </div>
  );
}
