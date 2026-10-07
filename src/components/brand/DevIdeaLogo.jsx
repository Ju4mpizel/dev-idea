import React from "react";

/**
 * <DevIdeaLogo />
 *
 * Props
 *  - variant:   "lockup" (isotipo + wordmark, 452×100) | "icon" (1:1, 100×100)
 *  - className: clases Tailwind. Por defecto hereda negro en light y blanco en dark.
 *  - width / height: opcionales. Si solo das uno, el otro se calcula por aspect-ratio.
 *                    Si no das ninguno, height = 32 (lockup) o 32×32 (icon).
 *  - accentDot: true → el punto "." usa slate (#71717A); false → currentColor.
 *
 * Uso:
 *   <DevIdeaLogo height={28} />
 *   <DevIdeaLogo variant="icon" className="size-8 text-zinc-950 dark:text-white" />
 */
export default function DevIdeaLogo({
  variant = "lockup",
  className = "text-black dark:text-white",
  width,
  height,
  accentDot = true,
  ...props
}) {
  const isIcon = variant === "icon";
  const ratio = isIcon ? 1 : 452 / 100;

  let w = width;
  let h = height;
  if (w == null && h == null) h = 32;
  if (w == null) w = Math.round(h * ratio * 100) / 100;
  if (h == null) h = Math.round((w / ratio) * 100) / 100;

  const spiral = (
    <g
      transform="translate(7.1 23.6) scale(6.6)"
      stroke="currentColor"
      strokeWidth="0.8"
    >
      <path d="M0 8A8 8 0 0 1 8 0" strokeLinecap="round" strokeDasharray="0 1.5708" />
      <path d="M8 0A5 5 0 0 1 13 5" strokeDasharray="1.1 0.5885" />
      <path
        d="M13 5A3 3 0 0 1 10 8A2 2 0 0 1 8 6A1 1 0 0 1 9 5A1 1 0 0 1 10 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={isIcon ? "0 0 100 100" : "0 0 452 100"}
      width={w}
      height={h}
      fill="none"
      role="img"
      aria-label="Dev.Idea"
      className={className}
      {...props}
    >
      <title>Dev.Idea</title>
      {spiral}

      {!isIcon && (
        <>
          <g stroke="currentColor" strokeWidth="9" strokeLinejoin="miter">
            <path d="M124.5 26.5H138A23.5 23.5 0 0 1 138 73.5H124.5Z" />
            <path d="M178.5 58H209.5A15.5 15.5 0 1 0 205 69" />
            <circle cx="329" cy="58" r="15.5" />
            <path d="M363.5 58H394.5A15.5 15.5 0 1 0 390 69" />
            <circle cx="427" cy="58" r="15.5" />
          </g>
          <g fill="currentColor">
            <polygon points="222,38 232.5,38 239,58.8 245.5,38 256,38 243.5,78 234.5,78" />
            <rect x="288" y="22" width="9" height="56" />
            <rect x="340" y="22" width="9" height="56" />
            <rect x="438" y="38" width="9" height="40" />
          </g>
          <circle
            cx="270"
            cy="72.5"
            r="5.5"
            fill={accentDot ? "#71717A" : "currentColor"}
          />
        </>
      )}
    </svg>
  );
}
