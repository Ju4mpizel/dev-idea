"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { SelectionCard } from "./SelectionCard";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { Lock, RotateCcw, ArrowRight } from "lucide-react";

export function Station3_Architecture({ data, onNext }) {
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
    blueprint.selectedMethodology ? 4 : 3,
    3,
  );

  const isLockedHistory = Boolean(
    highestStep > 3 ||
    generatedOptions[4] ||
    generatedOptions["methodology"] ||
    blueprint.selectedMethodology,
  );

  const options = data?.options || data?.architectures || data?.patterns || [];

  const [selectedId, setSelectedId] = useState(
    blueprint.selectedArchitecture?.id || options[0]?.id || "",
  );

  useEffect(() => {
    if (!selectedId && options.length > 0) {
      setSelectedId(blueprint.selectedArchitecture?.id || options[0]?.id);
    }
  }, [options, blueprint.selectedArchitecture, selectedId]);

  const selectedOption =
    options.find((o) => o.id === selectedId) ||
    blueprint.selectedArchitecture ||
    options[0] ||
    null;

  const handleSelect = (option) => {
    if (isLockedHistory) return;
    setSelectedId(option.id);
    updateBlueprint({ selectedArchitecture: option });
    setCompanion(
      "thinking",
      `Patrón "${option.title || option.name}" seleccionado. Una base sólida para estructurar los módulos.`,
    );
  };

  const handleConfirm = () => {
    if (isLockedHistory) {
      goToStep(highestStep);
      return;
    }

    if (!selectedOption) return;
    updateBlueprint({ selectedArchitecture: selectedOption });
    onNext({ selectedArchitecture: selectedOption });
  };

  const handleRewriteConfirm = () => {
    truncateWorkflowFrom(3);
    setConfirmRewriteOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <span>Estación 3 · Arquitectura Técnica</span>
            {isLockedHistory && (
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Modo Consulta
              </span>
            )}
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Patrón estructural de tu software
          </h2>
        </div>

        <TopBarControls />
      </div>

      {/* Leyenda de Complejidad */}
      <div className="flex items-center gap-3 sm:gap-4 px-3 py-2 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-[10px] sm:text-[11px] font-mono flex-wrap">
        <span className="text-neutral-500">Complejidad:</span>
        <div className="flex items-center gap-1.5 text-sky-400">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-sky-400" />
          <span>Simple / Rápido</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-amber-400" />
          <span>Pragmático</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400">
          <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-rose-400" />
          <span>Avanzado</span>
        </div>
      </div>

      {/* Skeletons Shimmer de 6 Opciones */}
      {isLoading && options.length === 0 ? (
        <SkeletonGrid
          count={6}
          columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          height="h-[270px]"
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            const isDimmed = isLockedHistory && !isSelected;

            return (
              <div
                key={opt.id}
                className={`transition-opacity duration-300 ${
                  isDimmed
                    ? "opacity-35 grayscale pointer-events-none"
                    : "opacity-100"
                }`}
              >
                <SelectionCard
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
          {(isLockedHistory || Boolean(blueprint.selectedArchitecture)) && (
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
                <span>Confirmar Arquitectura</span>
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
        title="¿Cambiar el patrón arquitectónico?"
        description="Se desbloquearán todas las opciones de arquitectura. Ten en cuenta que la metodología y diagramas calculados más adelante se descartarán."
        confirmText="Sí, desbloquear y reescribir"
        cancelText="Conservar como está"
      />
    </div>
  );
}
