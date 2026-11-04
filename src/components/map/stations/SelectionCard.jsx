"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function SelectionCard({
  icon = null,
  title,
  subtitle,
  tag,
  pros,
  cons,
  techs = [],
  isSelected = false,
  level = "medium",
  onClick,
}) {
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

  const style = levelStyles[level] || levelStyles.medium;

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`relative p-3.5 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between w-full select-none ${
        isSelected
          ? `bg-neutral-900/90 ${style.borderSelected}`
          : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40"
      }`}
    >
      <div>
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-2 sm:gap-3 mb-2 sm:mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
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
          </div>

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
      </div>

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
    </motion.div>
  );
}
