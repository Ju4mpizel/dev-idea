/**
 * `responseSchema` de Gemini por estación (subconjunto OpenAPI de Vertex AI).
 *
 * Restringe la generación a la forma que espera `normalizeStepResponse`
 * (src/lib/stepContracts.js). El saneamiento sigue activo como segunda barrera:
 * el esquema previene, el contrato garantiza.
 *
 * Sin imports a propósito: se usa en el servidor y en scripts de prueba.
 */

const LEVELS = ["simple", "medium", "advanced"];
const DIAGRAM_TYPES = [
  "use-case",
  "components",
  "erd",
  "sequence",
  "cloud",
  "flowchart",
];
const STYLE_KEYS = [
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

const STRING = { type: "STRING" };
const STRING_LIST = { type: "ARRAY", items: STRING };
const LEVEL = { type: "STRING", enum: LEVELS };

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

// Opción genérica (estaciones 3, 4, 7, 8, 9)
const OPTION_FIELDS = {
  id: STRING,
  level: LEVEL,
  title: STRING,
  tag: STRING,
  summary: STRING,
  pros: STRING,
  cons: STRING,
  techs: STRING_LIST,
};

const OPTIONS_SCHEMA = {
  1: {
    key: "names",
    items: object({
      id: STRING,
      name: STRING,
      style: STRING,
      tagline: STRING,
      rationale: STRING,
    }),
    min: 4,
  },
  2: {
    key: "stacks",
    items: object({
      id: STRING,
      level: LEVEL,
      badge: STRING,
      title: STRING,
      tags: STRING_LIST,
      defaultLanguage: STRING,
      availableLanguages: STRING_LIST,
      pros: STRING,
      cons: STRING,
    }),
    min: 4,
    max: 5,
  },
  3: { key: "options", items: object(OPTION_FIELDS), min: 6 },
  4: { key: "options", items: object(OPTION_FIELDS), min: 4 },
  5: {
    key: "options",
    items: object({
      ...OPTION_FIELDS,
      diagrams: {
        type: "ARRAY",
        items: object({
          name: STRING,
          type: { type: "STRING", enum: DIAGRAM_TYPES },
          description: STRING,
        }),
        minItems: 1,
      },
      sampleMermaid: STRING,
    }),
    min: 3,
  },
  6: {
    key: "options",
    items: object({
      ...OPTION_FIELDS,
      styleKey: { type: "STRING", enum: STYLE_KEYS },
    }),
    min: 3,
    max: 4,
  },
  7: { key: "options", items: object(OPTION_FIELDS), min: 3 },
  8: { key: "options", items: object(OPTION_FIELDS), min: 3 },
  9: { key: "options", items: object(OPTION_FIELDS), min: 3 },
};

const COMPANION_FIELDS = {
  companionMood: STRING,
  companionComment: STRING,
};

/** Devuelve el responseSchema de la estación, o null si no hay uno definido. */
export function getResponseSchema(stepNumber) {
  const step = Number(stepNumber);

  if (step === 10) {
    return object({
      ...COMPANION_FIELDS,
      scaffold: object({
        projectName: STRING,
        techSummary: STRING,
        commands: { type: "ARRAY", items: STRING, minItems: 1 },
      }),
    });
  }

  const spec = OPTIONS_SCHEMA[step];
  if (!spec) return null;

  return object({
    ...COMPANION_FIELDS,
    [spec.key]: list(spec.items, spec.min, spec.max),
  });
}
