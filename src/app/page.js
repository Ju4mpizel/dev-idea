"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CompanionAvatar } from "@/components/companion/CompanionAvatar";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import {
  Sparkles,
  GraduationCap,
  Briefcase,
  FlaskConical,
  Layers,
  Cpu,
  ArrowRight,
  Github,
  CheckCircle2,
} from "lucide-react";

const CONTEXT_OPTIONS = [
  {
    id: "universidad",
    label: "Académico / U",
    icon: GraduationCap,
    desc: "Fácil de defender y estructurado",
  },
  {
    id: "startup",
    label: "Startup / Trabajo",
    icon: Briefcase,
    desc: "Escalable y enfocado a producto",
  },
  {
    id: "personal",
    label: "Personal / MVP",
    icon: FlaskConical,
    desc: "Rápido, ligero y experimental",
  },
];

const SAMPLE_STACKS = [
  {
    id: "fullstack-modern",
    name: "Modern Fullstack (Serverless)",
    techs: ["Next.js", "Tailwind", "Supabase", "Vercel"],
    tag: "Recomendado MVP",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    id: "robust-api",
    name: "API REST Robusta & Frontend",
    techs: ["React + Vite", "FastAPI (Python)", "PostgreSQL", "Render"],
    tag: "Ideal Académico",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
];

export default function HomePage() {
  const { blueprint, updateBlueprint, setCompanion } = useDecisionStore();

  const [ideaInput, setIdeaInput] = useState(blueprint.idea || "");
  const [selectedContext, setSelectedContext] = useState(
    blueprint.context || "personal",
  );
  const [selectedStack, setSelectedStack] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const handleStartAnalysis = (e) => {
    e.preventDefault();
    if (!ideaInput.trim()) return;

    updateBlueprint("idea", ideaInput);
    updateBlueprint("context", selectedContext);

    // Animación de pensamiento del copiloto Strobi
    setCompanion(
      "thinking",
      "Analizando la idea y midiendo el alcance técnico...",
    );
    setIsSimulating(true);

    setTimeout(() => {
      setIsSimulating(false);
      setCompanion(
        "curious",
        "¡Listo! Aquí tienes opciones de stack balanceadas.",
      );
    }, 1200);
  };

  const handleSelectStack = (stack) => {
    setSelectedStack(stack.id);
    updateBlueprint("stack", stack);
    setCompanion(
      "proud",
      `Excelente elección con ${stack.name}. Ahora toca la arquitectura.`,
    );
  };

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 relative overflow-hidden">
      {/* Fondo con destello sutil */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-neutral-800/20 blur-[140px] pointer-events-none rounded-full" />

      {/* Barra de navegación */}
      <header className="w-full border-b border-neutral-900/80 bg-neutral-950/70 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {/* Isotipo minimalista */}
            <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-black font-bold text-sm tracking-tighter">
              D.
            </div>
            <span className="font-bold text-lg tracking-tight text-white">
              Dev<span className="text-neutral-500">.</span>Idea
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
              v0.1.0 Preview
            </span>
            <a
              href="https://github.com"
              target="_blank"
              rel="noreferrer"
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
          </div>
        </div>
      </header>

      {/* Contenido Central */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-6 py-12 flex flex-col items-center">
        {/* Sección del Copiloto Reactivo Strobi */}
        <section className="mb-8 flex flex-col items-center">
          <CompanionAvatar size={160} />
        </section>

        {/* Estación 0: Entrada de Idea y Calibrador */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full bg-neutral-900/50 border border-neutral-800/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl relative"
        >
          <div className="mb-6">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
              Estación 0 · Entrada & Contexto
            </span>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-1">
              ¿Qué proyecto tienes en mente?
            </h1>
            <p className="text-sm text-neutral-400 mt-1">
              Escribe una descripción corta para calibrar el stack y los
              diagramas.
            </p>
          </div>

          <form onSubmit={handleStartAnalysis} className="space-y-6">
            {/* Campo de Idea */}
            <div>
              <input
                type="text"
                placeholder="Ej. Mini dashboard de turnos para una barbería con pagos QR..."
                value={ideaInput}
                onChange={(e) => setIdeaInput(e.target.value)}
                className="w-full bg-neutral-950/80 border border-neutral-800 rounded-2xl px-5 py-4 text-sm sm:text-base text-white placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all"
              />
            </div>

            {/* Selector de Contexto */}
            <div>
              <label className="text-xs font-medium text-neutral-400 uppercase tracking-wider block mb-3 font-mono">
                Propósito del desarrollo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {CONTEXT_OPTIONS.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedContext === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedContext(item.id)}
                      className={`flex flex-col items-start p-4 rounded-2xl border text-left transition-all ${
                        isSelected
                          ? "bg-neutral-800 border-neutral-600 text-white shadow-lg"
                          : "bg-neutral-950/50 border-neutral-800/80 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <Icon
                          className={`w-4 h-4 ${isSelected ? "text-white" : "text-neutral-500"}`}
                        />
                        <span className="font-semibold text-sm">
                          {item.label}
                        </span>
                      </div>
                      <span className="text-xs text-neutral-500 leading-snug">
                        {item.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón de Iniciar */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={!ideaInput.trim() || isSimulating}
                className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 font-medium px-6 py-3 rounded-2xl text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSimulating ? (
                  <>
                    <Sparkles className="w-4 h-4 animate-spin text-neutral-800" />
                    <span>Evaluando con IA...</span>
                  </>
                ) : (
                  <>
                    <span>Generar Opciones de Stack</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Sección de Muestra: Estación 2 (Stack Tecnológico) */}
        <AnimatePresence>
          {blueprint.idea && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full mt-10"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400 font-mono">
                    Estación 2 · Stack Dinámico
                  </span>
                  <h2 className="text-lg font-bold text-white">
                    Combinaciones Recomendadas
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_STACKS.map((stack) => {
                  const isSelected = selectedStack === stack.id;
                  return (
                    <div
                      key={stack.id}
                      onClick={() => handleSelectStack(stack)}
                      className={`p-6 rounded-3xl border transition-all cursor-pointer relative ${
                        isSelected
                          ? "bg-neutral-900 border-neutral-500 shadow-xl ring-1 ring-neutral-500"
                          : "bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full border font-mono ${stack.badgeColor}`}
                        >
                          {stack.tag}
                        </span>
                        {isSelected && (
                          <CheckCircle2 className="w-5 h-5 text-white" />
                        )}
                      </div>

                      <h3 className="font-bold text-white text-base mb-3">
                        {stack.name}
                      </h3>

                      <div className="flex flex-wrap gap-2">
                        {stack.techs.map((tech) => (
                          <span
                            key={tech}
                            className="text-xs px-3 py-1 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-300 font-mono"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer minimalista */}
      <footer className="w-full border-t border-neutral-900 py-6 text-center text-xs text-neutral-600 font-mono">
        Dev.Idea © 2026 · Interactive Architecture Decision Canvas
      </footer>
    </main>
  );
}
