"use client";

import { Check, Lightbulb } from "lucide-react";
import { TechChip } from "@/components/ui/TechChip";
import { getLevelStyle } from "./levelStyles";

/**
 * Carta de opción común a todas las estaciones (vive dentro de `CardDeck`).
 *
 * Todas las cartas comparten la misma estructura, de arriba abajo:
 * etiqueta + nivel · título · resumen · "En simple" · tecnologías · contenido
 * propio de la estación (`children`) · ventaja / desventaja · `footer`.
 * Ocupa toda la altura del mazo y desplaza su contenido por dentro.
 */
export function SelectionCard({
  icon = null,
  title,
  subtitle,
  tag,
  levelLabel,
  beginnerTip,
  pros,
  cons,
  techs = [],
  isSelected = false,
  isDimmed = false,
  level = "medium",
  media = null,
  children = null,
  footer = null,
}) {
  const style = getLevelStyle(level);

  return (
    <article
      className={`h-full w-full rounded-2xl border flex flex-col overflow-hidden select-none transition-[border-color,box-shadow,opacity] duration-300 ${
        isSelected
          ? `bg-neutral-900 ${style.borderSelected}`
          : "bg-[#0e0e10] border-neutral-800"
      }`}
    >
      {/* El atenuado va en el contenido: la carta sigue opaca y no deja ver las de atrás */}
      <div
        className={`flex-1 min-h-0 overflow-y-auto scrollbar-thin p-4 ${
          isDimmed ? "opacity-40 grayscale" : ""
        }`}
      >
        {/* Cabecera */}
        <div className="flex items-start justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            <span
              className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${style.badge}`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.accentDot}`}
              />
              <span>{levelLabel || level}</span>
            </span>
            {tag && (
              <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border border-neutral-800 bg-neutral-900 text-neutral-400">
                {tag}
              </span>
            )}
          </div>

          <div
            className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
              isSelected
                ? style.checkSelected
                : "border-neutral-700 bg-neutral-900 text-transparent"
            }`}
          >
            <Check className="w-3 h-3 stroke-[3]" />
          </div>
        </div>

        {media}

        <h3 className="font-bold text-white text-[15px] leading-snug tracking-tight mb-1.5 flex items-start gap-2 text-balance">
          {icon && <span className="shrink-0 mt-1">{icon}</span>}
          <span>{title}</span>
        </h3>

        {subtitle && (
          <p className="text-xs text-neutral-300 leading-relaxed mb-3">
            {subtitle}
          </p>
        )}

        {beginnerTip && (
          <div className="mb-3 p-2.5 rounded-xl bg-amber-950/20 border border-amber-900/40 flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] text-amber-100/90 leading-relaxed">
              <span className="font-semibold text-amber-300">En simple: </span>
              {beginnerTip}
            </p>
          </div>
        )}

        {techs.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {techs.map((tech) => (
              <TechChip
                key={tech}
                name={tech}
                className="rounded-md bg-neutral-900 border border-neutral-800 text-neutral-300"
              />
            ))}
          </div>
        )}

        {children}

        {(pros || cons) && (
          <div className="pt-2.5 mt-1 border-t border-neutral-800/80 text-[11px] space-y-1.5">
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
                  −
                </span>
                <span className="leading-snug">{cons}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {footer && (
        <div className="shrink-0 px-4 py-2.5 border-t border-neutral-800/80 bg-neutral-950">
          {footer}
        </div>
      )}
    </article>
  );
}

/** Bloque titulado reutilizable dentro de una carta (listas de RF, criterios...). */
export function CardSection({ label, icon = null, children }) {
  return (
    <div className="mb-3">
      <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5 flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      {children}
    </div>
  );
}

/** Lista con viñetas compacta para el contenido de las cartas. */
export function CardList({ items, marker = "•", markerClass = "text-neutral-500" }) {
  if (!items?.length) return null;
  return (
    <ul className="space-y-1">
      {items.map((item, i) => (
        <li
          key={`${i}-${item}`}
          className="text-[11px] text-neutral-300 leading-snug flex items-baseline gap-1.5"
        >
          <span className={`font-mono shrink-0 ${markerClass}`}>{marker}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
