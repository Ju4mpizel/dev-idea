/**
 * AGENTS.md del proyecto: el contexto que leen los agentes de IA (Claude Code,
 * Codex, OpenCode, Cursor...) para programar sin improvisar. Se arma en el
 * cliente con lo decidido en el blueprint y el scaffold del cierre: no gasta IA.
 */
import { contextLabel } from "@/lib/planSummary";
import { getStationById } from "@/config/stations.config";
import { SYSTEM_COMPLEMENTS, describeSurfaces } from "@/data/systemTypes";
import { PALETTE_ROLES } from "@/lib/palettes";
import {
  ECOSYSTEMS,
  getAiMode,
  getEditor,
  getManager,
  getOperatingSystem,
} from "@/data/devPreferences";

/** Líneas de "Entorno de desarrollo" a partir de las preferencias del stack. */
function environmentLines(preferences) {
  if (!preferences) return [];
  const managers = Object.entries(preferences.managers || {}).map(
    ([eco, id]) =>
      `- **Gestor de paquetes (${ECOSYSTEMS[eco]?.label || eco}):** ${getManager(eco, id)?.label || id}. Úsalo siempre; no mezcles gestores ni generes lockfiles de otro.`,
  );
  const os = getOperatingSystem(preferences.os);
  const editor = getEditor(preferences.editor);
  const ai = getAiMode(preferences.ai);
  return [
    ...managers,
    os ? `- **Sistema operativo:** ${os.label}. Da los comandos para ${os.shell}.` : null,
    editor ? `- **Editor:** ${editor.label}` : null,
    ai ? `- **Trabajo con IA:** ${ai.label}` : null,
  ];
}

const asList = (value) =>
  Array.isArray(value) ? value : value ? [value] : [];

const section = (title, lines) => {
  const body = lines.filter((l) => l !== null && l !== undefined && l !== "");
  return body.length ? ["", `## ${title}`, "", ...body] : [];
};

/** Reglas fijas para cualquier agente que trabaje en el repo. */
const AGENT_RULES = [
  "- Respeta la arquitectura y la estructura de carpetas de este archivo; si algo no encaja, pregunta antes de reorganizar.",
  "- Usa el lenguaje y las librerías del stack elegido. No agregues dependencias nuevas sin explicar por qué.",
  "- Trabaja en pasos pequeños: un requisito o historia por cambio, con commits claros.",
  "- Cada requisito funcional (RF) debe poder probarse: agrega o actualiza tests cuando cambies lógica.",
  "- Nunca subas secretos: las claves van en variables de entorno (.env.local) y fuera del repositorio.",
  "- Si una decisión de este archivo queda desactualizada, propón el cambio y actualiza AGENTS.md.",
];

/**
 * @param {object} blueprint  Decisiones del usuario.
 * @param {object} scaffold   Cierre generado (projectName, commands, folders...).
 * @returns {string} Markdown listo para guardar como AGENTS.md
 */
export function buildAgentsMd(blueprint = {}, scaffold = {}) {
  const name = blueprint.selectedName || scaffold.projectName || "Mi proyecto";
  const system = blueprint.selectedSystemType;
  const stack = blueprint.selectedStack;
  const db = blueprint.selectedDatabase;
  const arch = blueprint.selectedArchitecture;
  const method = blueprint.selectedMethodology;
  const style = blueprint.selectedStyle;
  const layout = blueprint.selectedLayout;
  const deploy = blueprint.selectedDeploy;
  const complements = (system?.complements || [])
    .map((id) => SYSTEM_COMPLEMENTS.find((c) => c.id === id)?.title)
    .filter(Boolean);

  const lines = [
    `# ${name} · AGENTS.md`,
    "",
    "> Contexto del proyecto para agentes de IA. Generado con Dev.Idea a partir de las decisiones del plano técnico.",
    ...section("Proyecto", [
      `- **Idea:** ${blueprint.idea || "—"}`,
      `- **Propósito:** ${contextLabel(blueprint.context)}`,
      system?.title
        ? `- **Tipo de sistema:** ${system.title} (partes: ${describeSurfaces(system.surfaces)})`
        : null,
      complements.length ? `- **Complementos:** ${complements.join(", ")}` : null,
      scaffold.techSummary ? `- **Resumen técnico:** ${scaffold.techSummary}` : null,
    ]),
    ...section("Stack", [
      stack?.title
        ? `- **${stack.title}**${stack.selectedLanguage ? ` en ${stack.selectedLanguage}` : ""}`
        : null,
      stack?.tags?.length ? `- Piezas: ${stack.tags.join(", ")}` : null,
      db?.title ? `- **Base de datos:** ${db.title}${db.summary ? ` — ${db.summary}` : ""}` : null,
      db?.adminToolLabel ? `- **Administrador de la base:** ${db.adminToolLabel}` : null,
      arch?.title
        ? `- **Arquitectura:** ${arch.title}${arch.summary ? ` — ${arch.summary}` : ""}`
        : null,
    ]),
    ...section("Entorno de desarrollo", environmentLines(stack?.preferences)),
    ...section(
      "Estructura de carpetas",
      asList(scaffold.folders).map(
        (f) => `- \`${f.path}\`${f.purpose ? ` — ${f.purpose}` : ""}`,
      ),
    ),
    ...section(
      "Comandos",
      scaffold.commands?.length
        ? ["```bash", ...scaffold.commands, "```"]
        : [],
    ),
    ...section(
      "Modelo de datos",
      asList(scaffold.entities).map(
        (e) => `- **${e.name}**: ${asList(e.fields).join(" · ")}`,
      ),
    ),
    ...section(
      "Requisitos del MVP",
      asList(blueprint.selectedRequirements).flatMap((m) => [
        `- **${m.title}**`,
        ...asList(m.functional).map((rf) => `  - RF: ${rf}`),
        ...asList(m.nonFunctional).map((rnf) => `  - RNF: ${rnf}`),
      ]),
    ),
    ...section(
      "Historias de usuario",
      asList(blueprint.selectedUserStories).map(
        (s) =>
          `- Como ${s.role || "usuario"}, quiero ${s.action || s.title}${s.benefit ? `, para ${s.benefit}` : ""}${s.points ? ` (${s.points} pts)` : ""}`,
      ),
    ),
    ...section("Diseño", [
      style?.title
        ? `- **Estilo visual:** ${style.title}${style.summary ? ` — ${style.summary}` : ""}`
        : null,
      style?.palette?.primary
        ? `- **Paleta "${style.palette.name}"** (usa estos tokens, no colores sueltos): ${PALETTE_ROLES.map(
            ({ key, label }) => `${label.toLowerCase()} \`${style.palette[key]}\``,
          ).join(" · ")} · degradado de primario a secundario`
        : null,
      ...asList(layout?.selections).map(
        (s) => `- **${s.surfaceTitle}:** layout "${s.layoutTitle}"`,
      ),
      asList(blueprint.selectedDiagrams).length
        ? `- **Diagramas a mantener:** ${asList(blueprint.selectedDiagrams)
            .map((d) => d.title)
            .join(", ")}`
        : null,
    ]),
    ...section(
      "Diagramas",
      asList(scaffold.diagrams)
        .filter((d) => d?.mermaid)
        .flatMap((d) => [
          `### ${d.title}`,
          "",
          "```mermaid",
          String(d.mermaid).replace(/\\n/g, "\n").trim(),
          "```",
          "",
        ]),
    ),
    ...section("Deploy", [
      deploy?.title
        ? `- **${deploy.title}**${deploy.costTier ? ` (${{ free: "gratis", low: "económico", premium: "profesional" }[deploy.costTier]})` : ""}${deploy.cost ? ` · ${deploy.cost}` : ""}`
        : null,
      ...asList(deploy?.steps).map((step, i) => `${i + 1}. ${step}`),
    ]),
    ...section("Forma de trabajo", [
      method?.title ? `- **Metodología:** ${method.title}` : null,
      ...asList(scaffold.milestones).flatMap((m) => [
        `- **${m.title}:** ${m.goal || ""}`,
        ...asList(m.tasks).map((t) => `  - [ ] ${t}`),
      ]),
    ]),
    ...section(
      "Sugerencias de Dev-i (decisiones que aún no tomaste)",
      asList(scaffold.suggestions).map(
        (s) => `- **${getStationById(s.stationId)?.title || s.stationId}:** ${s.title}${s.detail ? ` — ${s.detail}` : ""}`,
      ),
    ),
    ...section("Reglas para la IA", AGENT_RULES),
    "",
  ];

  return lines.join("\n");
}
