"use client";

import { useCallback, useRef } from "react";

/**
 * Capa de GPU solo MIENTRAS un elemento con texto se anima (Framer Motion).
 *
 * `will-change: transform` fijo hace que el navegador pinte el bloque una vez
 * como imagen: si queda en medio píxel o tras una escala, el texto se ve
 * borroso. Con este hook la capa existe durante la animación (fluida en
 * móvil) y se quita al terminar, así el texto vuelve a pintarse nítido.
 *
 * Toca el estilo del elemento directamente (sin estado de React), así activar
 * o quitar la capa no provoca renders en mitad de la animación.
 *
 * Uso: `<motion.div {...useAnimatingLayer()} animate={...} />`
 */
export function useAnimatingLayer({
  property = "transform",
  // false para elementos con `initial={false}` (no animan al montarse)
  startActive = true,
} = {}) {
  const nodeRef = useRef(null);

  const ref = useCallback(
    (node) => {
      nodeRef.current = node;
      if (node && startActive) node.style.willChange = property;
    },
    [property, startActive],
  );

  const onAnimationStart = useCallback(() => {
    if (nodeRef.current) nodeRef.current.style.willChange = property;
  }, [property]);

  const onAnimationComplete = useCallback(() => {
    if (nodeRef.current) nodeRef.current.style.willChange = "auto";
  }, []);

  return { ref, onAnimationStart, onAnimationComplete };
}
