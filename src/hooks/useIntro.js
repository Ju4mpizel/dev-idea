"use client";

import { useEffect, useState } from "react";

// Se marca al montar por primera vez: la entrada solo se ve al abrir la página,
// no al volver a la estación 0 desde el mapa.
let introPlayed = false;

/**
 * ¿Hay que reproducir la animación de entrada? En el servidor y en el primer
 * render del cliente vale `true` (mismo HTML, sin desajustes de hidratación).
 */
export function useIntro() {
  const [active] = useState(() => !introPlayed);
  useEffect(() => {
    if (!active) return undefined;
    const timer = setTimeout(() => {
      introPlayed = true;
    }, 2500);
    return () => {
      clearTimeout(timer);
      introPlayed = true;
    };
  }, [active]);
  return active;
}

/**
 * Vuelve a habilitar la entrada: al cerrar sesión la portada se dibuja de
 * nuevo, como si se abriera la página por primera vez.
 */
export function resetIntro() {
  introPlayed = false;
}

/** Clases de una pieza de la entrada ("" si no toca). */
export const introClass = (active, kind) => (active ? `intro ${kind}` : "");

/** Retraso de una pieza de la entrada (variable CSS --d). */
export const introDelay = (active, delayMs, style = undefined) =>
  active ? { ...style, "--d": `${delayMs}ms` } : style;
