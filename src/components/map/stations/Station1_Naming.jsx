"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Lock, RotateCcw, ArrowRight, Sparkles, PenTool } from "lucide-react";

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

  // Fase máxima alcanzada en el proyecto
  const highestStep = Math.max(
    ...Object.keys(generatedOptions)
      .map(Number)
      .filter((n) => !isNaN(n)),
    1,
  );

  // Si ya existe la estación 2 en adelante, estamos en modo seguro/consulta
  const isLockedHistory = Boolean(
    generatedOptions[2] || generatedOptions["stack"],
  );

  const names = data?.names || [];

  // Determinamos si el nombre guardado vino de la IA o fue escrito por el usuario
  const [selectedName, setSelectedName] = useState(
    blueprint.selectedName || names[0]?.name || "",
  );

  // Estado para el input personalizado
  const [customName, setCustomName] = useState(() => {
    const isFromAI = names.some((n) => n.name === blueprint.selectedName);
    return !isFromAI && blueprint.selectedName ? blueprint.selectedName : "";
  });

  useEffect(() => {
    if (!selectedName && names.length > 0 && !customName) {
      setSelectedName(blueprint.selectedName || names[0]?.name);
    }
  }, [names, blueprint.selectedName, selectedName, customName]);

  // Selección de tarjeta generada por la IA
  const handleSelectCard = (item) => {
    if (isLockedHistory) return;
    setCustomName("");
    setSelectedName(item.name);
    setCompanion(
      "thinking",
      `"${item.name}" tiene buen golpe. Veamos qué arquitectura le damos.`,
    );
  };

  // Manejo de nombre propio escrito por el usuario
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
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <span>Estación 1 · Identidad & Concepto</span>
            {isLockedHistory && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Modo Consulta
              </span>
            )}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Bautiza tu proyecto de software
          </h2>
        </div>

        <TopBarControls />
      </div>

      {/* Skeletons o Grid de Nombres sugeridos */}
      {isLoading && names.length === 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="p-5 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-md flex flex-col justify-between h-[155px] animate-pulse"
            >
              <div>
                <div className="h-4 w-24 bg-neutral-800 rounded mb-3" />
                <div className="h-6 w-32 bg-neutral-800 rounded mb-2" />
                <div className="h-3 w-48 bg-neutral-800/60 rounded" />
              </div>
              <div className="h-3 w-4/5 bg-neutral-800/40 rounded mt-3 pt-2 border-t border-neutral-900" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          {names.map((item) => {
            const isSelected = !isCustomActive && selectedName === item.name;
            const isDimmed = isLockedHistory && !isSelected;

            return (
              <motion.div
                key={item.id || item.name}
                onClick={() => handleSelectCard(item)}
                className={`p-5 rounded-2xl border transition-all duration-300 select-none backdrop-blur-md flex flex-col justify-between ${
                  isSelected
                    ? "bg-neutral-900/90 border-neutral-400 shadow-xl ring-1 ring-neutral-400"
                    : isDimmed
                      ? "bg-neutral-950/40 border-neutral-900/50 opacity-35 grayscale cursor-not-allowed"
                      : "bg-neutral-950/70 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40 cursor-pointer"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      {item.style}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
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
                    className={`text-lg font-bold ${
                      isDimmed ? "text-neutral-500" : "text-neutral-100"
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p className="text-xs text-neutral-400 mt-1">
                    {item.tagline}
                  </p>
                </div>

                <p className="text-[11px] font-mono text-neutral-500 mt-4 pt-3 border-t border-neutral-900">
                  {item.rationale}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Recuadro Horizontal: ¿Ya tienes un nombre? */}
      <div
        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md ${
          isCustomActive
            ? "bg-neutral-900/90 border-neutral-400 ring-1 ring-neutral-400 shadow-xl"
            : isLockedHistory
              ? "bg-neutral-950/40 border-neutral-900/50 opacity-40 grayscale"
              : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800"
        }`}
      >
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div
            className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
              isCustomActive
                ? "bg-white text-neutral-950 border-white"
                : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}
          >
            <PenTool className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-200">
                ¿Ya tienes tu propio nombre?
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 border border-neutral-700/60">
                Personalizado
              </span>
            </div>
            <p className="text-[11px] text-neutral-500">
              Escribe tu marca o nombre definitivo para usarlo en el plano
              técnico.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-72">
          <input
            type="text"
            disabled={isLockedHistory || isLoading}
            value={customName}
            onChange={(e) => handleCustomNameChange(e.target.value)}
            placeholder="Ej. QuickBite, DevFlow, AcuaLog..."
            className="w-full px-3.5 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs outline-none focus:border-neutral-500 transition-colors font-mono disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Botones Inferiores */}
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
            disabled={(!selectedName && !customName.trim()) || isLoading}
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
                <span>
                  {isCustomActive
                    ? "Usar este Nombre y Continuar"
                    : "Elegir Nombre y Continuar"}
                </span>
                <span>→</span>
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
        description="Se desbloquearán todas las opciones de nombre. Ten en cuenta que el stack, la arquitectura y los pasos calculados más adelante se descartarán."
        confirmText="Sí, desbloquear y reescribir"
        cancelText="Conservar como está"
      />
    </div>
  );
}
