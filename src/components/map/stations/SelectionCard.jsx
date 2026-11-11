"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { getLevelStyle } from "./levelStyles";

/**
 * Tarjeta de opción común a las estaciones.
 * - `children`: contenido extra entre las tecnologías y los trade-offs.
 * - `footer`:   contenido al final de la tarjeta.
 * - `isDimmed`: opción no elegida en Modo Consulta (no interactiva).
 */
export function SelectionCard({
  icon = null,
  title,
  subtitle,
  tag,
  pros,
  cons,
  techs = [],
  isSelected = false,
  isDimmed = false,
  level = "medium",
  onClick,
  children = null,
  footer = null,
}) {
  const style = getLevelStyle(level);
  const isInteractive = !isDimmed;

  return (
    <motion.div
      whileHover={isInteractive ? { y: -2 } : undefined}
      whileTap={isInteractive ? { scale: 0.99 } : undefined}
      onClick={isInteractive ? onClick : undefined}
      aria-disabled={isDimmed || undefined}
      className={`relative h-full p-3.5 sm:p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between w-full select-none ${
        isSelected
          ? `bg-neutral-900/90 ${style.borderSelected}`
          : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40"
      } ${
        isDimmed ? "opacity-35 grayscale pointer-events-none" : "cursor-pointer"
      }`}
    >
      <div>
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-2.5">
          <span
            className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${style.badge}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.accentDot}`}
            />
            <span className="truncate max-w-[140px] sm:max-w-none">
              {tag || level.toUpperCase()}
            </span>
          </span>

          <div
            className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
              isSelected
                ? style.checkSelected
                : "border-neutral-700 bg-neutral-900 text-transparent"
            }`}
          >
            <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
          </div>
        </div>

        <h3 className="font-bold text-white text-sm sm:text-base tracking-tight mb-1 flex items-center gap-1.5 sm:gap-2">
          {icon && <span className="shrink-0">{icon}</span>}
          <span className="truncate">{title}</span>
        </h3>

        {subtitle && (
          <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed mb-2.5 sm:mb-3">
            {subtitle}
          </p>
        )}

        {/* Chips de tecnologías */}
        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1 sm:gap-1.5 mb-2.5 sm:mb-3">
            {techs.map((tech) => (
              <span
                key={tech}
                className="text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {children}
      </div>

      <div>
        {/* Trade-offs */}
        {(pros || cons) && (
          <div className="pt-2 sm:pt-2.5 border-t border-neutral-900/80 text-[10px] sm:text-[11px] space-y-1 mt-1">
            {pros && (
              <div className="text-emerald-400/90 flex items-baseline gap-1.5">
                <span className="font-mono text-emerald-500 font-bold shrink-0">
                  +
                </span>
                <span className="leading-snug">{pros}</span>
              </div>
            )}
            {cons && (
              <div className="text-neutral-400 flex items-baseline gap-1.5">
                <span className="font-mono text-neutral-500 font-bold shrink-0">
                  -
                </span>
                <span className="leading-snug">{cons}</span>
              </div>
            )}
          </div>
        )}

        {footer && <div className="mt-2.5 sm:mt-3">{footer}</div>}
      </div>
    </motion.div>
  );
}
