// Paleta por nivel de complejidad compartida por tarjetas y leyendas.
export const LEVEL_STYLES = {
  simple: {
    badge: "bg-sky-950/80 border-sky-800 text-sky-400",
    borderSelected:
      "border-sky-400 ring-1 ring-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.15)]",
    checkSelected: "bg-sky-400 border-sky-400 text-neutral-950",
    accentDot: "bg-sky-400",
    text: "text-sky-400",
  },
  medium: {
    badge: "bg-amber-950/80 border-amber-800 text-amber-400",
    borderSelected:
      "border-amber-400 ring-1 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.15)]",
    checkSelected: "bg-amber-400 border-amber-400 text-neutral-950",
    accentDot: "bg-amber-400",
    text: "text-amber-400",
  },
  advanced: {
    badge: "bg-rose-950/80 border-rose-800 text-rose-400",
    borderSelected:
      "border-rose-400 ring-1 ring-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
    checkSelected: "bg-rose-400 border-rose-400 text-neutral-950",
    accentDot: "bg-rose-400",
    text: "text-rose-400",
  },
};

export const getLevelStyle = (level) =>
  LEVEL_STYLES[level] || LEVEL_STYLES.medium;
