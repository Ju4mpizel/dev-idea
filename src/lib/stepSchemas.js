/**
 * `responseSchema` de Gemini por estación (subconjunto OpenAPI de Vertex AI).
 *
 * Restringe la generación a la forma que espera `normalizeStepResponse`
 * (src/lib/stepContracts.js). El saneamiento sigue activo como segunda barrera:
 * el esquema previene, el contrato garantiza.
 *
 * Se indexa por el `id` de la estación (no por número) para que reordenar el
 * mapa no rompa nada. Sin imports a propósito: se usa también en scripts.
 */

export const OPTIONS_PER_STATION = 6;

// Estaciones con más cartas que el resto (el stack tiene muchas combinaciones)
const OPTION_COUNTS = { stack: 8, "user-stories": 10 };

/** Número de cartas que se piden a Gemini para una estación. */
export const getOptionCount = (stationId) =>
  OPTION_COUNTS[stationId] || OPTIONS_PER_STATION;

export const LEVELS = ["simple", "medium", "advanced"];

export const DIAGRAM_TYPES = [
  "use-case",
  "class",
  "sequence",
  "activity",
  "state",
  "components",
  "deployment",
  "c4-context",
  "c4-container",
  "erd",
  "dfd",
  "bpmn",
  "flowchart",
  "wireflow",
  "user-journey",
  "architecture",
];

export const DIAGRAM_CATEGORIES = [
  "UML",
  "C4",
  "Datos",
  "Procesos",
  "Infraestructura",
  "UX",
];

export const DIAGRAM_AUDIENCES = ["Universidad", "Industria", "Ambos"];

export const DATABASE_TYPES = [
  "none",
  "relational",
  "document",
  "key-value",
  "baas",
  "embedded",
];

/** Papel de cada servicio dentro de un plan de deploy. */
export const DEPLOY_ROLES = [
  "hosting",
  "frontend",
  "backend",
  "database",
  "repo",
  "ci",
  "storage",
];

export const STYLE_KEYS = [
  "minimalism",
  "glassmorphism",
  "claymorphism",
  "neobrutalism",
  "neumorphism",
  "aurora",
  "cyberpunk",
  "skeuomorphism",
  "terminal",
  "papercraft",
];

/**
 * Layouts del catálogo agrupados por superficie (ids estables). Los títulos,
 * descripciones y wireframes viven en src/data/layoutCatalog.js.
 */
export const LAYOUT_IDS_BY_SURFACE = {
  public: [
    "one-page",
    "zigzag",
    "f-pattern",
    "hero-media",
    "split-screen",
    "asymmetric",
  ],
  content: ["magazine", "masonry", "article-sidebar"],
  store: ["product-grid", "product-detail", "checkout-steps"],
  app: ["sidebar-content", "topnav-views", "bento", "cards-grid"],
  admin: ["crud-table", "master-detail", "wizard-form", "pos-split"],
  booking: ["calendar", "booking-steps"],
  mobile: ["bottom-tabs", "list-detail", "stack-nav"],
};
export const LAYOUT_SURFACE_IDS = Object.keys(LAYOUT_IDS_BY_SURFACE);
export const LAYOUT_IDS = Object.values(LAYOUT_IDS_BY_SURFACE).flat();

const STRING = { type: "STRING" };
const STRING_LIST = { type: "ARRAY", items: STRING };
const LEVEL = { type: "STRING", enum: LEVELS };
const enumOf = (values) => ({ type: "STRING", enum: values });

const object = (properties, required = Object.keys(properties)) => ({
  type: "OBJECT",
  properties,
  required,
  propertyOrdering: Object.keys(properties),
});

const list = (items, min, max = min) => ({
  type: "ARRAY",
  items,
  minItems: min,
  maxItems: max,
});

// Opción genérica: base de todas las cartas con trade-offs
const OPTION_FIELDS = {
  id: STRING,
  level: LEVEL,
  title: STRING,
  tag: STRING,
  summary: STRING,
  beginnerTip: STRING,
  pros: STRING,
  cons: STRING,
  techs: STRING_LIST,
};

const OPTIONS_SCHEMA = {
  naming: {
    key: "names",
    items: object({
      id: STRING,
      name: STRING,
      style: STRING,
      tagline: STRING,
      rationale: STRING,
    }),
  },
  requirements: {
    key: "options",
    items: object({
      id: STRING,
      level: LEVEL,
      title: STRING,
      tag: STRING,
      summary: STRING,
      beginnerTip: STRING,
      functional: STRING_LIST,
      nonFunctional: STRING_LIST,
    }),
  },
  "user-stories": {
    key: "options",
    items: object({
      id: STRING,
      level: LEVEL,
      title: STRING,
      role: STRING,
      action: STRING,
      benefit: STRING,
      acceptanceCriteria: STRING_LIST,
      points: STRING,
      tag: STRING,
    }),
  },
  stack: {
    key: "stacks",
    items: object({
      id: STRING,
      level: LEVEL,
      badge: STRING,
      title: STRING,
      summary: STRING,
      beginnerTip: STRING,
      tags: STRING_LIST,
      defaultLanguage: STRING,
      availableLanguages: STRING_LIST,
      pros: STRING,
      cons: STRING,
    }),
  },
  database: {
    key: "options",
    items: object({ ...OPTION_FIELDS, dbType: enumOf(DATABASE_TYPES) }),
  },
  architecture: { key: "options", items: object(OPTION_FIELDS) },
  methodology: { key: "options", items: object(OPTION_FIELDS) },
  diagrams: {
    key: "options",
    items: object({
      ...OPTION_FIELDS,
      diagramType: enumOf(DIAGRAM_TYPES),
      category: enumOf(DIAGRAM_CATEGORIES),
      audience: enumOf(DIAGRAM_AUDIENCES),
      sampleMermaid: STRING,
    }),
  },
  morphism: {
    key: "options",
    items: object({ ...OPTION_FIELDS, styleKey: enumOf(STYLE_KEYS) }),
  },
  // Una opción por SUPERFICIE del sistema, con los layouts del catálogo ordenados
  layout: {
    key: "options",
    items: object({
      surface: enumOf(LAYOUT_SURFACE_IDS),
      summary: STRING,
      beginnerTip: STRING,
      ranking: {
        type: "ARRAY",
        minItems: 2,
        items: object({ layoutId: enumOf(LAYOUT_IDS), reason: STRING }),
      },
    }),
  },
  // Cada plan declara los servicios que lo componen (se muestran con su logo)
  deploy: {
    key: "options",
    items: object({
      ...OPTION_FIELDS,
      providers: {
        type: "ARRAY",
        minItems: 2,
        maxItems: 4,
        items: object({ name: STRING, role: enumOf(DEPLOY_ROLES) }),
      },
      steps: { type: "ARRAY", items: STRING, minItems: 3, maxItems: 4 },
      cost: STRING,
    }),
  },
};

const COMPANION_FIELDS = {
  companionMood: STRING,
  companionComment: STRING,
};

/**
 * Devuelve el responseSchema de la estación (por id), o null si no hay uno.
 * `count` permite pedir otro número de cartas (p. ej. "generar más historias").
 */
export function getResponseSchema(stationId, { count } = {}) {
  if (stationId === "workspace") {
    return object({
      ...COMPANION_FIELDS,
      scaffold: object({
        projectName: STRING,
        techSummary: STRING,
        commands: { type: "ARRAY", items: STRING, minItems: 1 },
      }),
    });
  }

  const spec = OPTIONS_SCHEMA[stationId];
  if (!spec) return null;

  return object({
    ...COMPANION_FIELDS,
    [spec.key]: list(
      spec.items,
      count || getOptionCount(stationId),
      count || getOptionCount(stationId),
    ),
  });
}
