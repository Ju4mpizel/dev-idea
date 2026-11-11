/**
 * Contratos de respuesta de cada estación (Gemini -> UI).
 *
 * `normalizeStepResponse` es la única puerta de entrada de datos de opciones:
 * se usa en /api/generate-step (servidor) y al restaurar/migrar datos en el store
 * (cliente). Garantiza los campos que consumen las estaciones, con defaults seguros:
 *
 *   { companionMood, companionComment, [optionsKey]: [...] }   (pasos 1-9)
 *   { companionMood, companionComment, scaffold: {...} }       (paso 10)
 */
import { getStation } from "@/config/stations.config";

const LEVELS = ["simple", "medium", "advanced"];
const DIAGRAM_TYPES = [
  "use-case",
  "components",
  "erd",
  "sequence",
  "cloud",
  "flowchart",
];

const ID_PREFIX = {
  1: "name",
  2: "stack",
  3: "arch",
  4: "meth",
  5: "diag",
  6: "morph",
  7: "lay",
  8: "dep",
  9: "ai",
};

// ---------- Primitivas ----------
const isObject = (v) =>
  v !== null && typeof v === "object" && !Array.isArray(v);

const str = (v, fallback = "") =>
  typeof v === "string"
    ? v.trim()
    : typeof v === "number"
      ? String(v)
      : fallback;

const strList = (v) =>
  (Array.isArray(v) ? v : typeof v === "string" ? v.split(",") : [])
    .map((item) => str(item))
    .filter(Boolean);

const level = (v) => {
  const value = str(v).toLowerCase();
  return LEVELS.includes(value) ? value : "medium";
};

/** Asigna ids únicos y estables (las estaciones seleccionan por id). */
function withUniqueIds(items, prefix) {
  const seen = new Set();
  return items.map((item, index) => {
    let id = str(item.id) || `${prefix}-${index + 1}`;
    while (seen.has(id)) id = `${id}-${index + 1}`;
    seen.add(id);
    return { ...item, id };
  });
}

// ---------- Normalizadores por tipo de opción ----------
function normalizeName(raw) {
  const name = str(raw.name);
  if (!name) return null;
  return {
    id: str(raw.id),
    name,
    style: str(raw.style, "Propuesta"),
    tagline: str(raw.tagline),
    rationale: str(raw.rationale),
  };
}

function normalizeStack(raw) {
  const title = str(raw.title) || str(raw.name);
  if (!title) return null;
  const availableLanguages = strList(raw.availableLanguages);
  const defaultLanguage =
    str(raw.defaultLanguage) || availableLanguages[0] || "TypeScript";
  const normalized = {
    ...raw,
    id: str(raw.id),
    level: level(raw.level),
    badge: str(raw.badge),
    title,
    tags: strList(raw.tags),
    defaultLanguage,
    availableLanguages: availableLanguages.length
      ? availableLanguages
      : [defaultLanguage],
    // Contrato plural; se aceptan `pro`/`con` heredados de versiones anteriores
    pros: str(raw.pros) || str(raw.pro),
    cons: str(raw.cons) || str(raw.con),
  };
  delete normalized.pro;
  delete normalized.con;
  return normalized;
}

function normalizeOption(raw, stepNumber) {
  const title = str(raw.title) || str(raw.name);
  if (!title) return null;
  const option = {
    ...raw,
    id: str(raw.id),
    level: level(raw.level),
    title,
    tag: str(raw.tag),
    summary: str(raw.summary) || str(raw.description),
    pros: str(raw.pros),
    cons: str(raw.cons),
    techs: strList(raw.techs),
  };

  if (stepNumber === 5) {
    option.diagrams = (Array.isArray(raw.diagrams) ? raw.diagrams : [])
      .filter(isObject)
      .map((d) => {
        const type = str(d.type).toLowerCase();
        return {
          name: str(d.name, "Diagrama"),
          type: DIAGRAM_TYPES.includes(type) ? type : "flowchart",
          description: str(d.description),
        };
      });
    option.sampleMermaid = str(raw.sampleMermaid);
  }

  if (stepNumber === 6) {
    option.styleKey = str(raw.styleKey).toLowerCase();
  }

  return option;
}

function normalizeScaffold(raw, blueprint = {}) {
  const scaffold = isObject(raw) ? raw : {};
  const commands = strList(scaffold.commands);
  return {
    ...scaffold,
    projectName:
      str(scaffold.projectName) || blueprint.selectedName || "mi-proyecto",
    techSummary:
      str(scaffold.techSummary) || blueprint.selectedStack?.title || "",
    commands: commands.length ? commands : ["pnpm install", "pnpm dev"],
  };
}

// ---------- API pública ----------

/**
 * Normaliza la respuesta de una estación. Nunca lanza: datos inválidos -> defaults.
 * @returns {{ data: object, validCount: number }}
 *   validCount = opciones utilizables (o 1 para el paso 10 si hay scaffold).
 */
export function normalizeStepResponse(stepNumber, raw, blueprint = {}) {
  const step = Number(stepNumber);
  const station = getStation(step);
  const source = isObject(raw) ? raw : {};

  const data = {
    // Contrato unificado de Strobi; se aceptan `mood`/`dialogue` heredados
    companionMood:
      str(source.companionMood) ||
      str(source.mood) ||
      station?.defaultMood ||
      "thinking",
    companionComment:
      str(source.companionComment) ||
      str(source.dialogue) ||
      station?.defaultDialogue ||
      "",
  };

  if (step === 10) {
    data.scaffold = normalizeScaffold(source.scaffold, blueprint);
    return { data, validCount: 1 };
  }

  const optionsKey = station?.optionsKey;
  if (!optionsKey) return { data, validCount: 0 };

  const rawItems = Array.isArray(source[optionsKey]) ? source[optionsKey] : [];
  const normalizer =
    step === 1
      ? normalizeName
      : step === 2
        ? normalizeStack
        : (item) => normalizeOption(item, step);

  const items = withUniqueIds(
    rawItems.filter(isObject).map(normalizer).filter(Boolean),
    ID_PREFIX[step] || `opt${step}`,
  );

  data[optionsKey] = items;
  return { data, validCount: items.length };
}

/**
 * Extrae el primer objeto JSON de un texto del modelo (tolera ```json y prosa extra).
 * @returns {object|null}
 */
export function parseModelJson(rawText) {
  const text = String(rawText || "")
    .replace(/```(?:json)?/gi, "")
    .trim();

  try {
    return JSON.parse(text);
  } catch {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end <= start) return null;
    try {
      return JSON.parse(text.slice(start, end + 1));
    } catch {
      return null;
    }
  }
}
