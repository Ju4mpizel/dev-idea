"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Check, Lock, RotateCcw, ArrowRight } from "lucide-react";

export function Station2_Stack({ data, onNext }) {
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
    2,
  );

  // Si ya se generó la estación 3 en adelante, estamos en modo seguro/consulta
  const isLockedHistory = Boolean(
    generatedOptions[3] || generatedOptions["architecture"],
  );

  const stacks = data?.stacks || [];
  const [selectedId, setSelectedId] = useState(
    blueprint.selectedStack?.id || stacks[0]?.id || "",
  );

  const [languageChoices, setLanguageChoices] = useState(() => {
    const initial = {};
    stacks.forEach((s) => {
      initial[s.id] =
        s.defaultLanguage || s.availableLanguages?.[0] || "TypeScript";
    });
    return initial;
  });

  useEffect(() => {
    if (!selectedId && stacks.length > 0) {
      setSelectedId(blueprint.selectedStack?.id || stacks[0]?.id);
    }
  }, [stacks, blueprint.selectedStack, selectedId]);

  const handleLanguageChange = (stackId, lang) => {
    if (isLockedHistory) return;
    setLanguageChoices((prev) => ({ ...prev, [stackId]: lang }));
  };

  const handleSelectStack = (stack) => {
    if (isLockedHistory) return;
    setSelectedId(stack.id);
    setCompanion(
      "curious",
      `¿${stack.title} con ${languageChoices[stack.id]}? Interesante, analicemos sus límites.`,
    );
  };

  const handleConfirm = () => {
    if (isLockedHistory) {
      goToStep(highestStep);
      return;
    }

    const chosen = stacks.find((s) => s.id === selectedId);
    if (!chosen) return;

    const selectedStackPayload = {
      ...chosen,
      selectedLanguage: languageChoices[chosen.id],
    };

    updateBlueprint({
      selectedStack: selectedStackPayload,
    });

    onNext({ selectedStack: selectedStackPayload });
  };

  const handleRewriteConfirm = () => {
    truncateWorkflowFrom(2);
    setConfirmRewriteOpen(false);
  };

  const levelStyles = {
    simple: {
      badge: "bg-sky-950/80 border-sky-800 text-sky-400",
      borderSelected:
        "border-sky-400 ring-1 ring-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.15)]",
      checkSelected: "bg-sky-400 border-sky-400 text-neutral-950",
      accentDot: "bg-sky-400",
    },
    medium: {
      badge: "bg-amber-950/80 border-amber-800 text-amber-400",
      borderSelected:
        "border-amber-400 ring-1 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.15)]",
      checkSelected: "bg-amber-400 border-amber-400 text-neutral-950",
      accentDot: "bg-amber-400",
    },
    advanced: {
      badge: "bg-rose-950/80 border-rose-800 text-rose-400",
      borderSelected:
        "border-rose-400 ring-1 ring-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
      checkSelected: "bg-rose-400 border-rose-400 text-neutral-950",
      accentDot: "bg-rose-400",
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  return (
    <div className="w-full flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <span>Estación 2 · Stack Tecnológico</span>
            {isLockedHistory && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Modo Consulta
              </span>
            )}
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Combinaciones balanceadas a tu medida
          </h2>
        </div>

        <TopBarControls />
      </div>

      <div className="flex items-center gap-4 px-3 py-2 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-[11px] font-mono">
        <span className="text-neutral-500">Dificultad de Setup:</span>
        <div className="flex items-center gap-1.5 text-sky-400">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Ágil / Directo</span>
        </div>
        <div className="flex items-center gap-1.5 text-amber-400">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Pragmático</span>
        </div>
        <div className="flex items-center gap-1.5 text-rose-400">
          <span className="w-2 h-2 rounded-full bg-rose-400" />
          <span>Enterprise / Robusto</span>
        </div>
      </div>

      {isLoading && stacks.length === 0 ? (
        <div className="flex gap-4 overflow-x-hidden pb-4 pt-1">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="w-[300px] sm:w-[330px] shrink-0 h-[310px] p-5 rounded-2xl border border-neutral-800 bg-neutral-900/30 backdrop-blur-md flex flex-col justify-between animate-pulse"
            >
              <div>
                <div className="h-4 w-28 bg-neutral-800 rounded mb-3" />
                <div className="h-5 w-44 bg-neutral-800 rounded mb-4" />
                <div className="flex gap-2 mb-4">
                  <div className="h-4 w-14 bg-neutral-800/60 rounded" />
                  <div className="h-4 w-16 bg-neutral-800/60 rounded" />
                </div>
                <div className="h-3 w-full bg-neutral-800/50 rounded mb-1" />
                <div className="h-3 w-4/5 bg-neutral-800/50 rounded" />
              </div>
              <div className="h-4 w-32 bg-neutral-800/40 rounded pt-3 border-t border-neutral-900" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-track-neutral-950 scrollbar-thumb-neutral-800"
        >
          {stacks.map((stack) => {
            const isSelected = selectedId === stack.id;
            const currentLang = languageChoices[stack.id];
            const currentLevel = stack.level || "medium";
            const style = levelStyles[currentLevel] || levelStyles.medium;
            const isDimmed = isLockedHistory && !isSelected;

            return (
              <motion.div
                key={stack.id}
                whileHover={!isLockedHistory ? { y: -2 } : {}}
                whileTap={!isLockedHistory ? { scale: 0.99 } : {}}
                onClick={() => handleSelectStack(stack)}
                className={`w-[300px] sm:w-[340px] shrink-0 snap-start flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 select-none backdrop-blur-md ${
                  isSelected
                    ? `bg-neutral-900/90 ${style.borderSelected}`
                    : isDimmed
                      ? "bg-neutral-950/40 border-neutral-900/50 opacity-35 grayscale cursor-not-allowed"
                      : "bg-neutral-950/70 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40 cursor-pointer"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${
                        isDimmed
                          ? "bg-neutral-900 border-neutral-800 text-neutral-500"
                          : style.badge
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          isDimmed ? "bg-neutral-600" : style.accentDot
                        }`}
                      />
                      {stack.badge || currentLevel.toUpperCase()}
                    </span>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? style.checkSelected
                          : "border-neutral-700 bg-neutral-900 text-transparent"
                      }`}
                    >
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  </div>

                  <h3
                    className={`text-base font-semibold tracking-tight ${
                      isDimmed ? "text-neutral-500" : "text-neutral-100"
                    }`}
                  >
                    {stack.title}
                  </h3>

                  <div className="flex flex-wrap gap-1.5 my-3">
                    {stack.tags.map((tag) => (
                      <span
                        key={tag}
                        className={`text-[11px] px-2 py-0.5 rounded border font-mono ${
                          isDimmed
                            ? "bg-neutral-950 border-neutral-900 text-neutral-600"
                            : "bg-neutral-900 border-neutral-800 text-neutral-300"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {stack.availableLanguages &&
                    stack.availableLanguages.length > 1 && (
                      <div
                        className="my-3 p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-xs"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="text-neutral-400 font-mono text-[11px]">
                          Sabor / Lenguaje:
                        </span>
                        <select
                          disabled={isLockedHistory}
                          value={currentLang}
                          onChange={(e) =>
                            handleLanguageChange(stack.id, e.target.value)
                          }
                          className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded px-2 py-1 outline-none font-mono disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                        >
                          {stack.availableLanguages.map((lang) => (
                            <option key={lang} value={lang}>
                              {lang}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                  <div className="space-y-2 mt-4 text-xs">
                    <p
                      className={`leading-relaxed ${
                        isDimmed ? "text-neutral-600" : "text-emerald-400/90"
                      }`}
                    >
                      <span className="font-bold mr-1">+</span>
                      {stack.pro}
                    </p>
                    <p className="text-neutral-500 leading-relaxed">
                      <span className="font-bold mr-1 text-neutral-600">-</span>
                      {stack.con}
                    </p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-neutral-900 flex justify-between items-center text-[11px] font-mono text-neutral-500">
                  <span>Variante: {currentLang}</span>
                  {isSelected && (
                    <span className="text-neutral-300 font-medium">
                      Seleccionado ✓
                    </span>
                  )}
                </div>
              </motion.div>
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
            disabled={!selectedId || isLoading}
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
                <span>Confirmar Stack y Continuar</span>
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
        title="¿Cambiar tu elección de Stack?"
        description="Se desbloquearán todas las opciones de stack. Ten en cuenta que la arquitectura y diagramas generados más adelante se descartarán para recalcularse con el nuevo camino."
        confirmText="Sí, desbloquear y reescribir"
        cancelText="Conservar como está"
      />
    </div>
  );
}
