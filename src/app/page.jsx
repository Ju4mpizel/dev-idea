"use client";

import { motion } from "framer-motion";
import DevIdeaLogo from "@/components/brand/DevIdeaLogo";
import { CompanionAvatar } from "@/components/companion/CompanionAvatar";
import { DecisionCanvas } from "@/components/map/DecisionCanvas";
import { StationBreadcrumb } from "@/components/navigation/StationBreadcrumb";
import { useDecisionStore } from "@/hooks/useDecisionStore";

export default function HomePage() {
  const currentStep = useDecisionStore((state) => state.currentStep);
  const isRouteMapOpen = useDecisionStore((state) => state.isRouteMapOpen);

  // Solo desplazar si el mapa está abierto y estamos en la estación 1 en adelante
  const shouldOffset = isRouteMapOpen && currentStep > 0;

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 relative overflow-x-hidden font-sans selection:bg-neutral-800 selection:text-white">
      {/* Resplandor ambiental de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-neutral-800/15 blur-[160px] pointer-events-none rounded-full" />

      {/* Header oficial */}
      <header className="w-full border-b border-neutral-900 bg-neutral-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DevIdeaLogo height={28} className="text-white" />
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
              Inferencia Gemini 3.8 Flash
            </span>
          </div>
        </div>
      </header>

      {/* Tarjeta de mapa lateral */}
      <StationBreadcrumb />

      {/* Contenedor Principal: vuelve al centro automáticamente en la estación 0 */}
      <motion.div
        animate={{
          x: shouldOffset ? -160 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col items-center"
      >
        {/* Companion Strobi */}
        <section className="mb-4 flex flex-col items-center">
          <CompanionAvatar size={150} />
        </section>

        {/* Lienzo */}
        <section className="w-full flex justify-center">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <DecisionCanvas />
          </motion.div>
        </section>
      </motion.div>

      <footer className="w-full border-t border-neutral-900 py-6 text-center text-xs text-neutral-600 font-mono">
        Dev.Idea © 2026 · Lienzo de Arquitectura y Decisiones Técnicas
      </footer>
    </main>
  );
}
