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
 * Todo se indexa por el `id` de la estación (cartas generadas, prompts,
 * esquemas y contratos): reordenar o insertar estaciones no rompe datos
 * guardados. `stepNumber` solo define el orden del recorrido.
 */
export const STATIONS = [
  {
    id: "idea",
    phase: "definition",
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
    phase: "definition",
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
    id: "system-type",
    phase: "definition",
    stepNumber: 2,
    title: "Tipo de Sistema",
    navLabel: "Tipo de sistema",
    subtitle: "¿Qué tipo de producto vas a construir?",
    skippable: false,
    // Catálogo fijo: se resuelve en el cliente, sin llamar a Gemini
    local: true,
    defaultMood: "curious",
    defaultDialogue:
      "Leí tu idea y te muestro los tipos de sistema que mejor le encajan.",
    blueprintKey: "selectedSystemType",
    dbColumn: "selected_system_type",
    optionsKey: null,
    selection: "single",
  },
  {
    id: "requirements",
    phase: "definition",
    stepNumber: 3,
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
    phase: "definition",
    stepNumber: 4,
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
    phase: "technical",
    stepNumber: 5,
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
    phase: "technical",
    stepNumber: 6,
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
    phase: "technical",
    stepNumber: 7,
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
    phase: "technical",
    stepNumber: 8,
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
    phase: "design",
    stepNumber: 9,
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
    phase: "design",
    stepNumber: 10,
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
    phase: "design",
    stepNumber: 11,
    title: "Maquetación / Layout",
    navLabel: "Layout",
    subtitle: "¿Cómo se verá cada parte de tu producto?",
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
    phase: "delivery",
    stepNumber: 12,
    title: "Infraestructura & Deploy",
    navLabel: "Deploy",
    subtitle: "¿Dónde vivirá tu proyecto y cuánto costará?",
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
    phase: "delivery",
    stepNumber: 13,
    title: "Ecosistema de IA",
    navLabel: "Ecosistema IA",
    subtitle: "Las herramientas de IA con las que vas a programar",
    // Opcional: hay quien programa sin IA
    skippable: true,
    // Galería fija (src/data/aiTools.js): se resuelve en el cliente, sin Gemini
    local: true,
    defaultMood: "celebrate",
    defaultDialogue:
      "Toca una herramienta para ver en qué te ayuda y arma tu kit. Es opcional.",
    blueprintKey: "selectedAiEcosystem",
    dbColumn: "selected_ai_ecosystem",
    optionsKey: null,
    selection: "multi",
  },
  {
    id: "workspace",
    phase: "delivery",
    stepNumber: 14,
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

/**
 * Fases del recorrido: agrupan las estaciones por color (mapa y "Mi plano").
 * Las clases van completas para que Tailwind las detecte.
 */
export const PHASES = {
  definition: {
    label: "Definición",
    dot: "bg-amber-400",
    text: "text-amber-300",
    border: "border-amber-500/40",
    soft: "bg-amber-950/30",
    ring: "ring-amber-400/60",
  },
  technical: {
    label: "Técnica",
    dot: "bg-sky-400",
    text: "text-sky-300",
    border: "border-sky-500/40",
    soft: "bg-sky-950/30",
    ring: "ring-sky-400/60",
  },
  design: {
    label: "Diseño",
    dot: "bg-violet-400",
    text: "text-violet-300",
    border: "border-violet-500/40",
    soft: "bg-violet-950/30",
    ring: "ring-violet-400/60",
  },
  delivery: {
    label: "Entrega",
    dot: "bg-emerald-400",
    text: "text-emerald-300",
    border: "border-emerald-500/40",
    soft: "bg-emerald-950/30",
    ring: "ring-emerald-400/60",
  },
};

export const getPhase = (station) =>
  PHASES[station?.phase] || PHASES.definition;

export const LAST_STEP = STATIONS[STATIONS.length - 1].stepNumber;

// ---------- Modos del recorrido ----------

/**
 * Modos del recorrido: cuántas estaciones recorre el usuario. Un modo corto no
 * se salta lo esencial (qué es, qué hace, con qué se hace y dónde se guardan
 * los datos); lo omitido lo completa el cierre como "Sugerido por Dev-i".
 * `stations: null` = todas.
 */
export const MODES = {
  quick: {
    id: "quick",
    label: "Rápido",
    tagline: "Lo esencial para empezar a programar ya",
    stations: ["idea", "system-type", "requirements", "stack", "database", "workspace"],
  },
  standard: {
    id: "standard",
    label: "Estándar",
    tagline: "Estructura, diseño y deploy sin teoría de más",
    stations: [
      "idea", "naming", "system-type", "requirements", "stack", "database",
      "architecture", "morphism", "layout", "deploy", "workspace",
    ],
  },
  complete: {
    id: "complete",
    label: "Completo",
    tagline: "Todo el plano, ideal para la universidad",
    stations: null,
  },
};

export const DEFAULT_MODE = "complete";

/** Modo válido (los proyectos anteriores a los modos son "complete"). */
export const resolveMode = (mode) => (MODES[mode] ? mode : DEFAULT_MODE);

/** ¿La estación (id u objeto) forma parte del modo? */
export function isStationInMode(stationRef, mode) {
  const id = typeof stationRef === "string" ? stationRef : stationRef?.id;
  const list = MODES[resolveMode(mode)].stations;
  return !list || list.includes(id);
}

/** Estaciones del recorrido en ese modo, en orden. */
export const stationsInMode = (mode) =>
  STATIONS.filter((s) => isStationInMode(s, mode));

/** Estaciones que el modo deja fuera (para el cierre y los prompts). */
export const stationsOutOfMode = (mode) =>
  STATIONS.filter((s) => !isStationInMode(s, mode));

/** Siguiente paso del modo después de `step` (o null si es el último). */
export function nextStepInMode(step, mode) {
  return (
    stationsInMode(mode).find((s) => s.stepNumber > Number(step))?.stepNumber ??
    null
  );
}

/** Paso anterior del modo antes de `step` (mínimo 0). */
export function prevStepInMode(step, mode) {
  const before = stationsInMode(mode).filter((s) => s.stepNumber < Number(step));
  return before.length ? before[before.length - 1].stepNumber : 0;
}

// Campos base del blueprint que no pertenecen a una estación de decisión.
const BASE_FIELDS = [
  { blueprintKey: "idea", dbColumn: "idea", empty: "" },
  { blueprintKey: "context", dbColumn: "context", empty: "startup" },
  { blueprintKey: "mode", dbColumn: "mode", empty: DEFAULT_MODE },
];

// Valor vacío de cada decisión (arrays para selecciones múltiples, "" para texto).
const EMPTY_VALUES = {
  selectedName: "",
  selectedRequirements: [],
  selectedUserStories: [],
  selectedDiagrams: [],
  selectedAiEcosystem: [],
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

/** Estación por id ("stack") o por número de paso (5 / "5"). */
export function resolveStation(ref) {
  if (typeof ref === "number" || /^\d+$/.test(String(ref))) {
    return getStation(ref);
  }
  return getStationById(ref);
}

/**
 * Orden de las estaciones cuando `generatedOptions` se indexaba por número
 * (versión 4 del mapa, con "Tipo de sistema" como estación 2). Congelado: solo
 * sirve para convertir datos antiguos, no cambia aunque se reordene el mapa.
 */
const LEGACY_STEP_IDS_V4 = [
  "idea",
  "naming",
  "system-type",
  "requirements",
  "user-stories",
  "stack",
  "database",
  "architecture",
  "methodology",
  "diagrams",
  "morphism",
  "layout",
  "deploy",
  "ai-ecosystem",
  "workspace",
];

/** Versión 3 del mapa: igual que la 4 pero sin "Tipo de sistema". */
const LEGACY_STEP_IDS_V3 = LEGACY_STEP_IDS_V4.filter(
  (id) => id !== "system-type",
);

const isPlainObject = (value) =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Cartas generadas indexadas por id. Acepta datos antiguos con claves
 * numéricas (se traducen con el orden congelado de `legacyVersion`) y
 * descarta claves desconocidas o valores que no sean objetos.
 */
export function toIdKeyedOptions(options, legacyVersion = 4) {
  if (!isPlainObject(options)) return {};
  const legacyIds =
    legacyVersion === 3 ? LEGACY_STEP_IDS_V3 : LEGACY_STEP_IDS_V4;
  const result = {};
  Object.entries(options).forEach(([key, value]) => {
    const id = /^\d+$/.test(key) ? legacyIds[Number(key)] : key;
    if (id && getStationById(id) && isPlainObject(value)) result[id] = value;
  });
  return result;
}

/** Paso más avanzado con cartas generadas (0 si no hay ninguna). */
export function highestStepOf(options = {}) {
  return Object.keys(options).reduce(
    (max, id) => Math.max(max, getStationById(id)?.stepNumber ?? 0),
    0,
  );
}

/** Cartas de la estación en el paso `stepNumber`. */
export const optionsForStep = (options = {}, stepNumber) =>
  options[getStation(stepNumber)?.id];

/**
 * Cartas generadas listas para guardar en `blueprints.generated_options`:
 * indexadas por id, solo estaciones válidas y objetos (descarta basura del
 * cliente).
 */
export function sanitizeGeneratedOptions(options) {
  return toIdKeyedOptions(options);
}
