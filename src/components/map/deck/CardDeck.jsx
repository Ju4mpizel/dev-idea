"use client";

import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Plus, Minus } from "lucide-react";
import { getLevelStyle } from "@/components/map/stations/levelStyles";
import { useMediaQuery } from "@/hooks/useMediaQuery";

const SWIPE_THRESHOLD = 60;

/**
 * Tamaño de carta (formato naipe, vertical). La altura se adapta a la pantalla
 * para que el pie de la estación siempre quede a la vista.
 */
const CARD_SIZE =
  "w-[min(270px,72vw)] sm:w-[280px] lg:w-[290px] h-[clamp(296px,calc(100dvh-460px),430px)]";

/** Altura del área del abanico (carta + caída de las cartas laterales). */
const FAN_HEIGHT = "h-[calc(clamp(296px,calc(100dvh-460px),430px)+24px)]";

/**
 * Geometría del abanico según el ancho de pantalla:
 * - spread: separación horizontal entre cartas.
 * - reach:  cuántas cartas se ven a cada lado de la activa.
 */
function useFanLayout() {
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isTablet = useMediaQuery("(min-width: 640px)");
  if (isDesktop) return { spread: 175, reach: 2, tilt: 6, drop: 14 };
  if (isTablet) return { spread: 120, reach: 2, tilt: 6, drop: 12 };
  return { spread: 34, reach: 1, tilt: 4, drop: 10 };
}

/** Distancia circular más corta entre dos índices (-n/2 .. n/2). */
function circularOffset(index, active, count) {
  let d = index - active;
  if (d > count / 2) d -= count;
  if (d < -count / 2) d += count;
  return d;
}

/**
 * Mazo en abanico común a todas las estaciones (estilo "bounce cards").
 *
 * - La carta del centro se elige con clic / Enter / botón "Elegir".
 * - Las laterales se traen al centro con un clic; también se baraja con las
 *   flechas, los indicadores numerados, el teclado (← →) o deslizando.
 * - `renderCard(item, { isSelected, isFront, isDimmed })` dibuja el contenido;
 *   todas las cartas comparten tamaño, así nada se desordena ni empuja el pie.
 */
export function CardDeck({
  items,
  getKey = (item) => item.id,
  getLabel = (item) => item.title,
  getLevel = (item) => item.level,
  selectedKeys,
  onToggle,
  selection = "single",
  isLocked = false,
  renderCard,
  emptyMessage = "No hay opciones para mostrar.",
}) {
  const count = items.length;
  const { spread, reach, tilt, drop } = useFanLayout();
  const [activeIndex, setActiveIndex] = useState(() => {
    const first = items.findIndex((item) => selectedKeys.has(getKey(item)));
    return first > 0 ? first : 0;
  });
  const draggedRef = useRef(false);

  if (count === 0) {
    return (
      <div
        className={`${FAN_HEIGHT} w-full rounded-3xl border border-dashed border-neutral-800 bg-neutral-950/40 flex items-center justify-center text-center p-6 text-xs font-mono text-neutral-500`}
      >
        {emptyMessage}
      </div>
    );
  }

  const active = ((activeIndex % count) + count) % count;
  const goTo = (index) => setActiveIndex(((index % count) + count) % count);
  const next = () => goTo(active + 1);
  const prev = () => goTo(active - 1);

  const activeItem = items[active];
  const activeSelected = selectedKeys.has(getKey(activeItem));
  const toggleActive = () => {
    if (!isLocked) onToggle(activeItem);
  };

  const handleKeyDown = (e) => {
    if (e.target !== e.currentTarget) return;
    if (e.key === "ArrowRight") {
      e.preventDefault();
      next();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      prev();
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleActive();
    }
  };

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Abanico */}
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="listbox"
        aria-label="Opciones de la estación"
        aria-multiselectable={selection === "multi" || undefined}
        className={`${FAN_HEIGHT} relative w-full outline-none focus-visible:ring-2 focus-visible:ring-neutral-700 rounded-3xl`}
      >
        {items.map((item, index) => {
          const key = getKey(item);
          const d = circularOffset(index, active, count);
          const distance = Math.abs(d);
          const isFront = d === 0;
          const isVisible = distance <= reach;
          const isSelected = selectedKeys.has(key);
          const isDimmed = isLocked && !isSelected;

          return (
            <motion.div
              key={key}
              initial={{ x: 0, y: 40, rotate: 0, scale: 0.85, opacity: 0 }}
              animate={{
                x: d * spread,
                y: distance * drop,
                rotate: d * tilt,
                scale: 1 - distance * 0.07,
                opacity: isVisible ? 1 : 0,
              }}
              whileHover={
                isVisible && !isFront
                  ? { y: distance * drop - 10, transition: { duration: 0.15 } }
                  : undefined
              }
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 20,
                delay: 0,
              }}
              style={{
                zIndex: 20 - distance,
                pointerEvents: isVisible ? "auto" : "none",
              }}
              drag={isFront && count > 1 ? "x" : false}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.5}
              onDragStart={() => {
                draggedRef.current = true;
              }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -SWIPE_THRESHOLD) next();
                else if (info.offset.x > SWIPE_THRESHOLD) prev();
                // El clic que sigue al arrastre no debe seleccionar
                setTimeout(() => {
                  draggedRef.current = false;
                }, 0);
              }}
              onClick={() => {
                if (draggedRef.current) return;
                if (isFront) toggleActive();
                else goTo(index);
              }}
              role="option"
              aria-selected={isSelected}
              aria-hidden={!isFront}
              className={`absolute top-0 left-1/2 -translate-x-1/2 origin-bottom touch-pan-y ${CARD_SIZE} ${
                isFront && isLocked ? "cursor-grab" : "cursor-pointer"
              }`}
            >
              <div className="relative w-full h-full">
                {renderCard(item, { isSelected, isFront, isDimmed })}
                {/* Las laterales se oscurecen para leer solo la del centro */}
                {!isFront && (
                  <div
                    className="absolute inset-0 rounded-2xl bg-neutral-950 pointer-events-none transition-opacity duration-300"
                    style={{ opacity: Math.min(0.25 + distance * 0.2, 0.7) }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Navegación del mazo */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={prev}
          disabled={count < 2}
          aria-label="Carta anterior"
          className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="min-w-0 flex items-center justify-center gap-1.5 overflow-x-auto no-scrollbar px-1">
          {items.map((item, index) => {
            const key = getKey(item);
            const isActive = index === active;
            const isSelected = selectedKeys.has(key);
            const style = getLevelStyle(getLevel(item) || "simple");
            return (
              <button
                key={key}
                type="button"
                onClick={() => goTo(index)}
                title={getLabel(item)}
                aria-label={`Opción ${index + 1}: ${getLabel(item)}${isSelected ? " (elegida)" : ""}`}
                className={`relative h-7 rounded-lg border text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shrink-0 ${
                  isActive ? "w-10 sm:w-12" : "w-7"
                } ${
                  isSelected
                    ? style.checkSelected
                    : isActive
                      ? "bg-neutral-800 border-neutral-500 text-white"
                      : "bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-200 hover:border-neutral-700"
                }`}
              >
                {isSelected ? (
                  <Check className="w-3 h-3 stroke-[3]" />
                ) : (
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${style.accentDot}`}
                  />
                )}
                {(isActive || !isSelected) && <span>{index + 1}</span>}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={next}
          disabled={count < 2}
          aria-label="Carta siguiente"
          className="p-2 rounded-xl border border-neutral-800 bg-neutral-900/70 text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {!isLocked && (
          <button
            type="button"
            onClick={toggleActive}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl border text-[11px] font-mono transition-colors cursor-pointer shrink-0 ${
              activeSelected
                ? "border-neutral-600 bg-neutral-800 text-neutral-200 hover:bg-neutral-700"
                : "border-neutral-700 bg-neutral-900 text-neutral-200 hover:bg-neutral-800"
            }`}
          >
            {selection === "multi" ? (
              activeSelected ? (
                <Minus className="w-3.5 h-3.5" />
              ) : (
                <Plus className="w-3.5 h-3.5" />
              )
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>
              {selection === "multi"
                ? activeSelected
                  ? "Quitar"
                  : "Añadir"
                : activeSelected
                  ? "Elegida"
                  : "Elegir esta"}
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

/** Esqueleto de carga con la misma forma de abanico. */
export function DeckSkeleton() {
  const { spread, reach, tilt, drop } = useFanLayout();
  const offsets = Array.from({ length: reach * 2 + 1 }, (_, i) => i - reach);
  return (
    <div className="w-full flex flex-col gap-3">
      <div className={`${FAN_HEIGHT} relative w-full`}>
        {offsets.map((d) => {
          const distance = Math.abs(d);
          return (
            <div
              key={d}
              className={`absolute top-0 left-1/2 origin-bottom rounded-2xl border border-neutral-800/80 bg-neutral-900 overflow-hidden ${CARD_SIZE}`}
              style={{
                transform: `translateX(calc(-50% + ${d * spread}px)) translateY(${distance * drop}px) rotate(${d * tilt}deg) scale(${1 - distance * 0.07})`,
                zIndex: 20 - distance,
                opacity: d === 0 ? 1 : 0.55,
              }}
            >
              {d === 0 && (
                <div className="p-4 flex flex-col gap-3 h-full">
                  <div className="h-4 w-24 bg-neutral-800 rounded-md animate-pulse" />
                  <div className="h-5 w-3/4 bg-neutral-800 rounded-md animate-pulse" />
                  <div className="h-3 w-full bg-neutral-800/60 rounded animate-pulse" />
                  <div className="h-3 w-4/5 bg-neutral-800/60 rounded animate-pulse" />
                  <div className="h-14 w-full bg-neutral-800/40 rounded-xl animate-pulse mt-1" />
                  <div className="flex gap-1.5 flex-wrap">
                    <div className="h-5 w-16 bg-neutral-800/70 rounded animate-pulse" />
                    <div className="h-5 w-20 bg-neutral-800/70 rounded animate-pulse" />
                    <div className="h-5 w-14 bg-neutral-800/70 rounded animate-pulse" />
                  </div>
                  <div className="mt-auto h-3 w-3/4 bg-neutral-800/50 rounded animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="h-9 flex items-center justify-center gap-1.5">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-lg bg-neutral-900 border border-neutral-800 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}
