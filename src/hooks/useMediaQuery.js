"use client";

import { useSyncExternalStore } from "react";

/**
 * Suscripción reactiva a una media query.
 * En el servidor (y durante la hidratación) devuelve `serverFallback`, así el
 * HTML inicial coincide con el primer render del cliente y no hay mismatch.
 */
export function useMediaQuery(query, serverFallback = false) {
  return useSyncExternalStore(
    (onChange) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverFallback,
  );
}

