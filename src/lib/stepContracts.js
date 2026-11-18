/**
 * Contratos de respuesta de cada estación (Gemini -> UI).
 *
 * `normalizeStepResponse` es la única puerta de entrada de datos de opciones:
 * se usa en /api/generate-step (servidor) y al restaurar/migrar datos en el store
 * (cliente). Garantiza los campos que consumen las estaciones, con defaults seguros:
 *
 *   { companionMood, companionComment, [optionsKey]: [...] }   (estaciones con cartas)
 *   { companionMood, companionComment, scaffold: {...} }       (workspace)
 */
import { resolveStation } from "@/config/stations.config";
import {
  DATABASE_TYPES,
  DEPLOY_ROLES,
  DIAGRAM_AUDIENCES,
  DIAGRAM_CATEGORIES,
  DIAGRAM_TYPES,
  LAYOUT_IDS_BY_SURFACE,
  LEVELS,
} from "@/lib/stepSchemas";
import { layoutSurfacesFor, surfaceLabel } from "@/data/layoutCatalog";

const ID_PREFIX = {
  naming: "name",
  requirements: "req",
  "user-stories": "story",
  stack: "stack",
  database: "db",
  architecture: "arch",
  methodology: "meth",
  diagrams: "diag",
  morphism: "morph",
  layout: "lay",
  deploy: "dep",
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

const oneOf = (v, values, fallback) => {
  const value = str(v);
  const match = values.find((x) => x.toLowerCase() === value.toLowerCase());
  return match || fallback;
};

const level = (v) => oneOf(v, LEVELS, "medium");

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
  const name = str(raw.name) || str(raw.title);
  if (!name) return null;
  return {
    id: str(raw.id),
    name,
    style: str(raw.style, "Propuesta"),
    tagline: str(raw.tagline),
    rationale: str(raw.rationale),
  };
}

// Ecosistemas JavaScript: siempre se ofrece elegir entre TypeScript y JavaScript
// (Angular y NestJS quedan fuera: son TypeScript por defecto)
const JS_ECOSYSTEM =
  /\b(react|next|vue|nuxt|svelte|remix|astro|node|express|vite)/i;

/** Garantiza TypeScript y JavaScript en stacks del ecosistema JS. */
function withJsFlavors(languages, stackText) {
  if (!JS_ECOSYSTEM.test(stackText)) return languages;
  const list = [...languages];
  ["TypeScript", "JavaScript"].forEach((lang) => {
    if (!list.some((l) => l.toLowerCase() === lang.toLowerCase())) {
      list.push(lang);
    }
  });
  return list;
}

function normalizeStack(raw) {
  const title = str(raw.title) || str(raw.name);
  if (!title) return null;
  const availableLanguages = withJsFlavors(
    strList(raw.availableLanguages),
    `${title} ${strList(raw.tags).join(" ")}`,
  );
  const defaultLanguage =
    str(raw.defaultLanguage) || availableLanguages[0] || "TypeScript";
  const normalized = {
    ...raw,
    id: str(raw.id),
    level: level(raw.level),
    badge: str(raw.badge),
    title,
    summary: str(raw.summary),
    beginnerTip: str(raw.beginnerTip),
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

function normalizeOption(raw, stationId) {
  const title = str(raw.title) || str(raw.name);
  if (!title) return null;
  const option = {
    ...raw,
    id: str(raw.id),
    level: level(raw.level),
    title,
    tag: str(raw.tag),
    summary: str(raw.summary) || str(raw.description),
    beginnerTip: str(raw.beginnerTip),
    pros: str(raw.pros),
    cons: str(raw.cons),
    techs: strList(raw.techs),
  };

  if (stationId === "requirements") {
    option.functional = strList(raw.functional);
    option.nonFunctional = strList(raw.nonFunctional);
  }

  if (stationId === "user-stories") {
    option.role = str(raw.role, "usuario");
    option.action = str(raw.action);
    option.benefit = str(raw.benefit);
    option.acceptanceCriteria = strList(raw.acceptanceCriteria);
    option.points = str(raw.points);
  }

  if (stationId === "database") {
    option.dbType = oneOf(raw.dbType, DATABASE_TYPES, "relational");
  }

  if (stationId === "diagrams") {
    const type = str(raw.diagramType || raw.type).toLowerCase();
    option.diagramType = DIAGRAM_TYPES.includes(type) ? type : "flowchart";
    option.category = oneOf(raw.category, DIAGRAM_CATEGORIES, "UML");
    option.audience = oneOf(raw.audience, DIAGRAM_AUDIENCES, "Ambos");
    option.sampleMermaid = str(raw.sampleMermaid);
  }

  if (stationId === "morphism") {
    option.styleKey = str(raw.styleKey).toLowerCase();
  }

  if (stationId === "deploy") {
    option.providers = normalizeProviders(raw.providers, option.techs);
    option.steps = strList(raw.steps).slice(0, 4);
    option.cost = str(raw.cost, "$0 / mes");
  }

  return option;
}

/**
 * Servicios de un plan de deploy: nombre + papel, sin duplicados y como máximo 4.
 * Si Gemini no los manda, se deducen de `techs`. GitHub siempre está: el código
 * de todo plan vive en un repositorio (el lema de la estación).
 */
function normalizeProviders(rawProviders, techs = []) {
  const seen = new Set();
  const providers = [];
  const add = (name, role) => {
    const key = name.toLowerCase();
    if (!name || seen.has(key)) return;
    seen.add(key);
    providers.push({ name, role: oneOf(role, DEPLOY_ROLES, "hosting") });
  };

  (Array.isArray(rawProviders) ? rawProviders : []).forEach((p) => {
    if (isObject(p)) add(str(p.name), p.role);
    else add(str(p), "hosting");
  });
  if (!providers.length) techs.slice(0, 2).forEach((t) => add(t, "hosting"));

  const hasRepo = providers.some(
    (p) => p.role === "repo" || /git(hub|lab)/i.test(p.name),
  );
  const list = providers.slice(0, hasRepo ? 4 : 3);
  if (!hasRepo) list.push({ name: "GitHub", role: "repo" });
  return list;
}

/**
 * Layout: una opción por superficie con el catálogo de esa superficie ordenado.
 * Si Gemini omite layouts, se completan en el orden del catálogo; si omite una
 * superficie del proyecto (y se conoce el blueprint), se añade con su orden de
 * serie. `provided` cuenta solo lo que vino de Gemini (para validar).
 */
function normalizeLayoutOptions(rawItems, blueprint) {
  const knowsProject = Boolean(
    blueprint?.idea || blueprint?.selectedSystemType,
  );
  const allowed = knowsProject ? layoutSurfacesFor(blueprint) : null;
  const seen = new Set();

  const fromModel = rawItems.filter(isObject).flatMap((raw) => {
    const surface = str(raw.surface || raw.id).toLowerCase();
    const catalog = LAYOUT_IDS_BY_SURFACE[surface];
    if (!catalog || seen.has(surface)) return [];
    if (allowed && !allowed.includes(surface)) return [];
    seen.add(surface);

    const ranking = [];
    (Array.isArray(raw.ranking) ? raw.ranking : []).forEach((r) => {
      const layoutId = str(isObject(r) ? r.layoutId : r).toLowerCase();
      if (
        catalog.includes(layoutId) &&
        !ranking.some((x) => x.layoutId === layoutId)
      ) {
        ranking.push({ layoutId, reason: isObject(r) ? str(r.reason) : "" });
      }
    });
    catalog.forEach((layoutId) => {
      if (!ranking.some((x) => x.layoutId === layoutId))
        ranking.push({ layoutId, reason: "" });
    });

    return [
      {
        id: surface,
        surface,
        level: "medium",
        title: surfaceLabel(surface),
        summary: str(raw.summary),
        beginnerTip: str(raw.beginnerTip),
        ranking,
      },
    ];
  });

  const missing = (allowed || [])
    .filter((surface) => !seen.has(surface))
    .map((surface) => ({
      id: surface,
      surface,
      level: "medium",
      title: surfaceLabel(surface),
      summary: "",
      beginnerTip: "",
      ranking: LAYOUT_IDS_BY_SURFACE[surface].map((layoutId) => ({
        layoutId,
        reason: "",
      })),
    }));

  // Mismo orden que las superficies del proyecto
  const items = [...fromModel, ...missing];
  if (allowed)
    items.sort(
      (a, b) => allowed.indexOf(a.surface) - allowed.indexOf(b.surface),
    );
  return { items, provided: fromModel.length };
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
 *   validCount = opciones utilizables (o 1 para el workspace si hay scaffold).
 */
export function normalizeStepResponse(stationRef, raw, blueprint = {}) {
  // Acepta el id de la estación ("stack") o su número de paso
  const station = resolveStation(stationRef);
  const stationId = station?.id;
  const source = isObject(raw) ? raw : {};

  const data = {
    // Contrato unificado de Dev-i; se aceptan `mood`/`dialogue` heredados
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

  if (stationId === "workspace") {
    data.scaffold = normalizeScaffold(source.scaffold, blueprint);
    return { data, validCount: 1 };
  }

  const optionsKey = station?.optionsKey;
  if (!optionsKey) {
    if (source.skipped) data.skipped = true;
    return { data, validCount: 0 };
  }

  const rawItems = Array.isArray(source[optionsKey]) ? source[optionsKey] : [];

  if (stationId === "layout") {
    const { items, provided } = normalizeLayoutOptions(rawItems, blueprint);
    data[optionsKey] = items;
    return { data, validCount: provided };
  }

  const normalizer =
    stationId === "naming"
      ? normalizeName
      : stationId === "stack"
        ? normalizeStack
        : (item) => normalizeOption(item, stationId);

  const items = withUniqueIds(
    rawItems.filter(isObject).map(normalizer).filter(Boolean),
    ID_PREFIX[stationId] || `opt-${stationId || "x"}`,
  );

  data[optionsKey] = items;
  // Marca de estación omitida (se conserva al restaurar)
  if (source.skipped) data.skipped = true;
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
