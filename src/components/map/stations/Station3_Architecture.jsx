"use client";

import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked, useOptionSelection } from "@/hooks/useStationNavigation";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { SelectionCard } from "./SelectionCard";
import { StationShell, LevelLegend, staggerContainer } from "./StationShell";

const STEP = 3;

export function Station3_Architecture({ data, onNext }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, STEP));

  const options = data?.options || [];
  const { selectedOption, selectOption } = useOptionSelection(
    options,
    blueprint.selectedArchitecture,
  );

  // La selección es local hasta confirmar: no escribe el blueprint en cada clic
  const handleSelect = (option) => {
    if (isLockedHistory) return;
    selectOption(option);
    setCompanion(
      "thinking",
      `Patrón "${option.title}" seleccionado. Una base sólida para estructurar los módulos.`,
    );
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    updateBlueprint({ selectedArchitecture: selectedOption });
    onNext({ selectedArchitecture: selectedOption });
  };

  return (
    <StationShell
      stepNumber={STEP}
      eyebrow="Arquitectura Técnica"
      title="Patrón estructural de tu software"
      legend={
        <LevelLegend
          label="Complejidad"
          simple="Simple / Rápido"
          medium="Pragmático"
          advanced="Avanzado"
        />
      }
      confirmLabel="Confirmar Arquitectura"
      onConfirm={handleConfirm}
      confirmDisabled={!selectedOption}
      rewriteTitle="¿Cambiar el patrón arquitectónico?"
      rewriteDescription="Se desbloquearán todas las opciones de arquitectura. Ten en cuenta que la metodología y diagramas calculados más adelante se descartarán."
    >
      {isLoading && options.length === 0 ? (
        <SkeletonGrid
          count={6}
          columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          height="h-[270px]"
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.05)}
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
