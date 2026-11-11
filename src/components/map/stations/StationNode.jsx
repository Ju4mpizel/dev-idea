"use client";

import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked, useOptionSelection } from "@/hooks/useStationNavigation";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { SelectionCard } from "./SelectionCard";
import { StationShell, staggerContainer } from "./StationShell";

/** Estación genérica (7-9) mientras no tengan componente dedicado. */
export function StationNode({ station, data, onAdvance }) {
  const { stepNumber, blueprintKey } = station;
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, stepNumber));

  const options = data?.options || [];
  const { selectedOption, selectOption } = useOptionSelection(
    options,
    blueprint[blueprintKey],
  );

  const handleSelect = (option) => {
    if (isLockedHistory) return;
    selectOption(option);
    setCompanion(
      "thinking",
      `Interesante elección: ${option.title}. Vamos a encajarlo en el blueprint.`,
    );
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    updateBlueprint({ [blueprintKey]: selectedOption });
    onAdvance({ [blueprintKey]: selectedOption });
  };

  const handleSkip = () => {
    updateBlueprint({ [blueprintKey]: null });
    onAdvance({ [blueprintKey]: null });
  };

  return (
    <StationShell
      stepNumber={stepNumber}
      eyebrow={station.title}
      title={station.subtitle}
      onSkip={station.skippable ? handleSkip : null}
      onConfirm={handleConfirm}
      confirmDisabled={!selectedOption}
    >
      {isLoading && options.length === 0 ? (
        <SkeletonGrid count={3} height="h-[250px]" />
      ) : (
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            return (
              <SelectionCard
                key={opt.id}
                title={opt.title}
                subtitle={opt.summary}
                tag={opt.tag}
                pros={opt.pros}
                cons={opt.cons}
                techs={opt.techs || []}
                level={opt.level}
                isSelected={isSelected}
                isDimmed={isLockedHistory && !isSelected}
                onClick={() => handleSelect(opt)}
              />
            );
          })}
        </motion.div>
      )}
    </StationShell>
  );
}
