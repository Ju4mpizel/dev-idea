"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { Lock, RotateCcw, ArrowRight, PenTool } from "lucide-react";

export function Station1_Naming({ data, onNext }) {
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

  const highestStep = Math.max(
    ...Object.keys(generatedOptions)
      .map(Number)
      .filter((n) => !isNaN(n)),
    1,
  );

  const isLockedHistory = Boolean(
    generatedOptions[2] || generatedOptions["stack"],
  );

  const names = data?.names || [];

  const [selectedName, setSelectedName] = useState(
    blueprint.selectedName || names[0]?.name || "",
  );

  const [customName, setCustomName] = useState(() => {
    const isFromAI = names.some((n) => n.name === blueprint.selectedName);
    return !isFromAI && blueprint.selectedName ? blueprint.selectedName : "";
  });

  useEffect(() => {
    if (!selectedName && names.length > 0 && !customName) {
      setSelectedName(blueprint.selectedName || names[0]?.name);
    }
  }, [names, blueprint.selectedName, selectedName, customName]);

  const handleSelectCard = (item) => {
    if (isLockedHistory) return;
    setCustomName("");
    setSelectedName(item.name);
    setCompanion(
      "thinking",
      `"${item.name}" tiene buen golpe. Veamos qué arquitectura le damos.`,
    );
  };

  const handleCustomNameChange = (val) => {
    if (isLockedHistory) return;
    setCustomName(val);
    setSelectedName(val);
    if (val.trim()) {
      setCompanion(
        "proud",
        `"${val.trim()}" me gusta. Un toque personal siempre le da identidad.`,
      );
    }
  };

  const handleConfirm = () => {
    if (isLockedHistory) {
      goToStep(highestStep);
      return;
    }

    const finalName = customName.trim() || selectedName.trim();
    if (!finalName) return;

    updateBlueprint({ selectedName: finalName });
    onNext();
  };

  const handleRewriteConfirm = () => {
    truncateWorkflowFrom(1);
    setConfirmRewriteOpen(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const isCustomActive = Boolean(customName.trim());

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <span>Estación 1 · Identidad & Concepto</span>
            {isLockedHistory && (
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Modo Consulta
              </span>
            )}
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Bautiza tu proyecto de software
          </h2>
        </div>

        <TopBarControls />
      </div>

      {/* Grid con Skeleton Shimmer durante carga */}
      {isLoading && names.length === 0 ? (
        <SkeletonGrid
          count={4}
          columns="grid-cols-1 sm:grid-cols-2"
          height="h-[155px]"
        />
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        >
          {names.map((item) => {
            const isSelected = !isCustomActive && selectedName === item.name;
            const isDimmed = isLockedHistory && !isSelected;

            return (
              <motion.div
                key={item.id || item.name}
                onClick={() => handleSelectCard(item)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 select-none backdrop-blur-md flex flex-col justify-between ${
                  isSelected
                    ? "bg-neutral-900/90 border-neutral-400 shadow-xl ring-1 ring-neutral-400"
                    : isDimmed
                      ? "bg-neutral-950/40 border-neutral-900/50 opacity-35 grayscale cursor-not-allowed"
                      : "bg-neutral-950/70 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40 cursor-pointer"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      {item.style}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-white bg-white"
                          : "border-neutral-700"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                      )}
                    </div>
                  </div>

                  <h3
                    className={`text-base sm:text-lg font-bold truncate ${
                      isDimmed ? "text-neutral-500" : "text-neutral-100"
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 line-clamp-2">
                    {item.tagline}
                  </p>
                </div>

                <p className="text-[10px] sm:text-[11px] font-mono text-neutral-500 mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-neutral-900 line-clamp-1">
                  {item.rationale}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Recuadro de Nombre Personalizado */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 backdrop-blur-md ${
          isCustomActive
            ? "bg-neutral-900/90 border-neutral-400 ring-1 ring-neutral-400 shadow-xl"
            : isLockedHistory
              ? "bg-neutral-950/40 border-neutral-900/50 opacity-40 grayscale"
              : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800"
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
              isCustomActive
                ? "bg-white text-neutral-950 border-white"
                : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-200">
                ¿Tienes tu propio nombre?
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 border border-neutral-700/60">
                Custom
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-500">
              Usa tu marca o nombre original en el blueprint técnico.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            disabled={isLockedHistory || isLoading}
            value={customName}
            onChange={(e) => handleCustomNameChange(e.target.value)}
            placeholder="Ej. DevFlow, AcuaLog..."
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs outline-none focus:border-neutral-500 transition-colors font-mono disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Botones de Navegación */}
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
            disabled={(!selectedName && !customName.trim()) || isLoading}
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
                <span>
                  {isCustomActive ? "Usar este Nombre" : "Confirmar Nombre"}
                </span>
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
        title="¿Cambiar el nombre del proyecto?"
        description="Se desbloquearán todas las opciones de nombre. El stack, la arquitectura y los pasos calculados posteriormente se descartarán."
        confirmText="Sí, desbloquear y reescribir"
        cancelText="Conservar como está"
      />
    </div>
  );
}
