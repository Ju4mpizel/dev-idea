"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Check, Copy, Download, FileText } from "lucide-react";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import {
  LAST_STEP,
  PHASES,
  isStationInMode,
  stationNumberInMode,
} from "@/config/stations.config";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { buildPlanEntries, buildPlanMarkdown } from "@/lib/planSummary";
import { buildAgentsMd } from "@/lib/agentsMd";
import {
  AgentsMdWidget,
  AiKitWidget,
  ArchitectureWidget,
  CommandsWidget,
  DataModelWidget,
  DatabaseWidget,
  DeployWidget,
  DiagramsWidget,
  FoldersWidget,
  HeroWidget,
  LayoutWidget,
  RequirementsWidget,
  StackWidget,
  StatsWidget,
  StoriesWidget,
  StyleWidget,
  SuggestionWidget,
  SystemTypeWidget,
  WorkPlanWidget,
} from "./BlueprintWidgets";

/** Copiar al portapapeles con confirmación breve en el botón. */
function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((c) => (c === key ? null : c)), 2000);
    } catch {
      setCopied("error");
    }
  };
  return { copied, copy };
}

function ActionButton({ onClick, icon: Icon, children, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[11px] font-mono transition-colors cursor-pointer ${
        active
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
          : "border-neutral-800 bg-neutral-950/70 text-neutral-300 hover:bg-neutral-800 hover:text-white"
      }`}
    >
      {active ? (
        <Check className="w-3.5 h-3.5" aria-hidden="true" />
      ) : (
        <Icon className="w-3.5 h-3.5" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}

function downloadText(filename, text) {
  const url = URL.createObjectURL(
    new Blob([text], { type: "text/markdown;charset=utf-8" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Bloque de una fase: título con su color y la grilla bento de sus widgets. */
function PhaseBlock({ phase, delay, children }) {
  const p = PHASES[phase];
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col gap-2.5"
    >
      <h3 className="flex items-center gap-2 text-[10px] sm:text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-500">
        <span className={`w-2 h-2 rounded-full ${p.dot}`} />
        <span className={p.text}>{p.label}</span>
        <span className="flex-1 h-px bg-neutral-800/80" />
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-6 lg:grid-cols-12 gap-3">
        {children}
      </div>
    </motion.div>
  );
}

/**
 * Estación final "¡A Trabajar!": todo el plano en un bento por fases. Cada
 * widget tiene su color; lo decidido sale del blueprint (al instante) y lo
 * generado al cierre (carpetas, comandos, modelo de datos y plan de trabajo)
 * del scaffold de la IA.
 */
export function BlueprintShowcase({ data, blueprint }) {
  const generatedOptions = useDecisionStore((s) => s.generatedOptions);
  const isLoading = useDecisionStore((s) => s.isLoading);
  const scaffold = data?.scaffold || null;
  const isGenerating = isLoading && !scaffold;
  const { copied, copy } = useCopy();

  const entries = useMemo(
    () => buildPlanEntries(blueprint, generatedOptions),
    [blueprint, generatedOptions],
  );
  const agentsMd = useMemo(
    () => buildAgentsMd(blueprint, scaffold || {}),
    [blueprint, scaffold],
  );

  const props = { blueprint, scaffold, isGenerating };

  // Estación fuera del modo: en su celda va la sugerencia de Dev-i
  const forStation = (stationId, widget) =>
    isStationInMode(stationId, blueprint?.mode) ? (
      widget
    ) : (
      <SuggestionWidget
        stationId={stationId}
        {...props}
        className={widget.props.className}
      />
    );

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full flex flex-col gap-5 sm:gap-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">
            Estación {stationNumberInMode(LAST_STEP, blueprint?.mode)} · ¡A Trabajar!
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Plano técnico de {blueprint?.selectedName || "tu proyecto"}
          </h2>
        </div>
        <TopBarControls />
      </div>

      {/* Leyenda de fases + acciones globales */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <ul className="flex flex-wrap gap-1.5">
          {Object.entries(PHASES).map(([id, p]) => (
            <li
              key={id}
              className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg border ${p.border} ${p.soft} text-[10px] sm:text-[11px] font-mono ${p.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
              {p.label}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap gap-1.5">
          <ActionButton
            icon={FileText}
            active={copied === "plan"}
            onClick={() => copy("plan", buildPlanMarkdown(blueprint, entries))}
          >
            {copied === "plan" ? "Plano copiado" : "Copiar plano"}
          </ActionButton>
          <ActionButton
            icon={Copy}
            active={copied === "agents"}
            onClick={() => copy("agents", agentsMd)}
          >
            {copied === "agents" ? "Copiado" : "Copiar AGENTS.md"}
          </ActionButton>
          <ActionButton
            icon={Download}
            onClick={() => downloadText("AGENTS.md", agentsMd)}
          >
            Descargar
          </ActionButton>
        </div>
      </div>
      {copied === "error" && (
        <p role="alert" className="text-xs text-red-400 -mt-2">
          Tu navegador no permitió copiar al portapapeles.
        </p>
      )}

      <PhaseBlock phase="definition" delay={0.05}>
        <HeroWidget {...props} className="md:col-span-6 lg:col-span-7" />
        <StatsWidget {...props} entries={entries} className="md:col-span-6 lg:col-span-5" />
        <SystemTypeWidget {...props} className="md:col-span-6 lg:col-span-4" />
        <RequirementsWidget {...props} className="md:col-span-6 lg:col-span-8" />
        {forStation(
          "user-stories",
          <StoriesWidget {...props} className="md:col-span-6 lg:col-span-12" />,
        )}
      </PhaseBlock>

      <PhaseBlock phase="technical" delay={0.12}>
        <StackWidget {...props} className="md:col-span-6 lg:col-span-6" />
        <DatabaseWidget {...props} className="md:col-span-3 lg:col-span-3" />
        {forStation(
          "architecture",
          <ArchitectureWidget {...props} className="md:col-span-3 lg:col-span-3" />,
        )}
        <DataModelWidget {...props} className="md:col-span-6 lg:col-span-7" />
        <FoldersWidget {...props} className="md:col-span-6 lg:col-span-5" />
        <WorkPlanWidget {...props} className="md:col-span-6 lg:col-span-12" />
      </PhaseBlock>

      <PhaseBlock phase="design" delay={0.19}>
        {forStation(
          "morphism",
          <StyleWidget {...props} className="md:col-span-6 lg:col-span-5" />,
        )}
        {forStation(
          "layout",
          <LayoutWidget {...props} className="md:col-span-6 lg:col-span-7" />,
        )}
        <DiagramsWidget {...props} className="md:col-span-6 lg:col-span-12" />
      </PhaseBlock>

      <PhaseBlock phase="delivery" delay={0.26}>
        {forStation(
          "deploy",
          <DeployWidget {...props} className="md:col-span-6 lg:col-span-5" />,
        )}
        {forStation(
          "ai-ecosystem",
          <AiKitWidget {...props} className="md:col-span-3 lg:col-span-3" />,
        )}
        <CommandsWidget
          {...props}
          className="md:col-span-3 lg:col-span-4"
          actions={
            scaffold?.commands?.length > 0 && (
              <ActionButton
                icon={Copy}
                active={copied === "commands"}
                onClick={() => copy("commands", scaffold.commands.join("\n"))}
              >
                {copied === "commands" ? "Copiado" : "Copiar"}
              </ActionButton>
            )
          }
        />
        <AgentsMdWidget
          markdown={agentsMd}
          className="md:col-span-6 lg:col-span-12"
          actions={
            <ActionButton
              icon={Download}
              onClick={() => downloadText("AGENTS.md", agentsMd)}
            >
              Descargar
            </ActionButton>
          }
        />
      </PhaseBlock>
    </motion.div>
  );
}
