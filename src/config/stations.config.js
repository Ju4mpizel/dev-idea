/**
 * Registro único de estaciones de Dev.Idea.
 *
 * Cada estación declara cómo se persiste su decisión:
 * - blueprintKey: propiedad del `blueprint` en el store (null si no decide nada).
 * - dbColumn:     columna equivalente en la tabla `blueprints` de Supabase.
 * - optionsKey:   propiedad de la respuesta de Gemini que contiene la lista de opciones
 *                 (null si la estación no muestra opciones seleccionables).
 *
 * `generatedOptions` se indexa ÚNICAMENTE por `stepNumber`.
 */
export const STATIONS = [
  {
    id: "idea",
    stepNumber: 0,
    title: "Calibrador de Alcance",
    subtitle: "Define tu idea y el propósito del desarrollo",
    skippable: false,
    defaultMood: "idle",
    defaultDialogue: "Cuéntame qué quieres armar y calibramos el camino.",
    blueprintKey: null,
    dbColumn: null,
    optionsKey: null,
  },
  {
    id: "naming",
    stepNumber: 1,
    title: "Naming del Proyecto",
    subtitle: "Propuestas de nombre comercial y técnico",
    skippable: true,
    defaultMood: "thinking",
    defaultDialogue:
      "Un buen nombre ahorra explicaciones. Elige uno o salta este paso.",
    blueprintKey: "selectedName",
    dbColumn: "selected_name",
    optionsKey: "names",
  },
  {
    id: "stack",
    stepNumber: 2,
    title: "Stack Tecnológico Dinámico",
    subtitle: "Combinaciones balanceadas adaptadas a tu alcance",
    skippable: false,
    defaultMood: "curious",
    defaultDialogue:
      "Elige según lo que dominas o mide tus tiempos si pruebas algo nuevo.",
    blueprintKey: "selectedStack",
    dbColumn: "selected_stack",
    optionsKey: "stacks",
  },
  {
    id: "architecture",
    stepNumber: 3,
    title: "Arquitectura Técnica",
    subtitle: "Patrón estructural de tu software",
    skippable: false,
    defaultMood: "thinking",
    defaultDialogue:
      "No metas microservicios para matar una mosca. Vamos por lo sensato.",
    blueprintKey: "selectedArchitecture",
    dbColumn: "selected_architecture",
    optionsKey: "options",
  },
  {
    id: "methodology",
    stepNumber: 4,
    title: "Metodología de Trabajo",
    subtitle: "Cadencia de sprints o flujo continuo",
    skippable: true,
    defaultMood: "working",
    defaultDialogue: "¿Trabajas con equipo o en solitario? Ajustemos el ritmo.",
    blueprintKey: "selectedMethodology",
    dbColumn: "selected_methodology",
    optionsKey: "options",
  },
  {
    id: "diagrams",
    stepNumber: 5,
    title: "Diagramas Dinámicos IA",
    subtitle: "Paquetes adaptativos sugeridos según el stack y la arquitectura",
    skippable: false,
    defaultMood: "curious",
    defaultDialogue:
      "La IA calcula qué diagramas son técnicamente necesarios aquí.",
    blueprintKey: "selectedDiagrams",
    dbColumn: "selected_diagrams",
    optionsKey: "options",
  },
  {
    id: "morphism",
    stepNumber: 6,
    title: "Lenguaje Visual / Morphism",
    subtitle: "Estilo cosmético y sensaciones de interfaz",
    skippable: false,
    defaultMood: "playful",
    defaultDialogue:
      "Elegir el estilo visual desde el inicio evita rediseñar tres veces.",
    blueprintKey: "selectedStyle",
    dbColumn: "selected_style",
    optionsKey: "options",
  },
  {
    id: "layout",
    stepNumber: 7,
    title: "Maquetación / Layout Pattern",
    subtitle: "Distribución espacial del producto",
    skippable: false,
    defaultMood: "thinking",
    defaultDialogue:
      "Un buen layout resuelve el 80% de la experiencia de usuario.",
    blueprintKey: "selectedLayout",
    dbColumn: "selected_layout",
    optionsKey: "options",
  },
  {
    id: "deploy",
    stepNumber: 8,
    title: "Infraestructura & Deploy",
    subtitle: "Hosting costo cero y respaldo en GitHub",
    skippable: false,
    defaultMood: "proud",
    defaultDialogue:
      "Hosting listo. Y recuerda: código que no está en GitHub, no existe.",
    blueprintKey: "selectedDeploy",
    dbColumn: "selected_deploy",
    optionsKey: "options",
  },
  {
    id: "ai-ecosystem",
    stepNumber: 9,
    title: "Ecosistema de IA",
    subtitle: "Modelos para el producto y copilots para programar",
    skippable: false,
    defaultMood: "celebrate",
    defaultDialogue: "El kit de aceleración listo para construir sin fricción.",
    blueprintKey: "selectedAiEcosystem",
    dbColumn: "selected_ai_ecosystem",
    optionsKey: "options",
  },
  {
    id: "workspace",
    stepNumber: 10,
    title: "¡A Trabajar!",
    subtitle: "Blueprint final, estructura de archivos y AGENTS.md",
    skippable: false,
    defaultMood: "celebrate",
    defaultDialogue: "¡Plano terminado! Copia tu contexto y ponte a construir.",
    blueprintKey: "architectureNotes",
    dbColumn: "architecture_notes",
    optionsKey: null,
  },
];

// Campos base del blueprint que no pertenecen a una estación de decisión.
const BASE_FIELDS = [
  { blueprintKey: "idea", dbColumn: "idea", empty: "" },
  { blueprintKey: "context", dbColumn: "context", empty: "startup" },
];

// Valor vacío de cada decisión (arrays para selecciones múltiples, "" para texto).
const EMPTY_VALUES = {
  selectedName: "",
  selectedDiagrams: [],
  architectureNotes: "",
};

/** Devuelve siempre una instancia nueva (nunca comparte el array vacío). */
export function getEmptyValue(blueprintKey) {
  if (!Object.prototype.hasOwnProperty.call(EMPTY_VALUES, blueprintKey)) {
    return null;
  }
  const value = EMPTY_VALUES[blueprintKey];
  return Array.isArray(value) ? [] : value;
}

/** Estaciones que persisten una decisión en el blueprint. */
export const DECISION_STATIONS = STATIONS.filter((s) => s.blueprintKey);

export const getStation = (stepNumber) =>
  STATIONS.find((s) => s.stepNumber === Number(stepNumber)) || null;

/** Blueprint vacío derivado del registro (instancia nueva en cada llamada). */
export const createInitialBlueprint = (overrides = {}) => ({
  ...Object.fromEntries(BASE_FIELDS.map((f) => [f.blueprintKey, f.empty])),
  ...Object.fromEntries(
    DECISION_STATIONS.map((s) => [
      s.blueprintKey,
      getEmptyValue(s.blueprintKey),
    ]),
  ),
  ...overrides,
});

/** ¿El valor representa una decisión tomada? */
export const hasDecisionValue = (value) =>
  Array.isArray(value) ? value.length > 0 : Boolean(value);

/** blueprint (camelCase, store) -> fila de la tabla `blueprints` (snake_case). */
export function blueprintToDbRow(blueprint = {}) {
  const row = {};
  BASE_FIELDS.forEach(({ blueprintKey, dbColumn, empty }) => {
    row[dbColumn] = blueprint[blueprintKey] || empty;
  });
  DECISION_STATIONS.forEach(({ blueprintKey, dbColumn }) => {
    const value = blueprint[blueprintKey];
    row[dbColumn] = hasDecisionValue(value)
      ? value
      : getEmptyValue(blueprintKey);
  });
  return row;
}

/** Fila de la tabla `blueprints` -> blueprint del store. */
export function dbRowToBlueprint(row = {}) {
  const blueprint = createInitialBlueprint();
  BASE_FIELDS.forEach(({ blueprintKey, dbColumn, empty }) => {
    blueprint[blueprintKey] = row[dbColumn] || empty;
  });
  DECISION_STATIONS.forEach(({ blueprintKey, dbColumn }) => {
    const value = row[dbColumn];
    blueprint[blueprintKey] = hasDecisionValue(value)
      ? value
      : getEmptyValue(blueprintKey);
  });
  return blueprint;
}
