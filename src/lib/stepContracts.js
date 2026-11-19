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
import {
  getStationById,
  isStationInMode,
  resolveStation,
} from "@/config/stations.config";
import { normalizePalettes } from "@/lib/palettes";
import {
  DATABASE_TYPES,
  COST_TIERS,
  DEPLOY_ROLES,
  DIAGRAM_AUDIENCES,
  DIAGRAM_CATEGORIES,
  DIAGRAM_TYPES,
  LAYOUT_IDS_BY_SURFACE,
  LEVELS,
} from "@/lib/stepSchemas";
import { layoutSurfacesFor, surfaceLabel } from "@/data/layoutCatalog";
import {
  adaptNodeCommands,
  defaultCommands,
  nodeManagerOf,
  resolvePreferences,
} from "@/data/devPreferences";

/** Tope del código Mermaid de un diagrama (evita respuestas desbocadas). */
const MAX_MERMAID_LENGTH = 4000;

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
    option.palettes = normalizePalettes(raw.palettes, option.styleKey);
  }

  if (stationId === "deploy") {
    option.providers = normalizeProviders(raw.providers, option.techs);
    option.steps = strList(raw.steps).slice(0, 4);
    option.cost = str(raw.cost, "$0 / mes");
    option.costTier = oneOf(raw.costTier, COST_TIERS, inferCostTier(option.cost));
  }

  return option;
}

/** Franja de un plan sin costTier (proyectos anteriores): se deduce del costo. */
function inferCostTier(cost = "") {
  // Montos en dólares del texto ("$0 / mes", "≈ US$12 / mes", "US$80/mes")
  const amounts = (cost.match(/\$\s*\d+(?:[.,]\d+)?/g) || []).map((m) =>
    Number(m.replace(/[^\d.,]/g, "").replace(",", ".")),
  );
  const max = amounts.length ? Math.max(...amounts) : 0;
  if (max === 0) return "free";
  return max >= 50 ? "premium" : "low";
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

/**
 * Un diagrama del cierre por cada diagrama elegido: el código completo de la
 * IA o, si no vino, el ejemplo corto que trajo la carta de la estación.
 */
function normalizeScaffoldDiagrams(raw, blueprint = {}) {
  const fromModel = (Array.isArray(raw) ? raw : [])
    .filter(isObject)
    .map((d) => ({
      diagramType: str(d.diagramType),
      title: str(d.title),
      mermaid: str(d.mermaid).slice(0, MAX_MERMAID_LENGTH),
    }))
    .filter((d) => d.mermaid);
  const chosen = Array.isArray(blueprint.selectedDiagrams)
    ? blueprint.selectedDiagrams.filter(isObject)
    : [];
  if (!chosen.length) return fromModel.slice(0, 8);

  const used = new Set();
  return chosen.slice(0, 8).map((d, i) => {
    const sameType = (m, idx) =>
      !used.has(idx) && m.diagramType && m.diagramType === d.diagramType;
    let index = fromModel.findIndex(sameType);
    if (index < 0 && !used.has(i) && fromModel[i]) index = i;
    if (index >= 0) used.add(index);
    const match = index >= 0 ? fromModel[index] : null;
    return {
      id: str(d.id) || `diagram-${i + 1}`,
      diagramType: str(d.diagramType) || match?.diagramType || "flowchart",
      title: str(d.title) || match?.title || "Diagrama",
      mermaid: match?.mermaid || str(d.sampleMermaid),
      isSample: !match,
    };
  });
}

/**
 * Sugerencias del cierre para las estaciones que el modo omitió: una por
 * estación, solo de estaciones reales y fuera del modo del mapa.
 */
function normalizeSuggestions(raw, blueprint = {}) {
  const seen = new Set();
  return (Array.isArray(raw) ? raw : [])
    .filter(isObject)
    .map((s) => ({
      stationId: str(s.stationId),
      title: str(s.title),
      detail: str(s.detail),
    }))
    .filter((s) => {
      const station = getStationById(s.stationId);
      if (!station || !s.title || seen.has(s.stationId)) return false;
      if (blueprint.mode && isStationInMode(station, blueprint.mode)) return false;
      seen.add(s.stationId);
      return true;
    })
    .slice(0, 8);
}

function normalizeScaffold(raw, blueprint = {}) {
  const scaffold = isObject(raw) ? raw : {};
  const stack = isObject(blueprint.selectedStack) ? blueprint.selectedStack : null;
  const preferences = stack?.preferences;
  // La IA a veces usa el gestor "de moda": se reescribe al que eligió el usuario
  // (solo si lo eligió; los proyectos anteriores conservan sus comandos)
  const commands = adaptNodeCommands(
    strList(scaffold.commands),
    nodeManagerOf(preferences),
  );
  const fallbackPreferences =
    preferences || (stack ? resolvePreferences(stack) : null);
  const list = (v) => (Array.isArray(v) ? v.filter(isObject) : []);
  return {
    ...scaffold,
    projectName:
      str(scaffold.projectName) || blueprint.selectedName || "mi-proyecto",
    techSummary:
      str(scaffold.techSummary) || blueprint.selectedStack?.title || "",
    commands: commands.length ? commands : defaultCommands(fallbackPreferences),
    diagrams: normalizeScaffoldDiagrams(scaffold.diagrams, blueprint),
    suggestions: normalizeSuggestions(scaffold.suggestions, blueprint),
    // Campos nuevos: los proyectos guardados antes no los traen ([])
    folders: list(scaffold.folders)
      .map((f) => ({ path: str(f.path), purpose: str(f.purpose) }))
      .filter((f) => f.path)
      .slice(0, 14),
    entities: list(scaffold.entities)
      .map((e) => ({ name: str(e.name), fields: strList(e.fields).slice(0, 10) }))
      .filter((e) => e.name)
      .slice(0, 8),
    milestones: list(scaffold.milestones)
      .map((m) => ({
        title: str(m.title),
        goal: str(m.goal),
        tasks: strList(m.tasks).slice(0, 5),
      }))
      .filter((m) => m.title)
      .slice(0, 5),
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
