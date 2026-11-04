"use client";

import { motion } from "framer-motion";

export function SkeletonCard({ height = "h-[270px]", className = "" }) {
  return (
    <div
      className={`relative w-full ${height} p-4 sm:p-5 rounded-2xl border border-neutral-800/80 bg-neutral-900/30 backdrop-blur-md flex flex-col justify-between overflow-hidden select-none ${className}`}
    >
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
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-20 sm:w-24 bg-neutral-800/90 rounded-md animate-pulse" />
          <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-neutral-800 bg-neutral-900/80" />
        </div>

        <div className="h-5 w-36 sm:w-44 bg-neutral-800 rounded-md mb-2 animate-pulse" />

        <div className="space-y-1.5 mb-4">
          <div className="h-3 w-full bg-neutral-800/60 rounded animate-pulse" />
          <div className="h-3 w-4/5 bg-neutral-800/50 rounded animate-pulse" />
        </div>

        <div className="flex flex-wrap gap-1.5 mb-3">
          <div className="h-4 w-14 bg-neutral-800/70 rounded animate-pulse" />
          <div className="h-4 w-16 bg-neutral-800/70 rounded animate-pulse" />
          <div className="h-4 w-12 bg-neutral-800/70 rounded animate-pulse" />
        </div>
      </div>

      <div className="pt-2.5 border-t border-neutral-900 flex flex-col gap-1.5">
        <div className="h-3 w-3/4 bg-neutral-800/50 rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-neutral-800/40 rounded animate-pulse" />
      </div>
    </div>
  );
}

export function SkeletonGrid({
  count = 3,
  columns = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
  height = "h-[270px]",
}) {
  return (
    <div className={`grid ${columns} gap-3 sm:gap-4 w-full`}>
      {Array.from({ length: count }).map((_, idx) => (
        <SkeletonCard key={idx} height={height} />
      ))}
    </div>
  );
}

// Esqueleto dedicado para la Estación 0 (Formulario de Entrada)
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
