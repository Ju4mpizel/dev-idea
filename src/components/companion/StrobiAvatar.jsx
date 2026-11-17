"use client";

import { useEffect, useMemo, useRef } from "react";
import { createAvatar } from "@bible-strong/avatar-web";
import baseAvatarDefinition from "@/data/avatar.avatar.json";
import { useDecisionStore } from "@/hooks/useDecisionStore";

/**
 * Animaciones propias con UNA sola expresión (las de serie recorren varias
 * caras en bucle). Siguen parpadeando, así Strobi no parece congelado.
 * - "focused-thinking": mirando hacia arriba, concentrado (mientras genera).
 * - "explaining": atento mirando hacia la estación (panel "¿Qué es?").
 */
const FIXED_ANIMATIONS = {
  "focused-thinking": "upward-side-glance",
  explaining: "attentive-left",
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
}) {
  const containerRef = useRef(null);
  const instanceRef = useRef(null);

  const storeMood = useDecisionStore((s) => s.companionMood);
  const color = useDecisionStore((s) => s.strobiColor);
  const mood = moodOverride || storeMood || "idle";

  const moodRef = useRef(mood);
  useEffect(() => {
    moodRef.current = mood;
  }, [mood]);

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
    } catch (err) {
      console.error("[Strobi] Error al montar avatar:", err);
    }
    return () => {
      const instance = instanceRef.current;
      if (instance?.destroy) instance.destroy();
      else if (instance?.stop) instance.stop();
      instanceRef.current = null;
    };
  }, [definition]);

  // Cambios de ánimo
  useEffect(() => {
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

  // Pausa la animación con la pestaña oculta (ahorra CPU)
  useEffect(() => {
    const onVisibility = () => {
      const instance = instanceRef.current;
      if (!instance) return;
      if (document.hidden) instance.stop?.();
      else instance.play?.(moodRef.current);
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  return (
    <div
      onClick={onClick}
      style={{ width: size, height: size }}
      className={`flex items-center justify-center ${onClick ? "cursor-pointer" : ""} ${className}`}
    >
      <div
        ref={containerRef}
        className="w-full h-full flex items-center justify-center pointer-events-none"
      />
    </div>
  );
}
