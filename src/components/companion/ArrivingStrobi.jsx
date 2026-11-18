"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { StrobiAvatar } from "./StrobiAvatar";

/**
 * Strobi "llega" volando desde arriba y se coloca sobre un panel lateral
 * ("¿Qué es?", "Mi plano"). No anima su cara hasta aterrizar: así el vuelo
 * solo mueve una capa ya dibujada.
 */
export function ArrivingStrobi({ mood = "explaining", size = 84 }) {
  const [hasLanded, setHasLanded] = useState(false);
  return (
    <motion.div
      initial={{ y: -160, opacity: 0, rotate: -12 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      exit={{ y: -160, opacity: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 18, delay: 0.08 }}
      onAnimationComplete={() => setHasLanded(true)}
      className="self-center -mb-6 relative z-10 will-change-transform"
    >
      <StrobiAvatar size={size} mood={mood} paused={!hasLanded} />
    </motion.div>
  );
}
