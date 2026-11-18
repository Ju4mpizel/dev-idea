"use client";

import { motion, AnimatePresence } from "framer-motion";

export function CompanionBubble({ message, isThinking = false, compact = false }) {
  if (!message && !isThinking) return null;

  return (
    <div className="w-full relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={message || "thinking"}
          layout
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className={`relative w-full px-4 sm:px-5 py-2.5 sm:py-3.5 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-neutral-200 text-xs sm:text-sm font-medium shadow-xl backdrop-blur-md ${compact ? "text-left" : "text-center sm:text-left"}`}
        >
          {isThinking ? (
            <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-neutral-400 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse [animation-delay:200ms]" />
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse [animation-delay:400ms]" />
            </span>
          ) : (
            <p className="leading-relaxed">{message}</p>
          )}

          {/* Flecha hacia Strobi */}
          <div className={`${compact ? "block" : "hidden sm:block"} absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-neutral-900 border-l border-b border-neutral-800 rotate-45`} />
          <div className={`${compact ? "hidden" : "sm:hidden"} absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-neutral-900 border-t border-l border-neutral-800 rotate-45`} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
