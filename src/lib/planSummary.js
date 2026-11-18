/**
 * Resumen del plano del proyecto ("💡 Mi plano"): qué decidió el usuario en
 * cada estación. Lógica pura (sin React) para reutilizarla en el panel, en el
 * texto copiable y, más adelante, en el Workspace.
 */
import {
  LAST_STEP,
  STATIONS,
  hasDecisionValue,
  highestStepOf,
} from "@/config/stations.config";
import {
  SURFACES,
  SYSTEM_COMPLEMENTS,
  describeSurfaces,
} from "@/data/systemTypes";

const CONTEXT_LABEL = {
  academic: "Académico / Universidad",
  startup: "Startup / Trabajo",
  personal: "Personal / MVP",
};

/** Estaciones que entran en el plano (todas menos la idea y el cierre). */
export const PLAN_STATIONS = STATIONS.filter(
  (s) => s.blueprintKey && s.stepNumber > 0 && s.stepNumber < LAST_STEP,
);

const asList = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

const titleOf = (item) =>
  typeof item === "string" ? item : item?.title || item?.name || "";

/** Chips cortos para la fila cerrada de una estación. */
function chipsFor(station, value) {
  switch (station.id) {
    case "naming":
      return [String(value)];
    case "system-type":
      return [value.title, ...(value.surfaces || []).map((s) => SURFACES[s] || s)];
    case "layout":
      if (value.selections?.length)
        return value.selections.map((s) => `${s.surfaceTitle}: ${s.layoutTitle}`);
      return asList(value).map(titleOf).filter(Boolean);
    case "stack":
      return [
        value.title,
        value.selectedLanguage,
        ...(value.tags || []).slice(0, 3),
      ].filter(Boolean);
    case "user-stories":
    case "requirements":
    case "diagrams": {
      const list = asList(value);
      const titles = list.map(titleOf).filter(Boolean);
      return titles.length > 3
        ? [...titles.slice(0, 3), `+${titles.length - 3}`]
        : titles;
    }
    default:
      return asList(value).map(titleOf).filter(Boolean);
  }
}

/**
 * Estado de cada estación del plano.
 * @returns {Array<{ station, status: "decided"|"skipped"|"pending", value, chips }>}
 */
export function buildPlanEntries(blueprint = {}, generatedOptions = {}) {
  const highestStep = highestStepOf(generatedOptions);

  return PLAN_STATIONS.map((station) => {
    const value = blueprint[station.blueprintKey];
    if (hasDecisionValue(value)) {
      return { station, status: "decided", value, chips: chipsFor(station, value) };
    }
    const wasSkipped =
      generatedOptions[station.id]?.skipped ||
      (station.skippable && station.stepNumber < highestStep);
    return {
      station,
      status: wasSkipped ? "skipped" : "pending",
      value: null,
      chips: [],
    };
  });
}

/** Comentario de Dev-i según el avance. */
export function planComment(entries) {
  const done = entries.filter((e) => e.status !== "pending").length;
  const total = entries.length;
  const has = (id) =>
    entries.some((e) => e.station.id === id && e.status === "decided");

  if (done === 0)
    return "Tu plano está en blanco. Cada estación que confirmes aparecerá aquí.";
  if (done === total)
    return "¡Plano completo! Ya puedes copiarlo y ponerte a construir.";
  if (has("stack") && has("database"))
    return `Llevas ${done} de ${total} estaciones y ya tienes stack y base de datos. ¡Vas muy bien!`;
  if (done < total / 3)
    return `Llevas ${done} de ${total} estaciones. Buen comienzo: lo más importante es tener claro el QUÉ.`;
  return `Llevas ${done} de ${total} estaciones. Ya se nota la forma de tu proyecto.`;
}

// ---------- Texto copiable (Markdown) ----------
const mdItem = (item) => {
  const lines = [`- **${titleOf(item)}**${item.tag ? ` (${item.tag})` : ""}`];
  if (item.summary) lines.push(`  ${item.summary}`);
  return lines.join("\n");
};

function stationMarkdown(station, value) {
  switch (station.id) {
    case "naming":
      return String(value);
    case "system-type": {
      const extras = (value.complements || [])
        .map((id) => SYSTEM_COMPLEMENTS.find((c) => c.id === id)?.title)
        .filter(Boolean);
      return [
        `**${value.title}**: ${value.summary || ""}`,
        `Partes: ${describeSurfaces(value.surfaces)}`,
        extras.length ? `Complementos: ${extras.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join("\n");
    }
    case "layout":
      if (value.selections?.length)
        return value.selections
          .map((s) => `- **${s.surfaceTitle}:** ${s.layoutTitle}`)
          .join("\n");
      return asList(value).map(mdItem).join("\n");
    case "requirements":
      return asList(value)
        .map((m) =>
          [
            `- **${m.title}**`,
            ...(m.functional || []).map((rf) => `  - RF: ${rf}`),
            ...(m.nonFunctional || []).map((rnf) => `  - RNF: ${rnf}`),
          ].join("\n"),
        )
        .join("\n");
    case "user-stories":
      return asList(value)
        .map(
          (s) =>
            `- Como ${s.role || "usuario"}, quiero ${s.action || s.title}${s.benefit ? `, para ${s.benefit}` : ""}`,
        )
        .join("\n");
    case "stack":
      return [
        `**${value.title}**${value.selectedLanguage ? ` · ${value.selectedLanguage}` : ""}`,
        value.tags?.length ? `Piezas: ${value.tags.join(", ")}` : "",
        value.summary || "",
      ]
        .filter(Boolean)
        .join("\n");
    default:
      return asList(value).map(mdItem).join("\n");
  }
}

export function buildPlanMarkdown(blueprint = {}, entries = []) {
  const name = blueprint.selectedName || "Proyecto sin nombre";
  const parts = [
    `# ${name}`,
    "",
    `**Idea:** ${blueprint.idea || "—"}`,
    `**Propósito:** ${CONTEXT_LABEL[blueprint.context] || CONTEXT_LABEL.startup}`,
  ];
  entries.forEach(({ station, status, value }) => {
    if (status === "pending") return;
    parts.push("", `## ${station.stepNumber}. ${station.title}`);
    parts.push(status === "skipped" ? "_Omitida_" : stationMarkdown(station, value));
  });
  const pending = entries.filter((e) => e.status === "pending");
  if (pending.length) {
    parts.push(
      "",
      `## Pendiente`,
      pending.map((e) => `- ${e.station.title}`).join("\n"),
    );
  }
  return parts.join("\n");
}

export const contextLabel = (context) =>
  CONTEXT_LABEL[context] || CONTEXT_LABEL.startup;
