"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { CompanionBubble } from "./CompanionBubble";
import { StrobiAvatar } from "./StrobiAvatar";
import { STROBI_QUOTES } from "@/data/strobiQuotes";
import { introClass, introDelay } from "@/hooks/useIntro";

const STROBI_COLORS = [
  { id: "blue", label: "Azul Original", hex: "#5b7fe5" },
  { id: "violet", label: "Cyber Violet", hex: "#8b5cf6" },
  { id: "emerald", label: "Mint Dev", hex: "#10b981" },
  { id: "amber", label: "Warm Amber", hex: "#f59e0b" },
  { id: "dark", label: "Obsidian Tech", hex: "#3f3f46" },
];

/** Strobi en la cabecera: avatar + paleta de colores + burbuja de diálogo. */
export function CompanionAvatar({
  size = 110,
  compact = false,
  // Strobi tapado u oculto (panel abierto): se congela para no gastar CPU
  paused = false,
  // Entrada de la página: Strobi aparece con un "pop" y luego habla
  intro = false,
  className = "",
}) {
  const resetTimerRef = useRef(null);

  const mood = useDecisionStore((state) => state.companionMood);
  const dialogue = useDecisionStore((state) => state.companionDialogue);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const color = useDecisionStore((state) => state.strobiColor);
  const setStrobiColor = useDecisionStore((state) => state.setStrobiColor);

  const [isShaking, setIsShaking] = useState(false);
  const [expression, setExpression] = useState(null);
  const previousStateRef = useRef({ mood, dialogue });

  useEffect(
    () => () => {
      if (resetTimerRef.current) clearTimeout(resetTimerRef.current);
    },
    [],
  );

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

    setExpression(randomItem.expression || null);

    setCompanion(randomItem.animation || mood, randomItem.quote);

    resetTimerRef.current = setTimeout(() => {
      setIsShaking(false);
      setExpression(null);
      setCompanion(
        previousStateRef.current.mood,
        previousStateRef.current.dialogue,
      );
      resetTimerRef.current = null;
    }, 5000);
  };

  return (
    <div
      className={`w-full max-w-2xl flex ${
        compact ? "flex-row" : "flex-col sm:flex-row"
      } items-center justify-center gap-3 sm:gap-6 select-none px-2 ${className}`}
    >
      {/* Columna Strobi: tamaño estricto para evitar saltos horizontales */}
      <div
        className={`${compact ? "w-[84px]" : "w-[120px]"} sm:w-[130px] shrink-0 flex flex-col items-center justify-center`}
      >
        <div
          className={introClass(intro, "intro-pop")}
          style={introDelay(intro, 480)}
        >
        <div
          title={
            isLoading
              ? "Strobi está pensando..."
              : "Haz clic para un consejo técnico de Strobi"
          }
          className={`transition-transform ${
            isLoading ? "cursor-wait" : "hover:scale-105 active:scale-95"
          } ${isShaking ? "animate-[wiggle_0.15s_ease-in-out_infinite]" : ""}`}
        >
          {/* Mientras genera: cara fija de concentración y sin clic */}
          <StrobiAvatar
            size={size}
            mood={isLoading ? "focused-thinking" : null}
            onClick={isLoading ? undefined : handleAvatarClick}
            expression={isLoading ? null : expression}
            paused={paused}
          />
        </div>
        </div>

        {/* Paleta de colores */}
        <div
          className={`flex items-center gap-1.5 mt-1 sm:mt-2 bg-neutral-900/80 border border-neutral-800 px-2 py-0.5 sm:py-1 rounded-full shadow-sm ${introClass(intro, "intro-fade")}`}
          style={introDelay(intro, 820)}
        >
          {STROBI_COLORS.map((c, i) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setStrobiColor(c.hex)}
              title={c.label}
              aria-label={`Color de Strobi: ${c.label}`}
              className={`${introClass(intro, "intro-dot")} w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-transform cursor-pointer ${
                color === c.hex
                  ? "scale-125 ring-2 ring-white/90"
                  : "opacity-60 hover:opacity-100"
              }`}
              style={introDelay(intro, 900 + i * 60, { backgroundColor: c.hex })}
            />
          ))}
        </div>
      </div>

      {/* Columna Burbuja: ancho fijo en escritorio para fijar la posición de Strobi */}
      <motion.div
        layout
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        style={introDelay(intro, 760)}
        className={`${introClass(intro, "intro-slide-left")} ${compact ? "flex-1 min-w-0" : "w-full"} sm:flex-none sm:w-[460px] md:w-[480px] sm:shrink-0 min-h-[64px] sm:min-h-[82px] flex items-center`}
      >
        <CompanionBubble
          message={dialogue}
          isThinking={isLoading}
          compact={compact}
        />
      </motion.div>
    </div>
  );
}
