/**
 * Catálogo de BASES DE DATOS populares y sus ADMINISTRADORES (programas para
 * ver y editar los datos). Lo usa la estación Base de datos:
 * - el interruptor "¿Tu proyecto guardará datos?" (valor inicial según el tipo
 *   de sistema y el stack),
 * - el desplegable "¿Ya tienes una favorita?" (Gemini la pone primera),
 * - el desplegable de administrador, que depende de la base elegida.
 * Catálogo fijo: no lo genera Gemini.
 */

export const ADMIN_TOOLS = {
  pgadmin: { label: "pgAdmin", hint: "El administrador oficial de PostgreSQL. Gratis." },
  workbench: { label: "MySQL Workbench", hint: "Diseña tablas y diagramas de MySQL visualmente." },
  phpmyadmin: { label: "phpMyAdmin", hint: "Administrador web clásico (viene en XAMPP)." },
  heidisql: { label: "HeidiSQL", hint: "Ligero y gratis, muy usado en Windows." },
  dbeaver: { label: "DBeaver", hint: "Gratis y universal: sirve para casi cualquier base." },
  tableplus: { label: "TablePlus", hint: "Moderno y rápido (versión gratuita limitada)." },
  datagrip: { label: "DataGrip", hint: "De JetBrains: muy completo (gratis para estudiantes)." },
  "sqlite-browser": { label: "DB Browser for SQLite", hint: "Abre el archivo .db y lo editas como una tabla." },
  ssms: { label: "SQL Server Management Studio", hint: "La herramienta oficial de SQL Server." },
  "vscode-mssql": { label: "Extensión SQL Server de VS Code", hint: "Consulta SQL Server sin salir del editor." },
  "sql-developer": { label: "Oracle SQL Developer", hint: "La herramienta oficial de Oracle. Gratis." },
  compass: { label: "MongoDB Compass", hint: "El administrador oficial y gratis de MongoDB." },
  "atlas-ui": { label: "Panel web de MongoDB Atlas", hint: "Si tu base vive en Atlas, la ves desde el navegador." },
  "supabase-studio": { label: "Supabase Studio", hint: "El panel web de Supabase: tablas, auth y storage." },
  "firebase-console": { label: "Consola de Firebase", hint: "Ves y editas Firestore desde el navegador." },
  "redis-insight": { label: "Redis Insight", hint: "El visor oficial y gratis de Redis." },
  "neon-console": { label: "Consola de Neon", hint: "Editor de tablas y SQL en el navegador." },
  "prisma-studio": { label: "Prisma Studio", hint: "Si usas Prisma, ves tus datos con un comando." },
  "drizzle-studio": { label: "Drizzle Studio", hint: "Si usas Drizzle, ves tus datos con un comando." },
};

export const DATABASES = [
  { id: "postgresql", label: "PostgreSQL", dbType: "relational", match: /postgres/i, admins: ["pgadmin", "dbeaver", "tableplus", "datagrip"] },
  { id: "mysql", label: "MySQL", dbType: "relational", match: /mysql/i, admins: ["workbench", "phpmyadmin", "dbeaver", "heidisql", "tableplus"] },
  { id: "mariadb", label: "MariaDB", dbType: "relational", match: /maria/i, admins: ["heidisql", "phpmyadmin", "dbeaver", "tableplus"] },
  { id: "sqlite", label: "SQLite", dbType: "embedded", match: /sqlite|turso|libsql/i, admins: ["sqlite-browser", "dbeaver", "tableplus"] },
  { id: "sqlserver", label: "SQL Server", dbType: "relational", match: /sql server|mssql|azure sql/i, admins: ["ssms", "vscode-mssql", "dbeaver", "datagrip"] },
  { id: "oracle", label: "Oracle", dbType: "relational", match: /oracle/i, admins: ["sql-developer", "dbeaver", "datagrip"] },
  { id: "mongodb", label: "MongoDB", dbType: "document", match: /mongo/i, admins: ["compass", "atlas-ui", "dbeaver"] },
  { id: "supabase", label: "Supabase (PostgreSQL)", dbType: "baas", match: /supabase/i, admins: ["supabase-studio", "dbeaver", "tableplus", "pgadmin"] },
  { id: "neon", label: "Neon (PostgreSQL)", dbType: "relational", match: /neon/i, admins: ["neon-console", "pgadmin", "dbeaver", "tableplus"] },
  { id: "firebase", label: "Firebase Firestore", dbType: "baas", match: /firebase|firestore/i, admins: ["firebase-console"] },
  { id: "redis", label: "Redis", dbType: "key-value", match: /redis|upstash|valkey/i, admins: ["redis-insight"] },
];

export const getDatabase = (id) => DATABASES.find((d) => d.id === id) || null;
export const getAdminTool = (id) =>
  ADMIN_TOOLS[id] ? { id, ...ADMIN_TOOLS[id] } : null;

/**
 * Motor de una carta de base de datos (por su título y piezas). Supabase y Neon
 * van antes que PostgreSQL para no confundirlos con un Postgres propio.
 */
const MATCH_ORDER = ["supabase", "neon", "firebase", "mariadb", "sqlite", "sqlserver", "oracle", "mongodb", "redis", "mysql", "postgresql"];
export function detectDatabase(option) {
  if (!option) return null;
  const text = `${option.title || ""} ${(option.techs || []).join(" ")}`;
  for (const id of MATCH_ORDER) {
    const db = getDatabase(id);
    if (db.match.test(text)) return db;
  }
  return null;
}

/** Administradores para una carta: los de su motor + los visores de su ORM. */
export function adminToolsFor(option) {
  const db = detectDatabase(option);
  const ids = [...(db?.admins || ["dbeaver", "tableplus"])];
  const techs = (option?.techs || []).join(" ");
  if (/prisma/i.test(techs)) ids.push("prisma-studio");
  if (/drizzle/i.test(techs)) ids.push("drizzle-studio");
  return [...new Set(ids)].map(getAdminTool).filter(Boolean);
}

/** Tipos de sistema que sin guardar datos no funcionan. */
const NEEDS_DATA = new Set([
  "pos", "inventory", "erp-lite", "crm", "records", "helpdesk", "booking", "events",
  "ecommerce", "marketplace", "saas", "lms", "community", "dashboard", "mobile-app",
]);
/** Superficies que casi siempre guardan datos. */
const DATA_SURFACES = ["admin", "app", "store", "booking"];
/** Piezas del stack que ya traen base de datos. */
const STACK_WITH_DATA = /supabase|firebase|firestore|mongo|postgres|mysql|sqlite|pocketbase|appwrite/i;
/** Stacks sin backend propio (solo pueden usar BaaS o el navegador). */
const STATIC_STACK = /html|vanilla|astro|estático|static|github pages/i;

/**
 * ¿El proyecto debería guardar datos? Da el valor inicial del interruptor.
 * @returns {{ needed: boolean, strong: boolean, reason: string, staticStack: boolean }}
 *   strong = apagarlo rompería el sistema (Dev-i avisa).
 */
export function recommendDataStorage(blueprint = {}) {
  const type = blueprint.selectedSystemType;
  const surfaces = type?.surfaces || [];
  const stack = blueprint.selectedStack;
  const stackText = `${stack?.title || ""} ${(stack?.tags || []).join(" ")}`;
  const staticStack = STATIC_STACK.test(stackText) && !/next|laravel|django|express|nest|spring|asp\.net|fastapi/i.test(stackText);

  if (type && NEEDS_DATA.has(type.id)) {
    return {
      needed: true,
      strong: true,
      staticStack,
      reason: `Un sistema de tipo «${type.title}» necesita guardar información (usuarios, registros, pedidos…).`,
    };
  }
  if (surfaces.length > 0 && surfaces.every((s) => s === "api")) {
    return {
      needed: true,
      strong: false,
      staticStack,
      reason: "Una API o un bot casi siempre guarda algo (usuarios, mensajes, recordatorios). Si solo responde sin recordar nada, puedes apagarlo.",
    };
  }
  if (surfaces.some((s) => DATA_SURFACES.includes(s))) {
    return {
      needed: true,
      strong: false,
      staticStack,
      reason: "Tu sistema tiene partes con datos que cambian (panel, cuentas o pedidos): conviene guardarlos.",
    };
  }
  if (STACK_WITH_DATA.test(stackText)) {
    return {
      needed: true,
      strong: false,
      staticStack,
      reason: `Tu stack (${stack.title}) ya trae dónde guardar datos.`,
    };
  }
  return {
    needed: false,
    strong: false,
    staticStack,
    reason: "Tu sistema muestra información fija: el contenido puede vivir en el código, sin base de datos.",
  };
}

/** Decisión de "sin base de datos" (no gasta generación de IA). */
export const NO_DATABASE_DECISION = Object.freeze({
  id: "db-none",
  level: "simple",
  title: "Sin base de datos",
  tag: "Sin persistencia",
  dbType: "none",
  summary: "El contenido vive en el código o en archivos (JSON/Markdown). No hay datos de usuarios que guardar.",
  beginnerTip: "Como un folleto impreso: muestra información, pero no anota nada nuevo.",
  techs: [],
});
