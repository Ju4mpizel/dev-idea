"use client";

import { motion } from "framer-motion";
import { Check, Palette } from "lucide-react";
import { PALETTE_ROLES, paletteGradient, readableOn } from "@/lib/palettes";

/** Vista previa en miniatura: la paleta aplicada a una pantalla de ejemplo. */
function PalettePreview({ palette }) {
  return (
    <div
      className="relative h-24 rounded-lg overflow-hidden p-2 flex flex-col gap-1.5"
      style={{ backgroundColor: palette.background }}
      aria-hidden="true"
    >
      <div
        className="h-6 rounded-md shrink-0"
        style={{ backgroundImage: paletteGradient(palette, 100) }}
      />
      <div className="flex-1 flex items-end justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <span
            className="text-[11px] font-bold leading-none truncate"
            style={{ color: palette.text }}
          >
            Aa Título
          </span>
          <span
            className="h-1 w-14 rounded-full opacity-50"
            style={{ backgroundColor: palette.text }}
          />
          <span
            className="h-1 w-10 rounded-full opacity-30"
            style={{ backgroundColor: palette.text }}
          />
        </div>
        <span
          className="shrink-0 px-2 py-1 rounded-md text-[9px] font-semibold"
          style={{
            backgroundColor: palette.accent,
            color: readableOn(palette.accent),
          }}
        >
          Botón
        </span>
      </div>
    </div>
  );
}

/**
 * Paletas del estilo elegido: 3 opciones pensadas para la idea, cada una con
 * su vista previa. La elegida viaja en la decisión del estilo.
 */
export function PalettePicker({
  styleTitle,
  palettes = [],
  selectedIndex = 0,
  onSelect,
  isLocked = false,
}) {
  if (!palettes.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className="w-full rounded-2xl border border-fuchsia-500/20 bg-neutral-900/50 backdrop-blur-md p-3 sm:p-4 flex flex-col gap-3"
    >
      <header className="flex items-center gap-2.5">
        <span className="w-8 h-8 shrink-0 rounded-lg border border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 flex items-center justify-center">
          <Palette className="w-4 h-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-neutral-100 leading-snug">
            Paleta para «{styleTitle}»
          </h3>
          <p className="text-[11px] text-neutral-400">
            {isLocked
              ? "La paleta que elegiste para tu proyecto."
              : "Pensadas para tu idea. Elige la que usarás en todo el proyecto."}
          </p>
        </div>
      </header>

      <div
        role="radiogroup"
        aria-label="Paletas de color"
        className="grid grid-cols-1 sm:grid-cols-3 gap-2.5"
      >
        {palettes.map((palette, i) => {
          const isSelected = i === selectedIndex;
          return (
            <button
              key={`${palette.name}-${i}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={isLocked && !isSelected}
              onClick={() => !isLocked && onSelect?.(i)}
              className={`text-left rounded-xl border p-2 flex flex-col gap-2 transition-all ${
                isSelected
                  ? "border-white/80 ring-2 ring-white/30 bg-neutral-900"
                  : isLocked
                    ? "border-neutral-800 bg-neutral-950/50 opacity-35"
                    : "border-neutral-800 bg-neutral-950/50 hover:border-neutral-600 cursor-pointer"
              }`}
            >
              <PalettePreview palette={palette} />
              <div className="flex items-center justify-between gap-2 px-0.5">
                <span className="text-xs font-semibold text-neutral-100 truncate">
                  {palette.name}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-white text-neutral-950 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>
              <div className="grid grid-cols-5 gap-1 px-0.5">
                {PALETTE_ROLES.map(({ key, label }) => (
                  <span
                    key={key}
                    title={`${label}: ${palette[key]}`}
                    className="h-5 rounded border border-white/10"
                    style={{ backgroundColor: palette[key] }}
                  />
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}
