"use client";

import { useState } from "react";
import {
  Boxes,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  ClipboardList,
  Database,
  File,
  Folder,
  GitBranch,
  LayoutTemplate,
  Network,
  Palette,
  Rocket,
  Sparkles,
  Table2,
  Terminal,
  Users,
  Workflow,
  Layers,
} from "lucide-react";
import {
  getStationById,
  MODES,
  PHASES,
  isStationInMode,
  resolveMode,
  stationNumberInMode,
} from "@/config/stations.config";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { SURFACES, SYSTEM_COMPLEMENTS } from "@/data/systemTypes";
import { getAiTool } from "@/data/aiTools";
import { TechIcon } from "@/components/ui/TechChip";
import {
  CostTierChip,
  DeployProviders,
} from "@/components/map/stations/DeployStation";
import { AiToolLogo } from "@/components/map/stations/AiEcosystemStation";
import { LayoutWireframe } from "@/components/map/stations/LayoutWireframe";
import { MermaidPreviewButton } from "@/components/map/stations/MermaidPreview";
import { describePreferences } from "@/data/devPreferences";
import { contextLabel } from "@/lib/planSummary";
import {
  PALETTE_ROLES,
  paletteGradient,
  paletteToCss,
  paletteToTailwind,
} from "@/lib/palettes";

/**
 * Widgets del blueprint final (estación "¡A Trabajar!"). Cada widget tiene su
 * propio color de acento (familia cálida para Definición, fría para Técnica,
 * violetas para Diseño y verdes para Entrega) y el punto de color de su fase.
 * Las clases van completas para que Tailwind las detecte.
 */
export const ACCENTS = {
  amber: {
    icon: "text-amber-300 bg-amber-500/10 border-amber-500/30",
    border: "border-amber-500/25",
    glow: "from-amber-500/[0.12]",
    chip: "bg-amber-500/10 border-amber-500/25 text-amber-200",
    text: "text-amber-300",
  },
  orange: {
    icon: "text-orange-300 bg-orange-500/10 border-orange-500/30",
    border: "border-orange-500/25",
    glow: "from-orange-500/[0.12]",
    chip: "bg-orange-500/10 border-orange-500/25 text-orange-200",
    text: "text-orange-300",
  },
  yellow: {
    icon: "text-yellow-300 bg-yellow-500/10 border-yellow-500/30",
    border: "border-yellow-500/25",
    glow: "from-yellow-500/[0.10]",
    chip: "bg-yellow-500/10 border-yellow-500/25 text-yellow-200",
    text: "text-yellow-300",
  },
  rose: {
    icon: "text-rose-300 bg-rose-500/10 border-rose-500/30",
    border: "border-rose-500/25",
    glow: "from-rose-500/[0.12]",
    chip: "bg-rose-500/10 border-rose-500/25 text-rose-200",
    text: "text-rose-300",
  },
  sky: {
    icon: "text-sky-300 bg-sky-500/10 border-sky-500/30",
    border: "border-sky-500/25",
    glow: "from-sky-500/[0.12]",
    chip: "bg-sky-500/10 border-sky-500/25 text-sky-200",
    text: "text-sky-300",
  },
  cyan: {
    icon: "text-cyan-300 bg-cyan-500/10 border-cyan-500/30",
    border: "border-cyan-500/25",
    glow: "from-cyan-500/[0.12]",
    chip: "bg-cyan-500/10 border-cyan-500/25 text-cyan-200",
    text: "text-cyan-300",
  },
  blue: {
    icon: "text-blue-300 bg-blue-500/10 border-blue-500/30",
    border: "border-blue-500/25",
    glow: "from-blue-500/[0.12]",
    chip: "bg-blue-500/10 border-blue-500/25 text-blue-200",
    text: "text-blue-300",
  },
  indigo: {
    icon: "text-indigo-300 bg-indigo-500/10 border-indigo-500/30",
    border: "border-indigo-500/25",
    glow: "from-indigo-500/[0.14]",
    chip: "bg-indigo-500/10 border-indigo-500/25 text-indigo-200",
    text: "text-indigo-300",
  },
  pink: {
    icon: "text-pink-300 bg-pink-500/10 border-pink-500/30",
    border: "border-pink-500/25",
    glow: "from-pink-500/[0.12]",
    chip: "bg-pink-500/10 border-pink-500/25 text-pink-200",
    text: "text-pink-300",
  },
  violet: {
    icon: "text-violet-300 bg-violet-500/10 border-violet-500/30",
    border: "border-violet-500/25",
    glow: "from-violet-500/[0.14]",
    chip: "bg-violet-500/10 border-violet-500/25 text-violet-200",
    text: "text-violet-300",
  },
  fuchsia: {
    icon: "text-fuchsia-300 bg-fuchsia-500/10 border-fuchsia-500/30",
    border: "border-fuchsia-500/25",
    glow: "from-fuchsia-500/[0.12]",
    chip: "bg-fuchsia-500/10 border-fuchsia-500/25 text-fuchsia-200",
    text: "text-fuchsia-300",
  },
  purple: {
    icon: "text-purple-300 bg-purple-500/10 border-purple-500/30",
    border: "border-purple-500/25",
    glow: "from-purple-500/[0.14]",
    chip: "bg-purple-500/10 border-purple-500/25 text-purple-200",
    text: "text-purple-300",
  },
  emerald: {
    icon: "text-emerald-300 bg-emerald-500/10 border-emerald-500/30",
    border: "border-emerald-500/25",
    glow: "from-emerald-500/[0.12]",
    chip: "bg-emerald-500/10 border-emerald-500/25 text-emerald-200",
    text: "text-emerald-300",
  },
  teal: {
    icon: "text-teal-300 bg-teal-500/10 border-teal-500/30",
    border: "border-teal-500/25",
    glow: "from-teal-500/[0.12]",
    chip: "bg-teal-500/10 border-teal-500/25 text-teal-200",
    text: "text-teal-300",
  },
  green: {
    icon: "text-green-300 bg-green-500/10 border-green-500/30",
    border: "border-green-500/25",
    glow: "from-green-500/[0.10]",
    chip: "bg-green-500/10 border-green-500/25 text-green-200",
    text: "text-green-300",
  },
  lime: {
    icon: "text-lime-300 bg-lime-500/10 border-lime-500/30",
    border: "border-lime-500/25",
    glow: "from-lime-500/[0.10]",
    chip: "bg-lime-500/10 border-lime-500/25 text-lime-200",
    text: "text-lime-300",
  },
};

const asList = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

// ---------- Piezas base ----------

/**
 * Celda del bento: borde y resplandor de su acento, ícono, etiqueta con el
 * punto de color de su fase y el número de estación de donde sale el dato.
 */
export function BentoCard({
  accent = "sky",
  icon: Icon,
  title,
  stationId,
  label,
  actions,
  className = "",
  children,
}) {
  const a = ACCENTS[accent] || ACCENTS.sky;
  const station = stationId ? getStationById(stationId) : null;
  // Número según el modo del mapa; fuera del modo, lo armó el cierre
  const mode = useDecisionStore((st) => st.blueprint.mode);
  const phase = station ? PHASES[station.phase] : null;

  return (
    <section
      className={`relative overflow-hidden rounded-2xl border ${a.border} bg-neutral-900/55 backdrop-blur-md p-4 sm:p-5 flex flex-col gap-3 min-w-0 ${className}`}
    >
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${a.glow} via-transparent to-transparent`}
      />
      {/* Con poco ancho, la etiqueta de la derecha baja a su propia línea */}
      <header className="relative flex flex-wrap items-start justify-between gap-x-2 gap-y-1.5">
        <div className="flex items-center gap-2.5 min-w-0 flex-1 basis-40">
          {Icon && (
            <span
              className={`w-8 h-8 shrink-0 rounded-lg border flex items-center justify-center ${a.icon}`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
            </span>
          )}
          <div className="min-w-0">
            <span className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              {phase && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${phase.dot}`}
                  title={`Fase: ${phase.label}`}
                />
              )}
              {label ||
                (!station
                  ? "Blueprint"
                  : isStationInMode(station, mode)
                    ? `Estación ${stationNumberInMode(station, mode)}`
                    : "Generado al cierre")}
            </span>
            <h3 className="text-sm font-semibold text-neutral-100 leading-snug break-words">
              {title}
            </h3>
          </div>
        </div>
        {actions && <div className="relative max-w-full">{actions}</div>}
      </header>
      <div className="relative flex-1 min-w-0">{children}</div>
    </section>
  );
}

function Chip({ accent, children, className = "" }) {
  const a = ACCENTS[accent] || ACCENTS.sky;
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[10px] sm:text-[11px] font-mono ${a.chip} ${className}`}
    >
      {children}
    </span>
  );
}

/** Estación omitida o sin decidir dentro de su celda. */
function EmptyNote({ children }) {
  return (
    <p className="text-[11px] sm:text-xs text-neutral-500 italic">{children}</p>
  );
}

/** Barras grises mientras el cierre se genera. */
function SkeletonLines({ rows = 4 }) {
  return (
    <div className="flex flex-col gap-2 animate-pulse" aria-hidden="true">
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-neutral-800/80"
          style={{ width: `${90 - ((i * 17) % 40)}%` }}
        />
      ))}
    </div>
  );
}

const Summary = ({ children }) =>
  children ? (
    <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed">
      {children}
    </p>
  ) : null;

// ---------- Definición ----------

export function HeroWidget({ blueprint, scaffold, isGenerating, className }) {
  const system = blueprint.selectedSystemType;
  return (
    <BentoCard
      accent="amber"
      icon={Sparkles}
      title={blueprint.selectedName || "Proyecto sin nombre"}
      stationId="naming"
      label="Tu proyecto"
      className={className}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm sm:text-base text-neutral-200 leading-relaxed">
          “{blueprint.idea || "Sin idea"}”
        </p>
        <div className="flex flex-wrap gap-1.5">
          <Chip accent="amber">{contextLabel(blueprint.context)}</Chip>
          {system?.title && <Chip accent="orange">{system.title}</Chip>}
          {scaffold?.projectName && (
            <Chip accent="lime">
              <Terminal className="w-3 h-3" aria-hidden="true" />
              {scaffold.projectName}
            </Chip>
          )}
        </div>
        {isGenerating && !scaffold ? (
          <SkeletonLines rows={2} />
        ) : (
          scaffold?.techSummary && (
            <p className="text-xs sm:text-[13px] text-neutral-300 leading-relaxed border-l-2 border-amber-500/40 pl-3">
              {scaffold.techSummary}
            </p>
          )
        )}
      </div>
    </BentoCard>
  );
}

export function StatsWidget({ blueprint, entries, className }) {
  const modules = asList(blueprint.selectedRequirements);
  const stories = asList(blueprint.selectedUserStories);
  const rf = modules.reduce((n, m) => n + asList(m.functional).length, 0);
  const rnf = modules.reduce((n, m) => n + asList(m.nonFunctional).length, 0);
  const points = stories.reduce((n, s) => n + (Number(s.points) || 0), 0);
  const decided = entries.filter((e) => e.status === "decided").length;

  const stats = [
    { value: `${decided}/${entries.length}`, label: "Estaciones", color: "text-emerald-300" },
    { value: modules.length, label: "Módulos", color: "text-yellow-300" },
    { value: rf, label: "Req. funcionales", color: "text-yellow-200" },
    { value: rnf, label: "No funcionales", color: "text-orange-300" },
    { value: stories.length, label: "Historias", color: "text-rose-300" },
    { value: points, label: "Puntos", color: "text-pink-300" },
  ];

  return (
    <BentoCard
      accent="emerald"
      icon={CheckCircle2}
      title="El plano en números"
      label="Resumen"
      className={className}
    >
      <dl className="grid grid-cols-3 gap-2">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-xl bg-neutral-950/60 border border-neutral-800/80 px-2 py-2.5 text-center"
          >
            <dd className={`text-lg sm:text-xl font-bold tabular-nums ${s.color}`}>
              {s.value}
            </dd>
            <dt className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wide text-neutral-500 leading-tight mt-0.5">
              {s.label}
            </dt>
          </div>
        ))}
      </dl>
    </BentoCard>
  );
}

export function SystemTypeWidget({ blueprint, className }) {
  const system = blueprint.selectedSystemType;
  const complements = (system?.complements || [])
    .map((id) => SYSTEM_COMPLEMENTS.find((c) => c.id === id)?.title)
    .filter(Boolean);
  return (
    <BentoCard
      accent="orange"
      icon={Layers}
      title={system?.title || "Tipo de sistema"}
      stationId="system-type"
      className={className}
    >
      {system ? (
        <div className="flex flex-col gap-2.5">
          <Summary>{system.summary}</Summary>
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-1.5">
              Partes del sistema
            </span>
            <div className="flex flex-wrap gap-1.5">
              {asList(system.surfaces).map((s) => (
                <Chip key={s} accent="orange">
                  {SURFACES[s] || s}
                </Chip>
              ))}
            </div>
          </div>
          {complements.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {complements.map((c) => (
                <Chip key={c} accent="amber">
                  + {c}
                </Chip>
              ))}
            </div>
          )}
        </div>
      ) : (
        <EmptyNote>Sin definir.</EmptyNote>
      )}
    </BentoCard>
  );
}

export function RequirementsWidget({ blueprint, className }) {
  const modules = asList(blueprint.selectedRequirements);
  return (
    <BentoCard
      accent="yellow"
      icon={ClipboardList}
      title="Requisitos del MVP"
      stationId="requirements"
      className={className}
    >
      {modules.length ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {modules.map((m) => (
            <details
              key={m.id || m.title}
              className="group rounded-xl bg-neutral-950/60 border border-neutral-800/80 px-3 py-2.5 open:border-yellow-500/30"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-2">
                <span className="text-xs font-semibold text-neutral-100 leading-snug">
                  {m.title}
                </span>
                <span className="shrink-0 flex gap-1">
                  <Chip accent="yellow">{asList(m.functional).length} RF</Chip>
                  <Chip accent="orange">{asList(m.nonFunctional).length} RNF</Chip>
                </span>
              </summary>
              <ul className="mt-2 space-y-1 text-[11px] text-neutral-300 leading-snug">
                {asList(m.functional).map((rf) => (
                  <li key={rf} className="flex gap-1.5">
                    <span className="text-yellow-400 font-mono shrink-0">RF</span>
                    {rf}
                  </li>
                ))}
                {asList(m.nonFunctional).map((rnf) => (
                  <li key={rnf} className="flex gap-1.5">
                    <span className="text-orange-400 font-mono shrink-0">RNF</span>
                    {rnf}
                  </li>
                ))}
              </ul>
            </details>
          ))}
        </div>
      ) : (
        <EmptyNote>Sin requisitos elegidos.</EmptyNote>
      )}
    </BentoCard>
  );
}

const MAX_STORIES = 6;

export function StoriesWidget({ blueprint, className }) {
  const stories = asList(blueprint.selectedUserStories);
  const points = stories.reduce((n, s) => n + (Number(s.points) || 0), 0);
  return (
    <BentoCard
      accent="rose"
      icon={Users}
      title="Historias de usuario"
      stationId="user-stories"
      actions={
        stories.length > 0 && <Chip accent="rose">{points} pts</Chip>
      }
      className={className}
    >
      {stories.length ? (
        <ul className="flex flex-col gap-1.5">
          {stories.slice(0, MAX_STORIES).map((s) => (
            <li
              key={s.id || s.title}
              className="flex items-start gap-2 rounded-lg bg-neutral-950/50 border border-neutral-800/70 px-2.5 py-1.5"
            >
              <span className="flex-1 text-[11px] text-neutral-300 leading-snug">
                Como <b className="text-rose-200 font-semibold">{s.role || "usuario"}</b>, quiero{" "}
                {s.action || s.title}
              </span>
              {s.points && (
                <span className="shrink-0 text-[10px] font-mono text-rose-300 tabular-nums">
                  {s.points}
                </span>
              )}
            </li>
          ))}
          {stories.length > MAX_STORIES && (
            <li className="text-[11px] font-mono text-neutral-500 pl-1">
              +{stories.length - MAX_STORIES} historias más en AGENTS.md
            </li>
          )}
        </ul>
      ) : (
        <EmptyNote>Estación omitida: sin backlog de historias.</EmptyNote>
      )}
    </BentoCard>
  );
}

// ---------- Técnica ----------

export function StackWidget({ blueprint, className }) {
  const stack = blueprint.selectedStack;
  const tags = asList(stack?.tags);
  return (
    <BentoCard
      accent="sky"
      icon={Boxes}
      title={stack?.title || "Stack"}
      stationId="stack"
      actions={
        stack?.selectedLanguage && (
          <Chip accent="sky">
            <TechIcon name={stack.selectedLanguage} size={11} />
            {stack.selectedLanguage}
          </Chip>
        )
      }
      className={className}
    >
      {stack ? (
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 xs:grid-cols-4 gap-2">
            {tags.map((tag) => (
              <div
                key={tag}
                className="rounded-xl bg-neutral-950/70 border border-neutral-800/80 px-2 py-3 flex flex-col items-center gap-1.5 text-center"
              >
                <span className="h-7 flex items-center justify-center">
                  <TechIcon name={tag} size={26} />
                </span>
                <span className="text-[10px] font-mono text-neutral-300 leading-tight">
                  {tag}
                </span>
              </div>
            ))}
          </div>
          <Summary>{stack.summary}</Summary>
        </div>
      ) : (
        <EmptyNote>Sin stack elegido.</EmptyNote>
      )}
    </BentoCard>
  );
}

/** Opción genérica de una estación (título, etiqueta, resumen y logos). */
function OptionWidget({ option, accent, icon, stationId, emptyText, className, children }) {
  return (
    <BentoCard
      accent={accent}
      icon={icon}
      title={option?.title || getStationById(stationId)?.title}
      stationId={stationId}
      actions={option?.tag && <Chip accent={accent}>{option.tag}</Chip>}
      className={className}
    >
      {option ? (
        <div className="flex flex-col gap-2.5">
          <Summary>{option.summary}</Summary>
          {asList(option.techs).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {asList(option.techs).map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-neutral-950/70 border border-neutral-800 text-[10px] font-mono text-neutral-300"
                >
                  <TechIcon name={t} size={11} />
                  {t}
                </span>
              ))}
            </div>
          )}
          {children}
        </div>
      ) : (
        <EmptyNote>{emptyText}</EmptyNote>
      )}
    </BentoCard>
  );
}

export function DatabaseWidget({ blueprint, className }) {
  return (
    <OptionWidget
      option={blueprint.selectedDatabase}
      accent="cyan"
      icon={Database}
      stationId="database"
      emptyText="Sin base de datos."
      className={className}
    >
      {blueprint.selectedDatabase?.adminToolLabel && (
        <p className="text-[11px] text-neutral-400">
          Administrador:{" "}
          <b className="text-neutral-200">{blueprint.selectedDatabase.adminToolLabel}</b>
        </p>
      )}
    </OptionWidget>
  );
}

export function ArchitectureWidget({ blueprint, className }) {
  const arch = blueprint.selectedArchitecture;
  return (
    <OptionWidget
      option={arch}
      accent="indigo"
      icon={Network}
      stationId="architecture"
      emptyText="Sin arquitectura elegida."
      className={className}
    >
      {arch?.beginnerTip && (
        <p className="text-[11px] text-indigo-200/80 leading-snug">
          💡 {arch.beginnerTip}
        </p>
      )}
    </OptionWidget>
  );
}

export function DataModelWidget({ scaffold, isGenerating, className }) {
  const entities = asList(scaffold?.entities);
  return (
    <BentoCard
      accent="blue"
      icon={Table2}
      title="Modelo de datos"
      label="Generado al cierre"
      className={className}
    >
      {isGenerating && !scaffold ? (
        <SkeletonLines rows={5} />
      ) : entities.length ? (
        <div className="grid grid-cols-1 xs:grid-cols-2 gap-2">
          {entities.map((e) => (
            <div
              key={e.name}
              className="rounded-xl bg-neutral-950/70 border border-blue-500/20 overflow-hidden"
            >
              <div className="px-2.5 py-1.5 bg-blue-500/10 border-b border-blue-500/20 text-[11px] font-mono font-semibold text-blue-200">
                {e.name}
              </div>
              <ul className="px-2.5 py-1.5 space-y-0.5">
                {asList(e.fields).map((f) => (
                  <li
                    key={f}
                    className={`text-[10px] font-mono leading-snug ${
                      /\bPK\b/.test(f)
                        ? "text-amber-300"
                        : /\bFK\b/.test(f)
                          ? "text-sky-300"
                          : "text-neutral-400"
                    }`}
                  >
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <EmptyNote>Sin entidades (proyecto sin base de datos o plano anterior).</EmptyNote>
      )}
    </BentoCard>
  );
}

/** Árbol de carpetas con sangría por nivel. */
export function FoldersWidget({ scaffold, isGenerating, className }) {
  const folders = asList(scaffold?.folders);
  // Profundidad relativa: si todo cuelga de "src/", "src/app/" queda en el nivel 0
  const depthOf = (path) =>
    Math.max(path.replace(/^\.?\//, "").replace(/\/$/, "").split("/").length - 1, 0);
  const minDepth = folders.length ? Math.min(...folders.map((f) => depthOf(f.path))) : 0;
  return (
    <BentoCard
      accent="green"
      icon={Folder}
      title="Estructura de carpetas"
      label="Generado al cierre"
      className={className}
    >
      {isGenerating && !scaffold ? (
        <SkeletonLines rows={6} />
      ) : folders.length ? (
        <ul className="rounded-xl bg-neutral-950/70 border border-neutral-800/80 p-2.5 font-mono text-[11px] space-y-1 overflow-x-auto">
          {folders.map((f) => {
            const clean = f.path.replace(/^\.?\//, "");
            const isDir = clean.endsWith("/");
            const depth = depthOf(f.path) - minDepth;
            const name = clean.replace(/\/$/, "").split("/").pop();
            const ItemIcon = isDir ? Folder : File;
            return (
              <li
                key={f.path}
                className="flex items-start gap-1.5 min-w-max"
                style={{ paddingLeft: depth * 14 }}
              >
                <ItemIcon
                  className={`w-3.5 h-3.5 shrink-0 mt-px ${isDir ? "text-green-400" : "text-neutral-500"}`}
                  aria-hidden="true"
                />
                <span className={isDir ? "text-green-200" : "text-neutral-300"}>
                  {name}
                  {isDir ? "/" : ""}
                </span>
                {f.purpose && (
                  <span className="text-neutral-500"># {f.purpose}</span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyNote>Sin estructura generada.</EmptyNote>
      )}
    </BentoCard>
  );
}

export function WorkPlanWidget({ blueprint, scaffold, isGenerating, className }) {
  const method = blueprint.selectedMethodology;
  const milestones = asList(scaffold?.milestones);
  return (
    <BentoCard
      accent="pink"
      icon={CalendarRange}
      title={method?.title ? `Plan de trabajo · ${method.title}` : "Plan de trabajo"}
      stationId="methodology"
      className={className}
    >
      {isGenerating && !scaffold ? (
        <SkeletonLines rows={5} />
      ) : milestones.length ? (
        <ol className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-2">
          {milestones.map((m, i) => (
            <li
              key={m.title}
              className="relative rounded-xl bg-neutral-950/60 border border-pink-500/20 px-3 py-2.5 flex flex-col gap-1.5"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500/15 border border-pink-500/40 text-pink-200 text-[10px] font-mono flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="text-xs font-semibold text-neutral-100 leading-tight">
                  {m.title}
                </span>
              </span>
              {m.goal && (
                <p className="text-[11px] text-pink-100/70 leading-snug">{m.goal}</p>
              )}
              <ul className="space-y-0.5">
                {asList(m.tasks).map((t) => (
                  <li key={t} className="flex gap-1.5 text-[10px] text-neutral-400 leading-snug">
                    <span className="text-pink-400">▢</span>
                    {t}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      ) : (
        <Summary>
          {method?.summary || "Sin metodología: avanza por entregas cortas y visibles."}
        </Summary>
      )}
    </BentoCard>
  );
}

// ---------- Diseño ----------

/** Quita los "\n" literales que a veces devuelve el modelo. */
const cleanMermaid = (source) =>
  String(source || "").replace(/\\n/g, "\n").trim();

export function DiagramsWidget({ blueprint, scaffold, isGenerating, className }) {
  const chosen = asList(blueprint.selectedDiagrams);
  const fromScaffold = asList(scaffold?.diagrams);
  // Código del cierre (completo) o, mientras tanto, el ejemplo de la carta
  // Sin diagramas elegidos (modo que omite la estación): los que sugirió el cierre
  const isSuggested = chosen.length === 0;
  const base = isSuggested ? fromScaffold : chosen;
  const diagrams = base.map((d, i) => {
    const full =
      fromScaffold.find((s) => s.id && s.id === d.id) ||
      fromScaffold.find((s) => s.diagramType && s.diagramType === d.diagramType) ||
      fromScaffold[i];
    return {
      key: d.id || `${d.title}-${i}`,
      title: d.title,
      category: isSuggested ? "Sugerido" : d.category,
      mermaid: cleanMermaid(full?.mermaid || d.sampleMermaid),
      isSample: !full?.mermaid || full.isSample,
    };
  });
  const [openKey, setOpenKey] = useState(null);
  const { copied, copy } = useCopyKey();

  return (
    <BentoCard
      accent="violet"
      icon={Workflow}
      title="Diagramas"
      label={diagrams.length ? "Toca uno para ver su código Mermaid" : undefined}
      stationId="diagrams"
      className={className}
    >
      {diagrams.length ? (
        <ul className="flex flex-col gap-1.5">
          {diagrams.map((d) => {
            const isOpen = openKey === d.key;
            return (
              <li
                key={d.key}
                className={`rounded-xl border transition-colors ${
                  isOpen
                    ? "bg-neutral-950/80 border-violet-500/40"
                    : "bg-neutral-950/50 border-neutral-800/70"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenKey(isOpen ? null : d.key)}
                  aria-expanded={isOpen}
                  className="w-full flex items-center justify-between gap-2 px-2.5 py-2 text-left cursor-pointer"
                >
                  <span className="min-w-0 flex items-center gap-2">
                    <ChevronDown
                      className={`w-3.5 h-3.5 shrink-0 text-violet-300 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                    <span className="text-[11px] sm:text-xs text-neutral-200 truncate">
                      {d.title}
                    </span>
                  </span>
                  {d.category && <Chip accent="violet">{d.category}</Chip>}
                </button>

                {isOpen && (
                  <div className="px-2.5 pb-2.5 flex flex-col gap-2">
                    {d.mermaid ? (
                      <>
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <span className="text-[10px] font-mono text-neutral-500">
                            {isGenerating && d.isSample
                              ? "Generando la versión completa…"
                              : d.isSample
                                ? "Ejemplo base de la estación Diagramas"
                                : "Código recomendado para tu proyecto"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => copy(d.key, d.mermaid)}
                              className="flex items-center gap-1 px-2 py-1 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 text-[10px] font-mono text-neutral-300 cursor-pointer"
                            >
                              {copied === d.key ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              {copied === d.key ? "Copiado" : "Copiar"}
                            </button>
                            <span>
                              <MermaidPreviewButton
                                title={d.title}
                                source={d.mermaid}
                                label="Ver dibujado"
                              />
                            </span>
                          </span>
                        </div>
                        <pre className="max-h-72 overflow-auto rounded-xl bg-neutral-950 border border-neutral-800 p-3 font-mono text-[10px] sm:text-[11px] text-sky-300 whitespace-pre">
                          {d.mermaid}
                        </pre>
                        <span className="text-[10px] text-neutral-500">
                          Pégalo en mermaid.live, en tu README o en un bloque
                          ```mermaid de GitHub para verlo dibujado.
                        </span>
                      </>
                    ) : (
                      <EmptyNote>Este diagrama no trae código todavía.</EmptyNote>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <EmptyNote>Sin diagramas elegidos.</EmptyNote>
      )}
    </BentoCard>
  );
}

/** Copiar al portapapeles con aviso "Copiado" por clave. */
function useCopyKey() {
  const [copied, setCopied] = useState(null);
  const copy = async (key, text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      setTimeout(() => setCopied((k) => (k === key ? null : k)), 1500);
    } catch {
      setCopied(null);
    }
  };
  return { copied, copy };
}

/** Muestra de color aproximada de cada lenguaje visual. */
const STYLE_SWATCHES = [
  ["aurora", "bg-gradient-to-br from-teal-400 via-sky-500 to-indigo-600"],
  ["mesh", "bg-gradient-to-br from-teal-400 via-sky-500 to-indigo-600"],
  ["glass", "bg-gradient-to-br from-sky-300/60 via-white/20 to-violet-400/60"],
  ["brutal", "bg-yellow-300 [box-shadow:inset_-6px_-6px_0_#000]"],
  ["cyber", "bg-gradient-to-br from-fuchsia-600 via-neutral-950 to-cyan-400"],
  ["neon", "bg-gradient-to-br from-fuchsia-600 via-neutral-950 to-cyan-400"],
  ["clay", "bg-gradient-to-br from-rose-200 via-orange-200 to-violet-200"],
  ["neumorph", "bg-neutral-300 [box-shadow:inset_6px_6px_12px_#a3a3a3,inset_-6px_-6px_12px_#fff]"],
  ["skeuo", "bg-gradient-to-b from-amber-200 via-amber-600 to-amber-900"],
  ["terminal", "bg-neutral-950 [background-image:repeating-linear-gradient(0deg,rgba(74,222,128,.25)_0_1px,transparent_1px_6px)]"],
  ["paper", "bg-gradient-to-br from-stone-100 via-stone-200 to-stone-300"],
];

function styleSwatch(style) {
  const key = `${style?.styleKey || ""} ${style?.title || ""}`.toLowerCase();
  return (
    STYLE_SWATCHES.find(([k]) => key.includes(k))?.[1] ||
    "bg-gradient-to-br from-neutral-100 via-neutral-300 to-neutral-500"
  );
}

/** Botón chico de copiar con confirmación. */
function CopyChip({ text, children }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          // Portapapeles bloqueado: no hay nada que hacer
        }
      }}
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-md border text-[10px] font-mono transition-colors cursor-pointer ${
        done
          ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
          : "border-neutral-800 bg-neutral-950/70 text-neutral-300 hover:text-white hover:bg-neutral-800"
      }`}
    >
      {done ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {done ? "Copiado" : children}
    </button>
  );
}

export function StyleWidget({ blueprint, className }) {
  const style = blueprint.selectedStyle;
  const palette = style?.palette?.primary ? style.palette : null;
  return (
    <BentoCard
      accent="fuchsia"
      icon={Palette}
      title={style?.title || "Estilo visual"}
      stationId="morphism"
      className={className}
    >
      {style ? (
        <div className="flex flex-col gap-2.5">
          {palette ? (
            <>
              <div
                className="h-14 rounded-xl border border-white/10 flex items-end p-2"
                style={{ backgroundImage: paletteGradient(palette) }}
              >
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: palette.background, color: palette.text }}
                >
                  {palette.name}
                </span>
              </div>
              <ul className="grid grid-cols-5 gap-1">
                {PALETTE_ROLES.map(({ key, label }) => (
                  <li key={key} className="flex flex-col items-center gap-1 min-w-0">
                    <span
                      className="w-full h-6 rounded-md border border-white/10"
                      style={{ backgroundColor: palette[key] }}
                    />
                    <span className="text-[8px] font-mono uppercase text-neutral-500 truncate max-w-full">
                      {label}
                    </span>
                    <span className="text-[8px] font-mono text-neutral-400">
                      {palette[key]}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-1.5">
                <CopyChip text={paletteToCss(palette)}>CSS</CopyChip>
                <CopyChip text={paletteToTailwind(palette)}>Tailwind</CopyChip>
              </div>
            </>
          ) : (
            <div
              className={`h-16 rounded-xl border border-white/10 ${styleSwatch(style)}`}
              aria-hidden="true"
            />
          )}
          <Summary>{style.summary}</Summary>
        </div>
      ) : (
        <EmptyNote>Sin estilo elegido.</EmptyNote>
      )}
    </BentoCard>
  );
}

export function LayoutWidget({ blueprint, className }) {
  const selections = asList(blueprint.selectedLayout?.selections);
  return (
    <BentoCard
      accent="purple"
      icon={LayoutTemplate}
      title="Layout por pantalla"
      stationId="layout"
      className={className}
    >
      {selections.length ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {selections.map((s) => (
            <figure
              key={s.surface}
              className="rounded-xl bg-neutral-950/70 border border-purple-500/20 p-2 flex flex-col gap-1.5"
            >
              <LayoutWireframe
                id={s.layoutId}
                className="w-full h-auto text-purple-300/80"
              />
              <figcaption className="text-center leading-tight">
                <span className="block text-[9px] font-mono uppercase tracking-wide text-purple-300/80">
                  {s.surfaceTitle}
                </span>
                <span className="block text-[10px] text-neutral-200">{s.layoutTitle}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      ) : (
        <EmptyNote>Sin layout elegido.</EmptyNote>
      )}
    </BentoCard>
  );
}

// ---------- Entrega ----------

export function DeployWidget({ blueprint, className }) {
  const deploy = blueprint.selectedDeploy;
  return (
    <BentoCard
      accent="emerald"
      icon={Rocket}
      title={deploy?.title || "Deploy"}
      stationId="deploy"
      actions={
        (deploy?.cost || deploy?.costTier) && (
          <span className="flex items-center gap-1.5">
            <CostTierChip tier={deploy.costTier} />
            {deploy.cost && <Chip accent="emerald">{deploy.cost}</Chip>}
          </span>
        )
      }
      className={className}
    >
      {deploy ? (
        <div className="flex flex-col gap-1">
          <DeployProviders providers={asList(deploy.providers)} />
          <ol className="space-y-1">
            {asList(deploy.steps).map((step, i) => (
              <li key={step} className="flex items-start gap-2 text-[11px] text-neutral-300 leading-snug">
                <span className="w-4 h-4 rounded-full bg-emerald-950/60 border border-emerald-800/70 text-emerald-300 text-[9px] font-mono flex items-center justify-center shrink-0 mt-px">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <EmptyNote>Sin plan de deploy.</EmptyNote>
      )}
    </BentoCard>
  );
}

export function AiKitWidget({ blueprint, className }) {
  const tools = asList(blueprint.selectedAiEcosystem)
    .map((t) => getAiTool(t?.id))
    .filter(Boolean);
  return (
    <BentoCard
      accent="teal"
      icon={Sparkles}
      title="Kit de IA"
      stationId="ai-ecosystem"
      className={className}
    >
      {tools.length ? (
        <div className="grid grid-cols-3 gap-2">
          {tools.map((tool) => (
            <a
              key={tool.id}
              href={tool.url}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl bg-neutral-950/70 border border-neutral-800/80 hover:border-teal-500/40 px-1.5 py-2.5 flex flex-col items-center gap-1.5 text-center transition-colors"
            >
              <AiToolLogo tool={tool} size={22} />
              <span className="text-[10px] text-neutral-200 leading-tight">{tool.name}</span>
            </a>
          ))}
        </div>
      ) : (
        <EmptyNote>Sin kit de IA: también se puede programar a mano.</EmptyNote>
      )}
    </BentoCard>
  );
}

export function CommandsWidget({ blueprint, scaffold, isGenerating, actions, className }) {
  const commands = asList(scaffold?.commands);
  const environment = describePreferences(blueprint?.selectedStack?.preferences);
  return (
    <BentoCard
      accent="lime"
      icon={Terminal}
      title="Primeros comandos"
      label="Generado al cierre"
      actions={actions}
      className={className}
    >
      {environment && (
        <p className="text-[10px] sm:text-[11px] text-neutral-500 mb-2 leading-relaxed">
          Tu entorno: {environment}
        </p>
      )}
      {isGenerating && !scaffold ? (
        <SkeletonLines rows={4} />
      ) : (
        <ol className="rounded-xl bg-neutral-950 border border-neutral-800 p-3 font-mono text-[11px] space-y-1.5 overflow-x-auto">
          {commands.map((cmd, i) => (
            <li key={`${i}-${cmd}`} className="flex gap-2 min-w-max">
              <span className="text-neutral-600 select-none tabular-nums">{i + 1}</span>
              <span className="text-lime-400 select-none">$</span>
              <span className="text-neutral-200">{cmd}</span>
            </li>
          ))}
        </ol>
      )}
    </BentoCard>
  );
}

export function AgentsMdWidget({ markdown, actions, className }) {
  return (
    <BentoCard
      accent="teal"
      icon={GitBranch}
      title="AGENTS.md"
      label="Contexto para tu agente de IA"
      actions={actions}
      className={className}
    >
      <p className="text-[11px] sm:text-xs text-neutral-400 mb-2.5 leading-relaxed">
        Guárdalo en la raíz del repositorio: Claude Code, Codex, OpenCode y Cursor
        lo leen para programar respetando todas tus decisiones.
      </p>
      <pre className="max-h-72 overflow-auto rounded-xl bg-neutral-950 border border-neutral-800 p-3 font-mono text-[10px] sm:text-[11px] text-neutral-300 whitespace-pre-wrap break-words">
        {markdown}
      </pre>
    </BentoCard>
  );
}


// ---------- Estaciones fuera del modo ----------

/** Acento e ícono del widget al que reemplaza cada sugerencia. */
const SUGGESTION_META = {
  "user-stories": { accent: "rose", icon: Users },
  architecture: { accent: "indigo", icon: Network },
  morphism: { accent: "fuchsia", icon: Palette },
  layout: { accent: "purple", icon: LayoutTemplate },
  deploy: { accent: "emerald", icon: Rocket },
  "ai-ecosystem": { accent: "teal", icon: Sparkles },
};

/**
 * Celda de una estación que el modo omitió: muestra la sugerencia del cierre
 * ("Sugerido por Dev-i") en el mismo lugar del widget, así el bento no queda
 * con huecos y el usuario ve qué haría Dev-i.
 */
export function SuggestionWidget({ stationId, blueprint, scaffold, isGenerating, className }) {
  const station = getStationById(stationId);
  const meta = SUGGESTION_META[stationId] || { accent: "sky", icon: Sparkles };
  const suggestion = asList(scaffold?.suggestions).find((s) => s.stationId === stationId);
  const modeLabel = MODES[resolveMode(blueprint?.mode)].label;
  return (
    <BentoCard
      accent={meta.accent}
      icon={meta.icon}
      title={suggestion?.title || station?.title}
      stationId={stationId}
      label={`Fuera del modo ${modeLabel}`}
      actions={<Chip accent={meta.accent}>Sugerido por Dev-i</Chip>}
      className={className}
    >
      {isGenerating && !scaffold ? (
        <SkeletonLines rows={2} />
      ) : suggestion ? (
        <Summary>{suggestion.detail}</Summary>
      ) : (
        <EmptyNote>
          No pasaste por {station?.title} en el modo {modeLabel}. Puedes decidirlo
          cuando empieces a construir.
        </EmptyNote>
      )}
    </BentoCard>
  );
}
