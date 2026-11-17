"use client";

import { motion, AnimatePresence } from "framer-motion";

/**
 * Animación de carga mientras Gemini genera la estación: una tuerca gigante
 * por lado, cortada por el borde de la pantalla, girando despacio DETRÁS del
 * contenido (gris tenue, sin tapar nada). Las dos giran en sentidos opuestos,
 * como si engranaran con el lienzo del centro.
 *
 * Solo anima transform (barato para la GPU) y respeta "reducir movimiento".
 */

const TEETH = 14;
const OUTER_R = 96;
const ROOT_R = 82;

/** Contorno de la tuerca (dientes trapezoidales) generado una sola vez. */
const GEAR_PATH = (() => {
  const step = (Math.PI * 2) / TEETH;
  const point = (r, a) =>
    `${(r * Math.cos(a)).toFixed(2)} ${(r * Math.sin(a)).toFixed(2)}`;
  let d = "";
  for (let i = 0; i < TEETH; i++) {
    const a = i * step;
    // raíz → flanco de subida → cima del diente → flanco de bajada
    d += `${i === 0 ? "M" : "L"} ${point(ROOT_R, a)} `;
    d += `L ${point(OUTER_R, a + step * 0.18)} `;
    d += `L ${point(OUTER_R, a + step * 0.48)} `;
    d += `L ${point(ROOT_R, a + step * 0.66)} `;
  }
  return `${d}Z`;
})();

function GearShape() {
  return (
    <svg viewBox="-100 -100 200 200" className="w-full h-full" aria-hidden>
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d={GEAR_PATH} vectorEffect="non-scaling-stroke" />
        <circle r="58" vectorEffect="non-scaling-stroke" />
        <circle r="20" vectorEffect="non-scaling-stroke" />
        {/* Radios */}
        {[0, 60, 120].map((deg) => (
          <line
            key={deg}
            x1="-58"
            y1="0"
            x2="58"
            y2="0"
            transform={`rotate(${deg})`}
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </g>
    </svg>
  );
}

function GiantGear({ side }) {
  const isLeft = side === "left";
  return (
    // Envoltorio fijo: centra la tuerca sobre el borde (la mitad queda fuera)
    <div
      className={`fixed z-0 pointer-events-none top-[calc(50%+28px)] -translate-y-1/2
        w-[min(78vw,420px)] h-[min(78vw,420px)] lg:w-[min(88vh,880px)] lg:h-[min(88vh,880px)]
        ${isLeft ? "left-0 -translate-x-1/2" : "right-0 translate-x-1/2"}`}
      aria-hidden
    >
      <motion.div
        initial={{ x: isLeft ? "-30%" : "30%", opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: isLeft ? "-30%" : "30%", opacity: 0 }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
        className="w-full h-full text-neutral-500/25"
      >
        <div
          className="w-full h-full loading-gear"
          style={{
            animationDuration: "16s",
            animationDirection: isLeft ? "normal" : "reverse",
          }}
        >
          <GearShape />
        </div>
      </motion.div>
    </div>
  );
}

export function LoadingSides({ active }) {
  return (
    <AnimatePresence>
      {active && (
        <GiantGearPair key="gears" />
      )}
    </AnimatePresence>
  );
}

function GiantGearPair() {
  return (
    <>
      <GiantGear side="left" />
      <GiantGear side="right" />
    </>
  );
}
