"use client";

import { motion } from "framer-motion";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { Sparkles, Terminal } from "lucide-react";

export function BlueprintShowcase({ data, blueprint }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
            Estación 10 · ¡A Trabajar!
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Plano Técnico & Workspace
          </h2>
        </div>
        <TopBarControls />
      </div>

      <div className="p-8 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl flex flex-col items-center justify-center text-center gap-4 py-16">
        <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.15)]">
          <Sparkles className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-white">
            Workspace en Preparación
          </h3>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm font-sans">
            Aquí se desplegarán las tarjetas Bento con el árbol de archivos, los
            esquemas de base de datos y el archivo AGENTS.md listo para copiar.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] font-mono text-neutral-400">
          <Terminal className="w-3.5 h-3.5 text-neutral-500" />
          <span>Proyecto: {blueprint?.selectedName || "En desarrollo"}</span>
        </div>
      </div>
    </motion.div>
  );
}
