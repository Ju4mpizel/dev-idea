"use client";

import { memo } from "react";
import { getTechIcon } from "@/lib/techIcons";

/** Luminancia relativa aproximada de un color hex (0 = negro, 1 = blanco). */
function luminance(hex) {
  const n = parseInt(hex, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

/** Color del logo legible sobre fondo oscuro (o claro con `onLight`). */
function readableColor(hex, onLight) {
  const lum = luminance(hex);
  if (onLight) return lum > 0.8 ? "#262626" : `#${hex}`;
  return lum < 0.22 ? "#e5e5e5" : `#${hex}`;
}

/** Logo de una tecnología en SVG (null si no está en el catálogo). */
export const TechIcon = memo(function TechIcon({
  name,
  size = 12,
  onLight = false,
  className = "",
}) {
  const icon = getTechIcon(name);
  if (!icon) return null;
  return (
    <svg
      role="img"
      aria-label={icon.title}
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`shrink-0 ${className}`}
      fill={readableColor(icon.hex, onLight)}
    >
      <path d={icon.path} />
    </svg>
  );
});

/** Chip de tecnología con su logo cuando existe. */
export function TechChip({ name, className = "", onLight = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 font-mono ${className}`}
    >
      <TechIcon name={name} onLight={onLight} />
      <span>{name}</span>
    </span>
  );
}
