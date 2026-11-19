"use client";

import { useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { OptionStation } from "./OptionStation";
import { MorphismCard } from "./MorphismCard";
import { PalettePicker } from "./PalettePicker";
import { hasUserInterface } from "@/data/systemTypes";
import {
  Kanban,
  Repeat,
  Target,
  Zap,
  ShieldCheck,
  CalendarDays,
  Workflow,
} from "lucide-react";

/**
 * Estación de estilo visual: cada carta adopta el material real de su estilo y
 * trae 3 paletas pensadas para la idea. Al elegir un estilo se despliegan sus
 * paletas; la elegida (por defecto la primera) viaja en la decisión.
 */
export function MorphismStation({ station, data, onNext, onGenerate }) {
  const saved = useDecisionStore((s) => s.blueprint.selectedStyle);
  const setCompanion = useDecisionStore((s) => s.setCompanion);
  // Una API o un bot no tienen pantallas: el estilo visual se puede omitir
  const isHeadless = useDecisionStore((s) => {
    const surfaces = s.blueprint.selectedSystemType?.surfaces;
    return Array.isArray(surfaces) && surfaces.length > 0 && !hasUserInterface(surfaces);
  });
  // Paleta elegida por carta: { [optionId]: índice }
  const [paletteChoice, setPaletteChoice] = useState({});

  const paletteIndexOf = (option) => {
    if (paletteChoice[option.id] !== undefined) return paletteChoice[option.id];
    if (saved?.id === option.id && saved.palette) {
      const i = (option.palettes || []).findIndex(
        (p) => p.name === saved.palette.name,
      );
      return Math.max(i, 0);
    }
    return 0;
  };
  const paletteOf = (option) =>
    option.palettes?.[paletteIndexOf(option)] || null;

  return (
    <OptionStation
      station={isHeadless ? { ...station, skippable: true } : station}
      data={data}
      onNext={onNext}
      onGenerate={onGenerate}
      afterDeck={
        isHeadless ? (
          <p className="text-[11px] text-neutral-400 text-center leading-snug">
            Tu sistema no tiene pantallas: puedes omitir esta estación o elegir
            un estilo para tu marca y documentación.
          </p>
        ) : null
      }
      selectMessage={(o) =>
        `Estilo "${o.title}" seleccionado. Abajo tienes 3 paletas pensadas para tu idea: elige la que más te guste.`
      }
      // Se guarda el estilo con SU paleta elegida (sin las otras dos)
      toDecision={(o) => {
        const { palettes: _all, ...rest } = o;
        return { ...rest, palette: paletteOf(o) };
      }}
      deckSize="compact"
      // La tira de colores de la carta cambia con la paleta elegida
      getCardVersion={(option) => String(paletteIndexOf(option))}
      renderCard={(option, { isSelected, isDimmed }) => (
        <MorphismCard
          option={option}
          isSelected={isSelected}
          isDimmed={isDimmed}
          palette={paletteOf(option)}
        />
      )}
      belowDeck={(selected, { isLocked }) => {
        const option = selected[0];
        if (!option?.palettes?.length) return null;
        return (
          <PalettePicker
            key={option.id}
            styleTitle={option.title}
            palettes={option.palettes}
            selectedIndex={paletteIndexOf(option)}
            isLocked={isLocked}
            onSelect={(i) => {
              setPaletteChoice((prev) => ({ ...prev, [option.id]: i }));
              setCompanion(
                "happy",
                `Paleta "${option.palettes[i].name}" elegida. Tus degradados y botones usarán esos colores.`,
              );
            }}
          />
        );
      }}
      rewriteDescription="Se desbloqueará la selección de estilo y paleta. La maquetación, el despliegue y las herramientas calculadas después se descartarán."
    />
  );
}

function getMethodologyIcon(title = "", summary = "") {
  const text = `${title} ${summary}`.toLowerCase();
  if (/kanban|wip|tablero/.test(text)) return Kanban;
  if (/scrum|sprint|ceremonia/.test(text)) return Repeat;
  if (/shape up|apetito|sniper|objetivo/.test(text)) return Target;
  if (/\bxp\b|extreme|tdd|trunk/.test(text)) return Zap;
  if (/academ|formal|cascada|rup/.test(text)) return ShieldCheck;
  if (/semanal|calendario/.test(text)) return CalendarDays;
  return Workflow;
}

/** Estación 7: metodología, con ícono según la práctica. */
export function MethodologyStation({ station, data, onNext, onGenerate }) {
  return (
    <OptionStation
      station={station}
      data={data}
      onNext={onNext}
      onGenerate={onGenerate}
      selectMessage={(o) =>
        `Flujo "${o.title}" seleccionado. Un ritmo realista para no quemarse.`
      }
      selectMood="working"
      cardProps={(o) => {
        const Icon = getMethodologyIcon(o.title, o.summary);
        return { icon: <Icon className="w-4 h-4 text-neutral-300" /> };
      }}
      rewriteDescription="Se desbloquearán las metodologías. Los diagramas y todo lo calculado después se descartarán."
    />
  );
}
