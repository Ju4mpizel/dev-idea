"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

export function SelectionCard({
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
  // Configuración de paleta por nivel de complejidad
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
      className={`relative p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
        isSelected
          ? `bg-neutral-900/90 ${style.borderSelected}`
          : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40"
      }`}
    >
      <div>
        {/* Cabecera de la tarjeta */}
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${style.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${style.accentDot}`} />
              {tag || level.toUpperCase()}
            </span>
          </div>

          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
              isSelected
                ? style.checkSelected
                : "border-neutral-700 bg-neutral-900 text-transparent"
            }`}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        </div>

        <h3 className="font-bold text-white text-base tracking-tight mb-1">
          {title}
        </h3>
        {subtitle && (
          <p className="text-xs text-neutral-400 leading-relaxed mb-3">
            {subtitle}
          </p>
        )}

        {/* Chips de tecnologías */}
        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {techs.map((tech) => (
              <span
                key={tech}
                className="text-[11px] px-2 py-0.5 rounded bg-neutral-900 border border-neutral-800 text-neutral-300 font-mono"
              >
                {tech}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Trade-offs */}
      {(pros || cons) && (
        <div className="pt-2.5 border-t border-neutral-900/80 text-[11px] space-y-1 mt-2">
          {pros && (
            <div className="text-emerald-400/90 flex items-baseline gap-1.5">
              <span className="font-mono text-emerald-500 font-bold">+</span>
              <span>{pros}</span>
            </div>
          )}
          {cons && (
            <div className="text-neutral-400 flex items-baseline gap-1.5">
              <span className="font-mono text-neutral-500 font-bold">-</span>
              <span>{cons}</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}
