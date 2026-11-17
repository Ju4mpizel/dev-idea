"use client";

import { motion } from "framer-motion";

export function SkeletonFormStation0() {
  return (
    <div className="w-full max-w-xl mx-auto p-4 sm:p-7 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl shadow-2xl flex flex-col gap-4 sm:gap-6 relative overflow-hidden select-none">
      <motion.div
        initial={{ x: "-100%" }}
        animate={{ x: "100%" }}
        transition={{
          repeat: Infinity,
          duration: 1.8,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-neutral-700/10 to-transparent pointer-events-none"
      />

      <div>
        <div className="h-3 w-32 bg-neutral-800/80 rounded mb-2 animate-pulse" />
        <div className="h-6 sm:h-7 w-64 bg-neutral-800 rounded mb-2 animate-pulse" />
        <div className="h-3.5 w-72 bg-neutral-800/60 rounded animate-pulse" />
      </div>

      <div className="h-20 w-full rounded-xl bg-neutral-950/80 border border-neutral-800/80 p-3 flex flex-col gap-2">
        <div className="h-3 w-3/4 bg-neutral-800/50 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-neutral-800/40 rounded animate-pulse" />
      </div>

      <div>
        <div className="h-3 w-28 bg-neutral-800/80 rounded mb-2 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="p-3 rounded-xl border border-neutral-800/80 bg-neutral-950/60 flex flex-col gap-1.5"
            >
              <div className="h-3.5 w-20 bg-neutral-800 rounded animate-pulse" />
              <div className="h-2.5 w-28 bg-neutral-800/50 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-1">
        <div className="h-10 w-44 rounded-xl bg-neutral-800/90 animate-pulse" />
      </div>
    </div>
  );
}
