"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { createAvatar } from "@bible-strong/avatar-web";
import baseAvatarDefinition from "@/data/avatar.avatar.json";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { CompanionBubble } from "./CompanionBubble";
import { STROBI_QUOTES } from "@/data/strobiQuotes";

const STROBI_COLORS = [
  { id: "blue", label: "Azul Original", hex: "#5b7fe5" },
  { id: "violet", label: "Cyber Violet", hex: "#8b5cf6" },
  { id: "emerald", label: "Mint Dev", hex: "#10b981" },
  { id: "amber", label: "Warm Amber", hex: "#f59e0b" },
  { id: "dark", label: "Obsidian Tech", hex: "#3f3f46" },
];

export function CompanionAvatar({ size = 130, className = "" }) {
  const containerRef = useRef(null);
  const avatarInstance = useRef(null);
  const resetTimerRef = useRef(null);

  const mood = useDecisionStore((state) => state.companionMood);
  const dialogue = useDecisionStore((state) => state.companionDialogue);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const setCompanion = useDecisionStore((state) => state.setCompanion);

  const [isShaking, setIsShaking] = useState(false);
  const [currentColor, setCurrentColor] = useState(STROBI_COLORS[0].hex);
  const previousStateRef = useRef({ mood, dialogue });

  // 1. Definición procedural reactiva al color
  const dynamicDefinition = useMemo(() => {
    return {
      ...baseAvatarDefinition,
      colors: {
        ...baseAvatarDefinition.colors,
        body: currentColor,
      },
    };
  }, [currentColor]);

  // 2. Montaje y actualización limpia de la instancia del avatar
  useEffect(() => {
    if (!containerRef.current) return;

    if (avatarInstance.current?.destroy) {
      avatarInstance.current.destroy();
    }
    containerRef.current.innerHTML = "";

    try {
      avatarInstance.current = createAvatar(containerRef.current, {
        definition: dynamicDefinition,
        defaultAnimation: mood || "idle",
      });
    } catch (err) {
      console.error("[Strobi] Error al montar avatar:", err);
    }

    return () => {
      if (avatarInstance.current?.destroy) {
        avatarInstance.current.destroy();
      } else if (avatarInstance.current?.stop) {
        avatarInstance.current.stop();
      }
    };
  }, [dynamicDefinition]);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  // 3. Reaccionar a cambios en el Store (estaciones)
  useEffect(() => {
    if (!avatarInstance.current || !mood) return;
    try {
      avatarInstance.current.play(mood);
    } catch {
      // Ignorar si el mood no es una animación nativa directa
    }
  }, [mood]);

  const handleColorChange = (hex) => {
    setCurrentColor(hex);
  };

  // 4. Interacción de clics sobre Strobi
  const handleAvatarClick = () => {
    if (isLoading) return;

    if (!resetTimerRef.current) {
      previousStateRef.current = { mood, dialogue };
    } else {
      clearTimeout(resetTimerRef.current);
    }

    const randomItem =
      STROBI_QUOTES[Math.floor(Math.random() * STROBI_QUOTES.length)];
    setIsShaking(Boolean(randomItem.shake));

    if (randomItem.expression && avatarInstance.current?.setExpression) {
      avatarInstance.current.setExpression(randomItem.expression);
    } else if (randomItem.animation && avatarInstance.current?.play) {
      avatarInstance.current.play(randomItem.animation);
    }

    setCompanion(randomItem.animation || mood, randomItem.quote);

    // Retorno suave al diálogo original
    resetTimerRef.current = setTimeout(() => {
      setIsShaking(false);
      if (avatarInstance.current?.play) {
        avatarInstance.current.play(previousStateRef.current.mood || "idle");
      }
      setCompanion(
        previousStateRef.current.mood,
        previousStateRef.current.dialogue,
      );
      resetTimerRef.current = null;
    }, 5000);
  };

  return (
    <div
      className={`w-full max-w-2xl flex items-center justify-center gap-5 sm:gap-7 select-none ${className}`}
    >
      {/* Avatar interactivo */}
      <div className="w-[140px] shrink-0 flex flex-col items-center justify-center">
        <div
          onClick={handleAvatarClick}
          title="Haz clic para un consejo técnico de Strobi"
          style={{ width: size, height: size }}
          className={`flex items-center justify-center cursor-pointer transition-transform hover:scale-105 active:scale-95 ${
            isShaking ? "animate-[wiggle_0.15s_ease-in-out_infinite]" : ""
          }`}
        >
          <div
            ref={containerRef}
            className="w-full h-full flex items-center justify-center pointer-events-none"
          />
        </div>

        {/* Paleta de colores */}
        <div className="flex items-center gap-2 mt-2 bg-neutral-900/70 border border-neutral-800 px-2.5 py-1 rounded-full shadow-sm backdrop-blur-sm">
          {STROBI_COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => handleColorChange(c.hex)}
              title={c.label}
              className={`w-3 h-3 rounded-full transition-transform cursor-pointer ${
                currentColor === c.hex
                  ? "scale-125 ring-2 ring-white/90"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </div>

      {/* Burbuja de diálogo */}
      <div className="w-[360px] sm:w-[440px] shrink-0 min-h-[88px] flex items-center">
        <CompanionBubble message={dialogue} isThinking={isLoading} />
      </div>
    </div>
  );
}
