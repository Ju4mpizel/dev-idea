"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { SelectionCard } from "./SelectionCard";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Lock, RotateCcw, ArrowRight } from "lucide-react";

export function Station3_Architecture({ data, onNext }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
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
    3,
  );

  // Si ya existe la estación 4 en adelante, estamos en modo seguro/consulta
  const isLockedHistory = Boolean(
    generatedOptions[4] || generatedOptions["methodology"],
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
    onNext();
  };

  const handleRewriteConfirm = () => {
    truncateWorkflowFrom(3);
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
    <div className="w-full flex flex-col gap-6">
      {/* Cabecera con Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <span>Estación 3 · Arquitectura Técnica</span>
            {isLockedHistory && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Modo Consulta
              </span>
            )}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Patrón estructural de tu software
          </h2>
        </div>

        <TopBarControls />
      </div>

      {/* Leyenda de Complejidad por Colores */}
      <div className="flex items-center gap-4 px-3 py-2 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-[11px] font-mono">
        <span className="text-neutral-500">Complejidad:</span>
        <div className="flex items-center gap-1.5 text-sky-400">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Simple / Rápido</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Pragmático / Modular</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Avanzado / Robusto</span>
        </div>
      </div>

      {/* Skeletons horizontales durante la carga */}
      {isLoading && options.length === 0 ? (
        <div className="flex gap-4 overflow-x-hidden pb-4 pt-1">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div
              key={n}
              className="w-[300px] sm:w-[330px] shrink-0 h-[280px] p-5 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-md flex flex-col justify-between animate-pulse"
            >
              <div>
                <div className="h-4 w-20 bg-neutral-800 rounded mb-3" />
                <div className="h-5 w-40 bg-neutral-800 rounded mb-2" />
                <div className="h-3 w-full bg-neutral-800/60 rounded mb-1" />
                <div className="h-3 w-4/5 bg-neutral-800/60 rounded" />
              </div>
              <div className="pt-3 border-t border-neutral-900 flex gap-2">
                <div className="h-4 w-14 bg-neutral-800/80 rounded" />
                <div className="h-4 w-16 bg-neutral-800/80 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Carrusel Deslizante Horizontal (Slide de 6 Opciones) */
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-track-neutral-950 scrollbar-thumb-neutral-800"
        >
          {options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            const isDimmed = isLockedHistory && !isSelected;

            return (
              <div
                key={opt.id}
                className={`w-[300px] sm:w-[330px] shrink-0 snap-start flex transition-opacity duration-300 ${
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

      {/* Zona de Botones Inferior */}
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
            disabled={!selectedOption || isLoading}
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
