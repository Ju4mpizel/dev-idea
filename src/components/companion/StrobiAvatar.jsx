"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { createAvatar } from "@bible-strong/avatar-web";
import baseAvatarDefinition from "@/data/avatar.avatar.json";
import { useDecisionStore } from "@/hooks/useDecisionStore";

/**
 * Animaciones propias con UNA sola expresión (las de serie recorren varias
 * caras en bucle). Siguen parpadeando, así Strobi no parece congelado.
 * - "focused-thinking": mirando hacia arriba, concentrado (mientras genera).
 * - "explaining": atento mirando hacia la estación (panel "¿Qué es?").
 * - "reviewing": mirando hacia abajo, repasando tu plano (panel "Mi plano").
 */
const FIXED_ANIMATIONS = {
  "focused-thinking": "upward-side-glance",
  explaining: "attentive-left",
  reviewing: "gentle-downward-gaze",
};

function withFixedAnimations(base) {
  const template = base.animations?.thinking || {};
  const animations = { ...base.animations };
  Object.entries(FIXED_ANIMATIONS).forEach(([key, expression]) => {
    animations[key] = {
      ...template,
      playbackMode: "loop",
      steps: [
        { expression, holdMs: 60000, transitionMs: 450, transition: "smooth" },
      ],
      metadata: { ...(template.metadata || {}), label: key },
    };
  });
  return {
    ...base,
    animations,
    animationOrder: [
      ...(base.animationOrder || []),
      ...Object.keys(FIXED_ANIMATIONS).filter(
        (k) => !(base.animationOrder || []).includes(k),
      ),
    ],
  };
}

const AVATAR_DEFINITION = withFixedAnimations(baseAvatarDefinition);

/**
 * Avatar procedural de Strobi (sin burbuja ni paleta).
 * Lo usan la cabecera (CompanionAvatar) y el panel "¿Qué es...?".
 * El color vive en el store para que sea el mismo en ambos sitios.
 */
export function StrobiAvatar({
  size = 105,
  mood: moodOverride = null,
  className = "",
  onClick,
  // Expresión puntual (p. ej. al hacer clic); null = la del ánimo actual
  expression = null,
  // Congela la animación (Strobi oculto/tapado o mientras entra en escena)
  paused = false,
}) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  const storeMood = useDecisionStore((s) => s.companionMood);
  const color = useDecisionStore((s) => s.strobiColor);
  const mood = moodOverride || storeMood || "idle";

  const moodRef = useRef(mood);
  const pausedRef = useRef(paused);
  const inViewRef = useRef(true);

  /**
   * El avatar redibuja su SVG en CADA fotograma mientras anima. En móvil eso
   * compite con el resto de animaciones, así que solo corre cuando se ve:
   * no pausado, dentro de la pantalla y con la pestaña visible.
   */
  const syncPlayback = useCallback(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    const shouldRun =
      !pausedRef.current && inViewRef.current && !document.hidden;
    try {
      if (!shouldRun) {
        instance.pause?.();
        return;
      }
      // Reanuda donde se quedó, o arranca el ánimo que cambió mientras tanto
      const state = instance.getState?.() || {};
      if (
        state.status === "paused" ||
        (state.activeAnimation && state.activeAnimation !== moodRef.current)
      )
        instance.play?.(moodRef.current);
    } catch {
      // Animación no disponible: se mantiene la actual
    }
  }, []);

  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

  useEffect(() => {
    pausedRef.current = paused;
    syncPlayback();
  }, [paused, syncPlayback]);

  const definition = useMemo(
    () => ({
      ...AVATAR_DEFINITION,
      colors: { ...AVATAR_DEFINITION.colors, body: color },
    }),
    [color],
  );

  // (Re)crea el avatar solo cuando cambia el color
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;
    container.innerHTML = "";
    try {
      instanceRef.current = createAvatar(container, {
        definition,
        defaultAnimation: moodRef.current,
      });
      syncPlayback();
    } catch (err) {
      console.error("[Strobi] Error al montar avatar:", err);
    }
    return () => {
      const instance = instanceRef.current;
      if (instance?.destroy) instance.destroy();
      else if (instance?.stop) instance.stop();
      instanceRef.current = null;
    };
  }, [definition, syncPlayback]);

  // Cambios de ánimo (si está congelado, se aplicará al reanudar)
  useEffect(() => {
    if (pausedRef.current || !inViewRef.current) return;
    try {
      instanceRef.current?.play?.(mood);
    } catch {
      // Animación no disponible: se mantiene la actual
    }
  }, [mood]);

  useEffect(() => {
    if (!expression) return;
    try {
      instanceRef.current?.setExpression?.(expression);
    } catch {
      // Expresión no disponible
    }
  }, [expression]);

  // Pestaña oculta o Strobi fuera de pantalla (al hacer scroll): en pausa
  useEffect(() => {
    document.addEventListener("visibilitychange", syncPlayback);
    const container = containerRef.current;
    let observer;
    if (container && "IntersectionObserver" in window) {
      observer = new IntersectionObserver(([entry]) => {
        inViewRef.current = entry.isIntersecting;
        syncPlayback();
      });
      observer.observe(container);
    }
    return () => {
      document.removeEventListener("visibilitychange", syncPlayback);
      observer?.disconnect();
    };
  }, [syncPlayback]);

  return (
    <div
      onClick={onClick}
      // Capa propia: redibujar a Strobi no repinta la cabecera entera
      style={{ width: size, height: size, contain: "layout paint" }}
      className={`flex items-center justify-center will-change-transform ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center pointer-events-none"
      />
    </div>
  );
}
