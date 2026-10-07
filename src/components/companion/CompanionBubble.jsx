"use client";

import { motion, AnimatePresence } from "framer-motion";

export function CompanionBubble({ message, isThinking = false }) {
  if (!message && !isThinking) return null;

  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={message || "thinking"}
          initial={{ opacity: 0, x: -6 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 6 }}
          transition={{ duration: 0.16, ease: "easeOut" }}
          className="relative w-full px-5 py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-neutral-200 text-xs sm:text-sm font-medium shadow-xl backdrop-blur-md text-left"
        >
          {isThinking ? (
            <span className="inline-flex items-center gap-1.5 text-neutral-400 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse [animation-delay:200ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse [animation-delay:400ms]" />
            </span>
          ) : (
            <p className="leading-relaxed">{message}</p>
          )}

          {/* Flecha lateral hacia Strobi */}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-neutral-900 border-l border-b border-neutral-800 rotate-45" />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
