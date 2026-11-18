/**
 * Paletas de color de la estación de estilo visual. Cada carta de estilo trae 3
 * paletas pensadas para la idea; aquí se validan (hex reales), se garantiza que
 * el texto se lea sobre el fondo (WCAG AA) y se exportan como CSS / Tailwind.
 *
 * Sin imports a propósito: lo usan el contrato (servidor) y la interfaz.
 */

export const PALETTE_ROLES = [
  { key: "primary", label: "Primario" },
  { key: "secondary", label: "Secundario" },
  { key: "accent", label: "Acento" },
  { key: "background", label: "Fondo" },
  { key: "text", label: "Texto" },
];

export const PALETTES_PER_STYLE = 3;

/** "#abc" / "abc" / "#AABBCC" -> "#aabbcc" (o null si no es un color hex). */
export function normalizeHex(value) {
  const raw = String(value || "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(raw)) {
    return `#${raw
      .split("")
      .map((c) => c + c)
      .join("")
      .toLowerCase()}`;
  }
  return /^[0-9a-f]{6}$/i.test(raw) ? `#${raw.toLowerCase()}` : null;
}

/** Luminancia relativa WCAG de un "#rrggbb" (0 negro, 1 blanco). */
export function luminance(hex) {
  const n = parseInt(hex.slice(1), 16);
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

/** Contraste WCAG entre dos colores (1 a 21). */
export function contrastRatio(a, b) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

const DARK_TEXT = "#0f172a";
const LIGHT_TEXT = "#f8fafc";
const MIN_TEXT_CONTRAST = 4.5;

/**
 * Color de texto legible sobre `bg`: casi-negro o casi-blanco (más suaves) y,
 * si ninguno llega a 4.5:1 (fondos de gris medio), negro o blanco puros.
 */
export function readableOn(bg) {
  const best = (candidates) =>
    candidates.reduce((a, b) =>
      contrastRatio(bg, b) > contrastRatio(bg, a) ? b : a,
    );
  const soft = best([DARK_TEXT, LIGHT_TEXT]);
  return contrastRatio(bg, soft) >= MIN_TEXT_CONTRAST
    ? soft
    : best(["#000000", "#ffffff"]);
}

/** Paleta de respaldo por estilo (si la IA no manda paletas válidas). */
const FALLBACKS = {
  minimalism: ["Neutro técnico", "#3b82f6", "#6366f1", "#22c55e", "#0a0a0a", "#fafafa"],
  glassmorphism: ["Cristal nocturno", "#8b5cf6", "#06b6d4", "#f472b6", "#0b1020", "#f8fafc"],
  claymorphism: ["Arcilla pastel", "#f472b6", "#a78bfa", "#fbbf24", "#fdf2f8", "#3b0764"],
  neobrutalism: ["Contraste pop", "#facc15", "#fb7185", "#22d3ee", "#fffbeb", "#0a0a0a"],
  neumorphism: ["Gris suave", "#64748b", "#94a3b8", "#0ea5e9", "#e2e8f0", "#1e293b"],
  aurora: ["Aurora boreal", "#10b981", "#06b6d4", "#a855f7", "#030712", "#ecfeff"],
  cyberpunk: ["Neón urbano", "#ec4899", "#22d3ee", "#facc15", "#09090b", "#fdf4ff"],
  skeuomorphism: ["Cuero y latón", "#b45309", "#78350f", "#eab308", "#fef3c7", "#292524"],
  terminal: ["Fósforo verde", "#22c55e", "#16a34a", "#facc15", "#020617", "#bbf7d0"],
  papercraft: ["Papel cálido", "#2563eb", "#7c3aed", "#f59e0b", "#fafaf9", "#1c1917"],
};

const fallbackPalette = (styleKey) => {
  const [name, primary, secondary, accent, background, text] =
    FALLBACKS[styleKey] || FALLBACKS.minimalism;
  return { name, primary, secondary, accent, background, text };
};

/**
 * Una paleta saneada: 5 hex válidos y texto legible sobre el fondo.
 * @returns {{ name, primary, secondary, accent, background, text } | null}
 */
export function normalizePalette(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;
  const colors = {};
  for (const { key } of PALETTE_ROLES) {
    const hex = normalizeHex(raw[key]);
    if (!hex && key !== "text") return null;
    colors[key] = hex;
  }
  // Texto ilegible (o ausente): se corrige a negro o blanco según el fondo
  if (
    !colors.text ||
    contrastRatio(colors.text, colors.background) < MIN_TEXT_CONTRAST
  ) {
    colors.text = readableOn(colors.background);
  }
  const name = String(raw.name || "").trim().slice(0, 40);
  return { name: name || `Paleta ${index + 1}`, ...colors };
}

/** Lista de paletas de una carta: hasta 3 válidas, o la de respaldo. */
export function normalizePalettes(raw, styleKey) {
  const palettes = (Array.isArray(raw) ? raw : [])
    .map((p, i) => normalizePalette(p, i))
    .filter(Boolean)
    .slice(0, PALETTES_PER_STYLE);
  return palettes.length ? palettes : [fallbackPalette(styleKey)];
}

/** Degradado principal de la paleta (CSS). */
export const paletteGradient = (p, angle = 135) =>
  `linear-gradient(${angle}deg, ${p.primary}, ${p.secondary})`;

const tokenLines = (p, prefix) =>
  PALETTE_ROLES.map(({ key }) => `  ${prefix}${key}: ${p[key]};`);

/** Variables CSS listas para pegar en globals.css. */
export const paletteToCss = (p) =>
  [
    `/* Paleta "${p.name}" · Dev.Idea */`,
    ":root {",
    ...tokenLines(p, "--color-"),
    `  --gradient-brand: ${paletteGradient(p)};`,
    "}",
  ].join("\n");

/** Tema de Tailwind v4: genera bg-primary, text-accent, etc. */
export const paletteToTailwind = (p) =>
  [
    `/* Paleta "${p.name}" · Tailwind v4 (bg-primary, text-accent...) */`,
    "@theme {",
    ...tokenLines(p, "--color-"),
    "}",
  ].join("\n");
