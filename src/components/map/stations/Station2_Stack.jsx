"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked, useOptionSelection } from "@/hooks/useStationNavigation";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { SelectionCard } from "./SelectionCard";
import { StationShell, LevelLegend, staggerContainer } from "./StationShell";

const STEP = 2;

export function Station2_Stack({ data, onNext }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, STEP));

  const stacks = data?.stacks || [];
  const { selectedOption, selectOption } = useOptionSelection(
    stacks,
    blueprint.selectedStack,
  );

  // Solo guardamos los cambios del usuario; el valor efectivo se deriva en cada
  // render, así no queda `undefined` cuando las opciones llegan tras montar.
  const [languageOverrides, setLanguageOverrides] = useState({});

  const getLanguage = (stack) =>
    languageOverrides[stack.id] ||
    (blueprint.selectedStack?.id === stack.id
      ? blueprint.selectedStack.selectedLanguage
      : null) ||
    stack.defaultLanguage ||
    stack.availableLanguages?.[0] ||
    "TypeScript";

  const handleLanguageChange = (stackId, lang) => {
    if (isLockedHistory) return;
    setLanguageOverrides((prev) => ({ ...prev, [stackId]: lang }));
  };

  const handleSelectStack = (stack) => {
    if (isLockedHistory) return;
    selectOption(stack);
    setCompanion(
      "curious",
      `¿${stack.title} con ${getLanguage(stack)}? Interesante, analicemos sus límites.`,
    );
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    const selectedStack = {
      ...selectedOption,
      selectedLanguage: getLanguage(selectedOption),
    };
    updateBlueprint({ selectedStack });
    onNext({ selectedStack });
  };

  return (
    <StationShell
      stepNumber={STEP}
      eyebrow="Stack Tecnológico"
      title="Combinaciones balanceadas a tu medida"
      legend={
        <LevelLegend
          label="Dificultad"
          simple="Ágil / Directo"
          medium="Pragmático"
          advanced="Enterprise"
        />
      }
      confirmLabel="Confirmar Stack"
      onConfirm={handleConfirm}
      confirmDisabled={!selectedOption}
      rewriteTitle="¿Cambiar tu elección de Stack?"
      rewriteDescription="Se desbloquearán todas las opciones de stack. La arquitectura y diagramas generados más adelante se descartarán."
    >
      {isLoading && stacks.length === 0 ? (
        <SkeletonGrid
          count={3}
          columns="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          height="h-[280px]"
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {stacks.map((stack) => {
            const isSelected = selectedOption?.id === stack.id;
            const currentLang = getLanguage(stack);
            const languages = stack.availableLanguages || [];

            return (
              <SelectionCard
                key={stack.id}
                title={stack.title}
                tag={stack.badge}
                level={stack.level}
                techs={stack.tags || []}
                pros={stack.pros}
                cons={stack.cons}
                isSelected={isSelected}
                isDimmed={isLockedHistory && !isSelected}
                onClick={() => handleSelectStack(stack)}
                footer={
                  <div className="pt-2.5 border-t border-neutral-900 flex justify-between items-center text-[10px] sm:text-[11px] font-mono text-neutral-500">
                    <span>Variante: {currentLang}</span>
                    {isSelected && (
                      <span className="text-neutral-300 font-medium">
                        Elegido ✓
                      </span>
                    )}
                  </div>
                }
              >
                {languages.length > 1 && (
                  <div
                    className="mb-2.5 p-1.5 sm:p-2 rounded-lg bg-neutral-900/90 border border-neutral-800 flex items-center justify-between text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <span className="text-neutral-400 font-mono text-[10px] sm:text-[11px]">
                      Sabor:
                    </span>
                    <select
                      disabled={isLockedHistory}
                      value={currentLang}
                      onChange={(e) =>
                        handleLanguageChange(stack.id, e.target.value)
                      }
                      className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-[11px] sm:text-xs rounded px-1.5 py-0.5 outline-none font-mono disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      {languages.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </SelectionCard>
            );
          })}
        </motion.div>
      )}
    </StationShell>
  );
}
