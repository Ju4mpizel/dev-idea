"use client";

import { useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { OptionStation } from "./OptionStation";
import { MorphismCard } from "./MorphismCard";
import { PalettePicker } from "./PalettePicker";
import {
  Database,
  CloudOff,
  HardDrive,
  FileText,
  KeyRound,
  Layers,
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
      station={station}
      data={data}
      onNext={onNext}
      onGenerate={onGenerate}
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

const DB_TYPES = {
  none: { label: "Sin base de datos", Icon: CloudOff, color: "text-neutral-300" },
  relational: { label: "Relacional (SQL)", Icon: Database, color: "text-sky-400" },
  document: { label: "Documental (NoSQL)", Icon: FileText, color: "text-emerald-400" },
  "key-value": { label: "Clave-valor", Icon: KeyRound, color: "text-rose-400" },
  baas: { label: "Backend como servicio", Icon: Layers, color: "text-violet-400" },
  embedded: { label: "Embebida (archivo local)", Icon: HardDrive, color: "text-amber-400" },
};

/** Estación 5: decide si hay base de datos y cuál. Condiciona los diagramas. */
export function DatabaseStation({ station, data, onNext, onGenerate }) {
  return (
    <OptionStation
      station={station}
      data={data}
      onNext={onNext}
      onGenerate={onGenerate}
      selectMessage={(o) =>
        o.dbType === "none"
          ? "Sin base de datos: menos piezas que mantener. Si luego la necesitas, se agrega."
          : `"${o.title}" anotada. Tus diagramas incluirán el modelo de datos.`
      }
      cardProps={(o) => {
        const meta = DB_TYPES[o.dbType] || DB_TYPES.relational;
        return {
          media: (
            <div className="flex items-center gap-2 mb-3">
              <span className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <meta.Icon className={`w-5 h-5 ${meta.color}`} />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400">
                {meta.label}
              </span>
            </div>
          ),
        };
      }}
      rewriteDescription="Se desbloqueará la elección de base de datos. La arquitectura, los diagramas y todo lo calculado después se descartarán."
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
