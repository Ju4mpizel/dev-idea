"use client";

import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked, useOptionSelection } from "@/hooks/useStationNavigation";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { MorphismCard } from "./MorphismCard";
import { StationShell, staggerContainer } from "./StationShell";
import { Sparkles } from "lucide-react";

const STEP = 6;

// 4 estilos -> 2x2; 3 estilos (o carga) -> 3 columnas
const gridColumnsFor = (count) =>
  count === 4 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-3";

export function Station6_Morphism({ data, onNext }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, STEP));

  const options = data?.options || [];
  const { selectedOption, selectOption } = useOptionSelection(
    options,
    blueprint.selectedStyle,
  );

  const handleSelect = (option) => {
    if (isLockedHistory) return;
    selectOption(option);
    setCompanion(
      "playful",
      `Estilo "${option.title}" seleccionado. Una personalidad visual muy marcada para el frontend.`,
    );
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    updateBlueprint({ selectedStyle: selectedOption });
    onNext({ selectedStyle: selectedOption });
  };

  return (
    <StationShell
      stepNumber={STEP}
      eyebrow="Lenguaje Visual / Morphism"
      title="Personalidad visual y estilo de interfaz"
      legend={
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-[11px] font-mono text-neutral-400">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            Cada tarjeta adopta fielmente su material, luces, sombras y
            contraste real.
          </span>
        </div>
      }
      confirmLabel="Confirmar Estilo Visual"
      onConfirm={handleConfirm}
      confirmDisabled={!selectedOption}
      rewriteTitle="¿Cambiar el estilo visual?"
      rewriteDescription="Se desbloqueará la selección de estilo cosmético. La maquetación, despliegue y herramientas calculadas más adelante se descartarán."
    >
      {isLoading && options.length === 0 ? (
        // El prompt pide 3-4 estilos: el skeleton usa la misma grilla de 3
        <SkeletonGrid
          count={3}
          columns={gridColumnsFor(3)}
          height="h-[260px]"
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.07)}
          initial="hidden"
          animate="show"
          className={`grid ${gridColumnsFor(options.length)} gap-3 sm:gap-4`}
        >
          {options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            return (
              <MorphismCard
                key={opt.id}
                option={opt}
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
