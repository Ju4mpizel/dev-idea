"use client";

import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked, useOptionSelection } from "@/hooks/useStationNavigation";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { SelectionCard } from "./SelectionCard";
import { StationShell, LevelLegend, staggerContainer } from "./StationShell";
import {
  Kanban,
  Repeat,
  Target,
  Zap,
  CalendarDays,
  Workflow,
  ShieldCheck,
} from "lucide-react";

const STEP = 4;

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
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, STEP));

  const options = data?.options || [];
  const { selectedOption, selectOption } = useOptionSelection(
    options,
    blueprint.selectedMethodology,
  );

  const handleSelect = (option) => {
    if (isLockedHistory) return;
    selectOption(option);
    setCompanion(
      "working",
      `Flujo "${option.title}" seleccionado. Una cadencia de trabajo realista para mantener el ritmo de desarrollo.`,
    );
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    updateBlueprint({ selectedMethodology: selectedOption });
    onNext({ selectedMethodology: selectedOption });
  };

  // Omitir = sin metodología (no arrastra una selección previa al blueprint)
  const handleSkip = () => {
    updateBlueprint({ selectedMethodology: null });
    onNext({ selectedMethodology: null });
  };

  return (
    <StationShell
      stepNumber={STEP}
      eyebrow="Metodología de Trabajo"
      title="Cadencia de sprints y flujo de desarrollo"
      onSkip={handleSkip}
      legend={
        <LevelLegend
          label="Carga Operativa"
          simple="Ágil / Cero Fricción"
          medium="Iterativo / Semanal"
          advanced="Estructurado"
        />
      }
      confirmLabel="Confirmar Metodología"
      onConfirm={handleConfirm}
      confirmDisabled={!selectedOption}
      rewriteTitle="¿Cambiar la metodología de trabajo?"
      rewriteDescription="Se desbloquearán las opciones de metodología. Ten en cuenta que los diagramas y configuraciones calculadas más adelante se descartarán."
    >
      {isLoading && options.length === 0 ? (
        <SkeletonGrid
          count={4}
          columns="grid-cols-1 md:grid-cols-2"
          height="h-[250px]"
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.06)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4"
        >
          {options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            const IconComponent = getMethodologyIcon(opt.title, opt.summary);

            return (
              <SelectionCard
                key={opt.id}
                icon={
                  <IconComponent className="w-4 h-4 mr-1.5 text-neutral-300 shrink-0" />
                }
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
