/**
 * Registro único de estaciones de Dev.Idea.
 *
 * Cada estación declara cómo se persiste su decisión:
 * - blueprintKey: propiedad del `blueprint` en el store (null si no decide nada).
 * - dbColumn:     columna equivalente en la tabla `blueprints` de Supabase.
 * - optionsKey:   propiedad de la respuesta de Gemini que contiene la lista de opciones
 *                 (null si la estación no muestra opciones seleccionables).
 * - selection:    "single" (una carta) o "multi" (varias cartas; se guarda un array).
 * - legend:       etiquetas de los 3 niveles (simple / medium / advanced) de sus cartas.
 *
 * `generatedOptions` se indexa ÚNICAMENTE por `stepNumber`.
 * Prompts, esquemas y contratos se indexan por `id` (no dependen del orden).
 */
export const STATIONS = [
  {
    id: "idea",
    stepNumber: 0,
    title: "Calibrador de Alcance",
    navLabel: "Entrada",
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
    navLabel: "Naming",
    subtitle: "Bautiza tu proyecto de software",
    skippable: true,
    defaultMood: "thinking",
    defaultDialogue:
      "Un buen nombre ahorra explicaciones. Elige uno o salta este paso.",
    blueprintKey: "selectedName",
    dbColumn: "selected_name",
    optionsKey: "names",
    selection: "single",
  },
  {
    id: "requirements",
    stepNumber: 2,
    title: "Requisitos",
    navLabel: "Requisitos",
    subtitle: "Módulos con requisitos funcionales y no funcionales",
    skippable: false,
    defaultMood: "thinking",
    defaultDialogue:
      "Antes de elegir tecnología hay que saber QUÉ debe hacer tu software.",
    blueprintKey: "selectedRequirements",
    dbColumn: "selected_requirements",
    optionsKey: "options",
    selection: "multi",
    legend: {
      label: "Prioridad",
      simple: "Esencial (MVP)",
      medium: "Importante",
      advanced: "Futuro",
    },
  },
  {
    id: "user-stories",
    stepNumber: 3,
    title: "Historias de Usuario",
    navLabel: "Historias",
    subtitle: "Lo que cada usuario necesita, contado en su idioma",
    skippable: true,
    defaultMood: "curious",
    defaultDialogue:
      "Una historia de usuario convierte un requisito en algo que se puede probar.",
    blueprintKey: "selectedUserStories",
    dbColumn: "selected_user_stories",
    optionsKey: "options",
    selection: "multi",
    legend: {
      label: "Prioridad",
      simple: "Alta",
      medium: "Media",
      advanced: "Baja",
    },
  },
  {
    id: "stack",
    stepNumber: 4,
    title: "Stack Tecnológico",
    navLabel: "Stack",
    subtitle: "Combinaciones balanceadas a tu medida",
    skippable: false,
    defaultMood: "curious",
    defaultDialogue:
      "Elige según lo que dominas o mide tus tiempos si pruebas algo nuevo.",
    blueprintKey: "selectedStack",
    dbColumn: "selected_stack",
    optionsKey: "stacks",
    selection: "single",
    legend: {
      label: "Dificultad",
      simple: "Ágil / Directo",
      medium: "Pragmático",
      advanced: "Enterprise",
    },
  },
  {
    id: "database",
    stepNumber: 5,
    title: "Base de Datos",
    navLabel: "Base de datos",
    subtitle: "¿Dónde y cómo se guardará la información?",
    skippable: false,
    defaultMood: "thinking",
    defaultDialogue:
      "No todo proyecto necesita base de datos. Elige lo justo para tus datos.",
    blueprintKey: "selectedDatabase",
    dbColumn: "selected_database",
    optionsKey: "options",
    selection: "single",
    legend: {
      label: "Complejidad",
      simple: "Sin servidor / Simple",
      medium: "Pragmática",
      advanced: "Avanzada",
    },
  },
  {
    id: "architecture",
    stepNumber: 6,
    title: "Arquitectura Técnica",
    navLabel: "Arquitectura",
    subtitle: "Patrón estructural de tu software",
    skippable: false,
    defaultMood: "thinking",
    defaultDialogue:
      "No metas microservicios para matar una mosca. Vamos por lo sensato.",
    blueprintKey: "selectedArchitecture",
    dbColumn: "selected_architecture",
    optionsKey: "options",
    selection: "single",
    legend: {
      label: "Complejidad",
      simple: "Simple / Rápido",
      medium: "Pragmático",
      advanced: "Avanzado",
    },
  },
  {
    id: "methodology",
    stepNumber: 7,
    title: "Metodología de Trabajo",
    navLabel: "Metodología",
    subtitle: "Cadencia de sprints y flujo de desarrollo",
    skippable: true,
    defaultMood: "working",
    defaultDialogue: "¿Trabajas con equipo o en solitario? Ajustemos el ritmo.",
    blueprintKey: "selectedMethodology",
    dbColumn: "selected_methodology",
    optionsKey: "options",
    selection: "single",
    legend: {
      label: "Carga operativa",
      simple: "Cero fricción",
      medium: "Iterativo",
      advanced: "Estructurado",
    },
  },
  {
    id: "diagrams",
    stepNumber: 8,
    title: "Diagramas",
    navLabel: "Diagramas",
    subtitle: "Los diagramas que de verdad aportan a tu proyecto",
    skippable: false,
    defaultMood: "curious",
    defaultDialogue:
      "Elige los diagramas que vas a dibujar: ni uno de más, ni uno de menos.",
    blueprintKey: "selectedDiagrams",
    dbColumn: "selected_diagrams",
    optionsKey: "options",
    selection: "multi",
    legend: {
      label: "Profundidad",
      simple: "Básico",
      medium: "Intermedio",
      advanced: "Detallado",
    },
  },
  {
    id: "morphism",
    stepNumber: 9,
    title: "Lenguaje Visual",
    navLabel: "Estilo visual",
    subtitle: "Personalidad visual y estilo de interfaz",
    skippable: false,
    defaultMood: "playful",
    defaultDialogue:
      "Elegir el estilo visual desde el inicio evita rediseñar tres veces.",
    blueprintKey: "selectedStyle",
    dbColumn: "selected_style",
    optionsKey: "options",
    selection: "single",
  },
  {
    id: "layout",
    stepNumber: 10,
    title: "Maquetación / Layout",
    navLabel: "Layout",
    subtitle: "Distribución espacial del producto",
    skippable: false,
    defaultMood: "thinking",
    defaultDialogue:
      "Un buen layout resuelve el 80% de la experiencia de usuario.",
    blueprintKey: "selectedLayout",
    dbColumn: "selected_layout",
    optionsKey: "options",
    selection: "single",
    legend: {
      label: "Complejidad",
      simple: "Directo",
      medium: "Equilibrado",
      advanced: "Rico en vistas",
    },
  },
  {
    id: "deploy",
    stepNumber: 11,
    title: "Infraestructura & Deploy",
    navLabel: "Deploy",
    subtitle: "Hosting costo cero y respaldo en GitHub",
    skippable: false,
    defaultMood: "proud",
    defaultDialogue:
      "Hosting listo. Y recuerda: código que no está en GitHub, no existe.",
    blueprintKey: "selectedDeploy",
    dbColumn: "selected_deploy",
    optionsKey: "options",
    selection: "single",
    legend: {
      label: "Complejidad",
      simple: "Un clic",
      medium: "Configurable",
      advanced: "Control total",
    },
  },
  {
    id: "ai-ecosystem",
    stepNumber: 12,
    title: "Ecosistema de IA",
    navLabel: "Ecosistema IA",
    subtitle: "Modelos para el producto y copilots para programar",
    skippable: false,
    defaultMood: "celebrate",
    defaultDialogue: "El kit de aceleración listo para construir sin fricción.",
    blueprintKey: "selectedAiEcosystem",
    dbColumn: "selected_ai_ecosystem",
    optionsKey: "options",
    selection: "single",
    legend: {
      label: "Nivel",
      simple: "Gratis / Básico",
      medium: "Equilibrado",
      advanced: "Avanzado",
    },
  },
  {
    id: "workspace",
    stepNumber: 13,
    title: "¡A Trabajar!",
    navLabel: "¡A Trabajar!",
    subtitle: "Blueprint final, estructura de archivos y AGENTS.md",
    skippable: false,
    defaultMood: "celebrate",
    defaultDialogue: "¡Plano terminado! Copia tu contexto y ponte a construir.",
    blueprintKey: "architectureNotes",
    dbColumn: "architecture_notes",
    optionsKey: null,
  },
];

export const LAST_STEP = STATIONS[STATIONS.length - 1].stepNumber;

// Campos base del blueprint que no pertenecen a una estación de decisión.
const BASE_FIELDS = [
  { blueprintKey: "idea", dbColumn: "idea", empty: "" },
  { blueprintKey: "context", dbColumn: "context", empty: "startup" },
];

// Valor vacío de cada decisión (arrays para selecciones múltiples, "" para texto).
const EMPTY_VALUES = {
  selectedName: "",
  selectedRequirements: [],
  selectedUserStories: [],
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

export const getStationById = (id) => STATIONS.find((s) => s.id === id) || null;

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

/**
 * Cartas generadas listas para guardar en `blueprints.generated_options`:
 * solo claves de estaciones válidas y objetos (descarta basura del cliente).
 */
export function sanitizeGeneratedOptions(options) {
  if (!options || typeof options !== "object" || Array.isArray(options)) {
    return {};
  }
  return Object.fromEntries(
    Object.entries(options).filter(
      ([key, value]) =>
        getStation(key) &&
        value !== null &&
        typeof value === "object" &&
        !Array.isArray(value),
    ),
  );
}
