"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { requestStepGeneration } from "@/services/projectService";
import { isStepLocked } from "@/hooks/useStationNavigation";
import { getLevelStyle } from "./levelStyles";
import { StationShell } from "./StationShell";
import {
  Check,
  ListChecks,
  Plus,
  RefreshCw,
  Sparkles,
  Table2,
} from "lucide-react";

/** Historias que se piden en cada "Generar más". */
const MORE_COUNT = 5;

/** Alto fijo del backlog: el pie de la estación nunca se desplaza. */
const TABLE_HEIGHT = "h-[clamp(280px,calc(100dvh-500px),520px)]";

const storyText = (s) =>
  `Como ${s.role}, quiero ${s.action}${s.benefit ? `, para ${s.benefit}` : ""}.`;

const escapeCell = (text) => String(text || "").replace(/\|/g, "\\|");

/** Tabla Markdown (se pega tal cual en un README, issue o wiki de GitHub). */
function toMarkdownTable(stories, levelLabelOf) {
  const header =
    "| # | Historia | Criterios de aceptación | Prioridad | Puntos | Módulo |\n|---|---|---|---|---|---|";
  const rows = stories.map(
    (s, i) =>
      `| ${i + 1} | **${escapeCell(s.title)}**<br>${escapeCell(storyText(s))} | ${s.acceptanceCriteria
        .map((c) => `• ${escapeCell(c)}`)
        .join("<br>")} | ${levelLabelOf(s.level)} | ${s.points || "-"} | ${escapeCell(s.tag)} |`,
  );
  return [header, ...rows].join("\n");
}

/**
 * Lista de tareas: pegada en un issue o en un item de GitHub Projects, cada
 * historia queda como tarea marcable y sus criterios como sub-tareas.
 */
function toChecklist(stories) {
  return stories
    .map(
      (s) =>
        `- [ ] **${s.title}**${s.points ? ` (${s.points} pts)` : ""}: ${storyText(s)}\n${s.acceptanceCriteria
          .map((c) => `  - [ ] ${c}`)
          .join("\n")}`,
    )
    .join("\n");
}

/**
 * Estación 3: historias de usuario como BACKLOG en tabla (no cartas).
 * Se marcan con check, se pueden generar más por categoría y copiar para
 * GitHub Projects. Se piden 10 al inicio y 5 más por cada "Generar más".
 */
export function UserStoriesStation({ station, data, onNext, onGenerate }) {
  const { stepNumber, blueprintKey, optionsKey, legend } = station;

  const saved = useDecisionStore((s) => s.blueprint[blueprintKey]);
  const requirements = useDecisionStore(
    (s) => s.blueprint.selectedRequirements,
  );
  const updateBlueprint = useDecisionStore((s) => s.updateBlueprint);
  const setStepOptions = useDecisionStore((s) => s.setStepOptions);
  const setCompanion = useDecisionStore((s) => s.setCompanion);
  const isLoading = useDecisionStore((s) => s.isLoading);
  const isLocked = useDecisionStore((s) => isStepLocked(s, stepNumber));

  const stories = data?.[optionsKey] || [];
  const levelLabelOf = (level) => legend?.[level] || level;

  // `null` = sin tocar: la selección se deriva de lo guardado
  const [pickedIds, setPickedIds] = useState(null);
  const savedIds = new Set((Array.isArray(saved) ? saved : []).map((s) => s.id));
  const selectedIds =
    pickedIds ?? new Set(stories.filter((s) => savedIds.has(s.id)).map((s) => s.id));
  const selected = stories.filter((s) => selectedIds.has(s.id));

  const [focus, setFocus] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState(null);
  const [newIds, setNewIds] = useState(() => new Set());
  const [copied, setCopied] = useState(null);
  const abortRef = useRef(null);
  const tableRef = useRef(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // Categorías sugeridas: módulos elegidos en Requisitos + las ya usadas
  const categories = [
    ...new Set(
      [
        ...(Array.isArray(requirements) ? requirements.map((r) => r.title) : []),
        ...stories.map((s) => s.tag),
      ].filter(Boolean),
    ),
  ];

  // Actualización funcional: varios clics seguidos nunca pierden una marca
  const toggle = (story) => {
    if (isLocked) return;
    setPickedIds((prev) => {
      const next = new Set(prev ?? selectedIds);
      if (next.has(story.id)) next.delete(story.id);
      else next.add(story.id);
      return next;
    });
  };

  const allSelected = stories.length > 0 && selected.length === stories.length;
  const toggleAll = () => {
    if (isLocked) return;
    setPickedIds(allSelected ? new Set() : new Set(stories.map((s) => s.id)));
  };

  const handleGenerateMore = async () => {
    if (isGenerating || isLocked) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setIsGenerating(true);
    setGenError(null);
    try {
      const { isTestProject, testFixture } = useDecisionStore.getState();
      let generated;
      if (isTestProject) {
        // Modo prueba: carga simulada de 5 s y repite historias de prueba (sin IA)
        await new Promise((resolve, reject) => {
          const timer = setTimeout(resolve, 5000);
          controller.signal.addEventListener("abort", () => {
            clearTimeout(timer);
            reject(new DOMException("Simulación cancelada", "AbortError"));
          });
        });
        generated = (testFixture?.[station.id]?.[optionsKey] || []).slice(
          0,
          MORE_COUNT,
        );
      } else {
        const latest = useDecisionStore.getState();
        const result = await requestStepGeneration({
          stepId: station.id,
          blueprint: latest.blueprint,
          ideaRunId: latest.ideaRunId,
          signal: controller.signal,
          extras: {
            count: MORE_COUNT,
            focus: focus.trim() || undefined,
            exclude: stories.map((s) => s.title),
          },
        });
        generated = result?.[optionsKey] || [];
      }

      // Ids nuevos garantizados únicos frente a los ya existentes
      const stamp = Date.now().toString(36);
      const fresh = generated.map((s, i) => ({
        ...s,
        id: `story-${stamp}-${i + 1}`,
      }));
      const current =
        useDecisionStore.getState().generatedOptions[station.id] || data || {};
      setStepOptions(station.id, {
        ...current,
        [optionsKey]: [...(current[optionsKey] || []), ...fresh],
      });
      setNewIds(new Set(fresh.map((s) => s.id)));
      setCompanion(
        "happy",
        `Sumé ${fresh.length} historias${focus.trim() ? ` de "${focus.trim()}"` : ""}. Marca las que quieras llevar a tu backlog.`,
      );
      // Muestra las nuevas filas al final de la tabla
      requestAnimationFrame(() =>
        tableRef.current?.scrollTo({
          top: tableRef.current.scrollHeight,
          behavior: "smooth",
        }),
      );
    } catch (err) {
      if (err.name !== "AbortError") setGenError(err.message);
    } finally {
      if (abortRef.current === controller) abortRef.current = null;
      setIsGenerating(false);
    }
  };

  const copy = async (kind) => {
    const list = selected.length ? selected : stories;
    const text =
      kind === "markdown" ? toMarkdownTable(list, levelLabelOf) : toChecklist(list);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setGenError("Tu navegador no permitió copiar al portapapeles.");
    }
  };

  const handleConfirm = () => {
    if (!selected.length) return;
    updateBlueprint({ [blueprintKey]: selected });
    onNext({ [blueprintKey]: selected });
  };

  const handleSkip = () => {
    updateBlueprint({ [blueprintKey]: [] });
    onNext({ [blueprintKey]: [] });
  };

  const isInitialLoading = isLoading && stories.length === 0;

  return (
    <StationShell
      station={station}
      onSkip={handleSkip}
      confirmLabel={`Confirmar ${selected.length || ""} ${selected.length === 1 ? "historia" : "historias"}`.replace(
        "  ",
        " ",
      )}
      onConfirm={handleConfirm}
      confirmDisabled={!selected.length}
      selectionSummary={
        stories.length ? `${selected.length} de ${stories.length} elegidas` : null
      }
      rewriteTitle="¿Cambiar tus historias de usuario?"
      rewriteDescription="Se desbloqueará el backlog. El stack y todo lo calculado después se descartarán."
    >
      {/* Barra del backlog: copiar + generar más por categoría */}
      {stories.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => copy("checklist")}
              title="Pega en un issue o item de GitHub Projects: cada historia queda como tarea"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/70 text-[11px] font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {copied === "checklist" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <ListChecks className="w-3.5 h-3.5" />
              )}
              {copied === "checklist" ? "¡Copiado!" : "Copiar como tareas"}
            </button>
            <button
              type="button"
              onClick={() => copy("markdown")}
              title="Tabla en Markdown para README, wiki o documentación"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/70 text-[11px] font-mono text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
            >
              {copied === "markdown" ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Table2 className="w-3.5 h-3.5" />
              )}
              {copied === "markdown" ? "¡Copiado!" : "Copiar tabla"}
            </button>
            <span className="text-[10px] font-mono text-neutral-600 hidden sm:inline">
              {selected.length ? "(solo las marcadas)" : "(todas)"}
            </span>
          </div>

          {!isLocked && (
            <div className="lg:ml-auto flex items-center gap-1.5">
              <input
                list="story-categories"
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                placeholder="Categoría (opcional)"
                maxLength={80}
                disabled={isGenerating}
                aria-label="Categoría de las nuevas historias"
                className="flex-1 lg:w-52 min-w-0 px-2.5 py-1.5 rounded-lg bg-neutral-950 border border-neutral-800 text-[11px] text-neutral-200 placeholder-neutral-600 outline-none focus:border-neutral-600 font-mono"
              />
              <datalist id="story-categories">
                {categories.map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
              <button
                type="button"
                onClick={handleGenerateMore}
                disabled={isGenerating}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-neutral-950 hover:bg-neutral-200 text-[11px] font-medium transition-colors cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                {isGenerating ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Plus className="w-3.5 h-3.5" />
                )}
                {isGenerating ? "Generando..." : `Generar ${MORE_COUNT} más`}
              </button>
            </div>
          )}
        </div>
      )}

      {genError && (
        <p className="text-[11px] font-mono text-red-300 -mt-1">{genError}</p>
      )}

      {/* Backlog */}
      <div
        ref={tableRef}
        className={`${TABLE_HEIGHT} w-full overflow-auto scrollbar-thin rounded-2xl border border-neutral-800 bg-neutral-950/80`}
      >
        {isInitialLoading ? (
          <TableSkeleton />
        ) : stories.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center p-6 text-xs font-mono text-neutral-500">
            <span>
              {data?.skipped
                ? "Omitiste esta estación."
                : "Todavía no hay historias de usuario."}
            </span>
            {onGenerate && !isLocked && (
              <button
                type="button"
                onClick={onGenerate}
                className="px-4 py-2 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-sans font-medium transition-colors cursor-pointer"
              >
                Generar historias con IA
              </button>
            )}
          </div>
        ) : (
          <>
            {/* Escritorio / tablet: tabla */}
            <table className="hidden md:table w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-neutral-900">
                <tr className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                  <th className="w-10 px-3 py-2.5">
                    <CheckBox
                      checked={allSelected}
                      partial={selected.length > 0 && !allSelected}
                      disabled={isLocked}
                      onClick={toggleAll}
                      label="Marcar todas"
                    />
                  </th>
                  <th className="px-2 py-2.5 w-[38%]">Historia de usuario</th>
                  <th className="px-2 py-2.5">Criterios de aceptación</th>
                  <th className="px-2 py-2.5 w-24">Prioridad</th>
                  <th className="px-2 py-2.5 w-12 text-center">Pts</th>
                </tr>
              </thead>
              <tbody>
                {stories.map((s) => (
                  <StoryRow
                    key={s.id}
                    story={s}
                    isSelected={selectedIds.has(s.id)}
                    isNew={newIds.has(s.id)}
                    isLocked={isLocked}
                    levelLabel={levelLabelOf(s.level)}
                    onToggle={() => toggle(s)}
                  />
                ))}
                {isGenerating && <GeneratingRow />}
              </tbody>
            </table>

            {/* Móvil: filas apiladas */}
            <div className="md:hidden flex flex-col divide-y divide-neutral-800/80">
              <button
                type="button"
                onClick={toggleAll}
                disabled={isLocked}
                className="sticky top-0 z-10 bg-neutral-900 flex items-center gap-2 px-3 py-2 text-[10px] font-mono uppercase tracking-wider text-neutral-400 cursor-pointer disabled:cursor-default"
              >
                <CheckBox
                  as="span"
                  checked={allSelected}
                  partial={selected.length > 0 && !allSelected}
                  disabled={isLocked}
                />
                {allSelected ? "Desmarcar todas" : "Marcar todas"}
              </button>
              {stories.map((s) => (
                <StoryCard
                  key={s.id}
                  story={s}
                  isSelected={selectedIds.has(s.id)}
                  isNew={newIds.has(s.id)}
                  isLocked={isLocked}
                  levelLabel={levelLabelOf(s.level)}
                  onToggle={() => toggle(s)}
                />
              ))}
              {isGenerating && (
                <div className="px-3 py-4 flex items-center gap-2 text-[11px] font-mono text-neutral-500">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  Escribiendo {MORE_COUNT} historias más...
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </StationShell>
  );
}

function CheckBox({ checked, partial = false, disabled, onClick, label, as = "button" }) {
  const Tag = as;
  return (
    <Tag
      {...(as === "button"
        ? { type: "button", onClick, disabled, "aria-label": label }
        : {})}
      role="checkbox"
      aria-checked={partial ? "mixed" : checked}
      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
        checked || partial
          ? "bg-emerald-400 border-emerald-400 text-neutral-950"
          : "border-neutral-600 bg-neutral-900"
      } ${disabled ? "opacity-50" : "cursor-pointer"}`}
    >
      {checked ? (
        <Check className="w-3 h-3 stroke-[3]" />
      ) : partial ? (
        <span className="w-2 h-0.5 bg-neutral-950 rounded" />
      ) : null}
    </Tag>
  );
}

function PriorityBadge({ level, label }) {
  const style = getLevelStyle(level);
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md border whitespace-nowrap ${style.badge}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.accentDot}`} />
      {label}
    </span>
  );
}

function StoryRow({ story: s, isSelected, isNew, isLocked, levelLabel, onToggle }) {
  return (
    <motion.tr
      initial={isNew ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      onClick={onToggle}
      className={`border-t border-neutral-800/80 align-top transition-colors ${
        isLocked ? "" : "cursor-pointer"
      } ${
        isSelected
          ? "bg-emerald-950/25"
          : isLocked
            ? "opacity-45"
            : "hover:bg-neutral-900/70"
      } ${isNew ? "shadow-[inset_3px_0_0_#34d399]" : ""}`}
    >
      <td className="px-3 py-3">
        <CheckBox as="span" checked={isSelected} disabled={isLocked} />
      </td>
      <td className="px-2 py-3">
        <p className="text-[13px] font-semibold text-white leading-snug">
          {s.title}
        </p>
        <p className="text-xs text-neutral-300 leading-relaxed mt-0.5">
          <span className="text-neutral-500">Como </span>
          <b className="text-neutral-100 font-medium">{s.role}</b>
          <span className="text-neutral-500">, quiero </span>
          {s.action}
          {s.benefit && (
            <>
              <span className="text-neutral-500">, para </span>
              {s.benefit}
            </>
          )}
          .
        </p>
        {s.tag && (
          <span className="inline-block mt-1.5 text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400">
            {s.tag}
          </span>
        )}
      </td>
      <td className="px-2 py-3">
        <ul className="space-y-1">
          {s.acceptanceCriteria.map((c, i) => (
            <li
              key={i}
              className="text-[11px] text-neutral-400 leading-snug flex gap-1.5"
            >
              <span className="text-emerald-500 shrink-0">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </td>
      <td className="px-2 py-3">
        <PriorityBadge level={s.level} label={levelLabel} />
      </td>
      <td className="px-2 py-3 text-center text-xs font-mono font-bold text-neutral-200">
        {s.points || "-"}
      </td>
    </motion.tr>
  );
}

function StoryCard({ story: s, isSelected, isNew, isLocked, levelLabel, onToggle }) {
  return (
    <motion.div
      initial={isNew ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      onClick={onToggle}
      className={`px-3 py-3 flex gap-2.5 ${isLocked ? "" : "cursor-pointer"} ${
        isSelected ? "bg-emerald-950/25" : isLocked ? "opacity-45" : ""
      } ${isNew ? "shadow-[inset_3px_0_0_#34d399]" : ""}`}
    >
      <div className="pt-0.5">
        <CheckBox as="span" checked={isSelected} disabled={isLocked} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[13px] font-semibold text-white leading-snug">
            {s.title}
          </p>
          <span className="text-[10px] font-mono text-neutral-400 shrink-0">
            {s.points ? `${s.points} pts` : ""}
          </span>
        </div>
        <p className="text-xs text-neutral-300 leading-relaxed mt-0.5">
          {storyText(s)}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          <PriorityBadge level={s.level} label={levelLabel} />
          {s.tag && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-neutral-800 bg-neutral-900 text-neutral-400">
              {s.tag}
            </span>
          )}
        </div>
        <ul className="mt-2 space-y-1">
          {s.acceptanceCriteria.map((c, i) => (
            <li key={i} className="text-[11px] text-neutral-400 leading-snug flex gap-1.5">
              <span className="text-emerald-500 shrink-0">✓</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}

function GeneratingRow() {
  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="border-t border-neutral-800/80"
    >
      <td colSpan={5} className="px-3 py-4">
        <span className="flex items-center gap-2 text-[11px] font-mono text-neutral-500">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          Escribiendo {MORE_COUNT} historias más...
        </span>
      </td>
    </motion.tr>
  );
}

function TableSkeleton() {
  return (
    <div className="flex flex-col">
      <div className="h-9 bg-neutral-900 border-b border-neutral-800" />
      {Array.from({ length: 6 }, (_, i) => (
        <div
          key={i}
          className="flex gap-3 px-3 py-3.5 border-b border-neutral-800/70"
        >
          <div className="w-4 h-4 rounded bg-neutral-800 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 bg-neutral-800 rounded animate-pulse" />
            <div className="h-3 w-4/5 bg-neutral-800/60 rounded animate-pulse" />
          </div>
          <div className="hidden md:block flex-1 space-y-2">
            <div className="h-3 w-full bg-neutral-800/50 rounded animate-pulse" />
            <div className="h-3 w-3/4 bg-neutral-800/50 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  );
}
