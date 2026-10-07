"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { SelectionCard } from "./SelectionCard";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { ArrowRight, SkipForward, Lock, RotateCcw } from "lucide-react";

export function StationNode({ station, data, onAdvance }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const generatedOptions = useDecisionStore((state) => state.generatedOptions);
  const goToStep = useDecisionStore((state) => state.goToStep);
  const truncateWorkflowFrom = useDecisionStore(
    (state) => state.truncateWorkflowFrom,
  );

  const [confirmRewriteOpen, setConfirmRewriteOpen] = useState(false);

  // Fase máxima alcanzada en el proyecto
  const highestStep = Math.max(
    ...Object.keys(generatedOptions)
      .map(Number)
      .filter((n) => !isNaN(n)),
    station.stepNumber,
  );

  // Modo seguro si ya se generó la fase siguiente
  const isLockedHistory = Boolean(generatedOptions[station.stepNumber + 1]);

  const options = data?.options || [];
  const selectedOption = blueprint[station.id] || null;

  const handleSelect = (option) => {
    if (isLockedHistory) return;
    updateBlueprint({ [station.id]: option });
    setCompanion(
      "thinking",
      `Interesante elección: ${option.title || option.name}. Vamos a encajarlo en el blueprint.`,
    );
  };

  const handleConfirm = () => {
    if (isLockedHistory) {
      goToStep(highestStep);
      return;
    }
    onAdvance();
  };

  const handleRewriteConfirm = () => {
    truncateWorkflowFrom(station.stepNumber);
    setConfirmRewriteOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      className="w-full flex flex-col gap-6"
    >
      {/* Cabecera con Toolbar Contextual */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <span>
              Estación {station.stepNumber} · {station.title}
            </span>
            {isLockedHistory && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Modo Consulta
              </span>
            )}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            {station.subtitle}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {station.skippable && !isLockedHistory && (
            <button
              type="button"
              onClick={onAdvance}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800 text-xs font-mono text-neutral-400 hover:text-white transition-colors cursor-pointer"
            >
              <SkipForward className="w-3.5 h-3.5" />
              <span>Omitir</span>
            </button>
          )}
          <TopBarControls />
        </div>
      </div>

      {/* Grid de opciones con SelectionCard */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
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
                isSelected={isSelected}
                onClick={() => handleSelect(opt)}
              />
            </div>
          );
        })}
      </motion.div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div>
          {isLockedHistory && (
            <button
              type="button"
              onClick={() => setConfirmRewriteOpen(true)}
              className="px-4 py-2.5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 hover:text-amber-200 text-xs font-mono flex items-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reescribir desde aquí</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            disabled={!selectedOption && !station.skippable}
            onClick={handleConfirm}
            className="px-6 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            {isLockedHistory ? (
              <>
                <span>Volver al Flujo Actual (Fase {highestStep})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Confirmar y Avanzar</span>
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
        title={`¿Reescribir desde la Estación ${station.stepNumber}?`}
        description="Se desbloquearán las opciones de esta estación. Ten en cuenta que todas las estaciones generadas posteriormente se descartarán."
        confirmText="Sí, desbloquear y reescribir"
        cancelText="Conservar como está"
      />
    </motion.div>
  );
}
