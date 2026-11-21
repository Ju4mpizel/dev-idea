/**
 * Preferencias del ENTORNO de desarrollo (estación Stack): gestor de paquetes,
 * editor, sistema operativo y cómo se trabajará con IA.
 *
 * Catálogo fijo (sin Gemini). El gestor depende del ecosistema del stack
 * elegido: npm/pnpm/yarn/bun solo tienen sentido en JavaScript, pip/uv/Poetry
 * en Python, etc. Se guardan dentro de la decisión del stack
 * (`selectedStack.preferences`) y los usan el cierre, los comandos y AGENTS.md
 * para no obligar a nadie a usar, por ejemplo, pnpm.
 */

/** Ecosistemas con su gestor de paquetes. El primero es el de serie. */
export const ECOSYSTEMS = {
  node: {
    label: "JavaScript / Node",
    managers: [
      { id: "npm", label: "npm", hint: "Viene con Node. El más simple para empezar." },
      { id: "pnpm", label: "pnpm", hint: "Rápido y ahorra espacio en disco." },
      { id: "yarn", label: "Yarn", hint: "Clásico en muchos proyectos de empresa." },
      { id: "bun", label: "Bun", hint: "Runtime y gestor ultrarrápido (más nuevo)." },
    ],
  },
  python: {
    label: "Python",
    managers: [
      { id: "pip", label: "pip + venv", hint: "El estándar que viene con Python." },
      { id: "uv", label: "uv", hint: "Moderno y muy rápido; maneja el venv solo." },
      { id: "poetry", label: "Poetry", hint: "Dependencias y empaquetado en un archivo." },
    ],
  },
  php: {
    label: "PHP",
    managers: [{ id: "composer", label: "Composer", hint: "El gestor de PHP." }],
  },
  jvm: {
    label: "Java / Kotlin",
    managers: [
      { id: "maven", label: "Maven", hint: "pom.xml: el más usado en Java." },
      { id: "gradle", label: "Gradle", hint: "Más flexible; el de serie en Kotlin y Android." },
    ],
  },
  dotnet: {
    label: "C# / .NET",
    managers: [{ id: "dotnet", label: "dotnet CLI (NuGet)", hint: "Viene con el SDK de .NET." }],
  },
  go: {
    label: "Go",
    managers: [{ id: "go", label: "Go modules", hint: "Integrado en Go." }],
  },
  ruby: {
    label: "Ruby",
    managers: [{ id: "bundler", label: "Bundler", hint: "Gemfile: el estándar de Ruby." }],
  },
  dart: {
    label: "Dart / Flutter",
    managers: [{ id: "pub", label: "pub (flutter pub)", hint: "Integrado en Flutter." }],
  },
  rust: {
    label: "Rust",
    managers: [{ id: "cargo", label: "Cargo", hint: "Integrado en Rust." }],
  },
};

/** Lenguaje elegido -> ecosistema. */
const LANGUAGE_ECOSYSTEM = [
  [/typescript|javascript|\bjs\b|\bts\b|node/i, "node"],
  [/python/i, "python"],
  [/php/i, "php"],
  [/kotlin|java\b|java$/i, "jvm"],
  [/c#|csharp|\.net|dotnet|f#/i, "dotnet"],
  [/\bgo\b|golang/i, "go"],
  [/ruby/i, "ruby"],
  [/dart|flutter/i, "dart"],
  [/rust/i, "rust"],
];

/** Piezas que delatan un frontend JavaScript aparte del backend. */
const JS_FRONTEND =
  /\b(react|next|vue|nuxt|svelte|angular|astro|vite|remix|solid|expo|react native)/i;

export function ecosystemOfLanguage(language = "") {
  return LANGUAGE_ECOSYSTEM.find(([re]) => re.test(language))?.[1] || null;
}

/**
 * Ecosistemas del stack: el del lenguaje y, si el backend no es JavaScript
 * pero el frontend sí (Django + React), también Node para el frontend.
 * @returns {{ id: string, role: "main"|"frontend" }[]}
 */
export function stackEcosystems(stack) {
  if (!stack) return [];
  const main = ecosystemOfLanguage(stack.selectedLanguage || stack.defaultLanguage || "");
  const text = `${stack.title || ""} ${(stack.tags || []).join(" ")}`;
  const list = main ? [{ id: main, role: "main" }] : [];
  if (main !== "node" && JS_FRONTEND.test(text)) {
    list.push({ id: "node", role: main ? "frontend" : "main" });
  }
  return list;
}

export const EDITORS = [
  { id: "vscode", label: "VS Code", open: "code ." },
  { id: "cursor", label: "Cursor", open: "cursor ." },
  { id: "windsurf", label: "Windsurf", open: "windsurf ." },
  { id: "jetbrains", label: "JetBrains (IntelliJ, PyCharm, WebStorm…)", open: null },
  { id: "visual-studio", label: "Visual Studio", open: null },
  { id: "android-studio", label: "Android Studio", open: null },
  { id: "zed", label: "Zed", open: "zed ." },
  { id: "neovim", label: "Neovim / Vim", open: "nvim ." },
];

/** Editor sugerido según el ecosistema principal. */
const EDITOR_BY_ECOSYSTEM = {
  dotnet: "visual-studio",
  dart: "vscode",
  jvm: "jetbrains",
};

export const OPERATING_SYSTEMS = [
  { id: "windows", label: "Windows", shell: "PowerShell" },
  { id: "macos", label: "macOS", shell: "Terminal (zsh)" },
  { id: "linux", label: "Linux", shell: "Bash" },
];

export const AI_MODES = [
  { id: "agent", label: "Con un agente (Claude Code, Codex…)", kind: "agent" },
  { id: "ide", label: "Con un editor con IA (Cursor, Copilot…)", kind: "ide" },
  { id: "chat", label: "Preguntando en un chat", kind: "chat" },
  { id: "none", label: "Sin IA, a mano", kind: null },
];

const find = (list, id) => list.find((x) => x.id === id) || null;
export const getEditor = (id) => find(EDITORS, id);
export const getOperatingSystem = (id) => find(OPERATING_SYSTEMS, id);
export const getAiMode = (id) => find(AI_MODES, id);
export const getManager = (ecosystemId, managerId) =>
  find(ECOSYSTEMS[ecosystemId]?.managers || [], managerId);

/** SO del navegador, como valor inicial (el usuario lo puede cambiar). */
export function detectOperatingSystem() {
  if (typeof navigator === "undefined") return "windows";
  const ua = `${navigator.userAgentData?.platform || ""} ${navigator.userAgent || ""}`;
  if (/mac|iphone|ipad/i.test(ua)) return "macos";
  if (/linux|android|x11/i.test(ua) && !/windows/i.test(ua)) return "linux";
  return "windows";
}

/**
 * Preferencias completas para un stack: respeta lo elegido y rellena lo que
 * falte con valores de serie. Un gestor que no pertenece al ecosistema del
 * stack (p. ej. pnpm en un stack Python) se descarta.
 */
export function resolvePreferences(stack, chosen = {}) {
  const ecosystems = stackEcosystems(stack);
  const managers = {};
  ecosystems.forEach(({ id }) => {
    const options = ECOSYSTEMS[id].managers;
    const picked = chosen.managers?.[id];
    managers[id] = options.some((m) => m.id === picked) ? picked : options[0].id;
  });
  const main = ecosystems[0]?.id;
  return {
    managers,
    editor: getEditor(chosen.editor)?.id || EDITOR_BY_ECOSYSTEM[main] || "vscode",
    os: getOperatingSystem(chosen.os)?.id || detectOperatingSystem(),
    ai: getAiMode(chosen.ai)?.id || "agent",
  };
}

/** Gestor principal de Node (o null si el stack no usa JavaScript). */
export const nodeManagerOf = (preferences) => preferences?.managers?.node || null;

/** Frase legible para prompts, AGENTS.md y el resumen. */
export function describePreferences(preferences) {
  if (!preferences) return "";
  const parts = Object.entries(preferences.managers || {}).map(
    ([eco, id]) => `${ECOSYSTEMS[eco]?.label || eco}: ${getManager(eco, id)?.label || id}`,
  );
  const os = getOperatingSystem(preferences.os);
  const editor = getEditor(preferences.editor);
  const ai = getAiMode(preferences.ai);
  if (parts.length) parts[0] = `gestor de paquetes ${parts[0]}`;
  if (editor) parts.push(`editor ${editor.label}`);
  if (os) parts.push(`sistema ${os.label} (${os.shell})`);
  if (ai) parts.push(`IA: ${ai.label}`);
  return parts.join(" · ");
}

// ---------- Comandos de Node con el gestor elegido ----------

/** Subcomandos propios de npm que no se pueden escribir como "npm <script>". */
const NPM_BUILTINS = new Set([
  "install", "i", "ci", "add", "remove", "rm", "uninstall", "un", "update", "up",
  "run", "exec", "init", "create", "test", "start", "publish", "link", "audit",
  "outdated", "list", "ls", "dlx", "x", "why", "info", "pack", "config",
]);

/**
 * npx tiene dos usos: descargar y ejecutar un paquete ("npx shadcn@latest
 * init") o correr un binario ya instalado ("npx prisma migrate dev").
 * "npx create-vite" es lo mismo que "<gestor> create vite" (vale en todos).
 */
function toDlx(rawArgs) {
  // "-y" / "--yes" solo confirman la descarga en npx: los otros gestores no los usan
  const args = rawArgs.filter((a) => a !== "-y" && a !== "--yes");
  const [pkg = "", ...rest] = args;
  if (pkg.startsWith("create-")) {
    return { action: "create", args: [pkg.slice("create-".length), ...rest] };
  }
  // Con versión ("@latest") o scope de paquete remoto -> descarga
  const isRemote = /.@/.test(pkg) || pkg.startsWith("--package");
  return { action: isRemote ? "dlx" : "exec", args };
}

/** Separa un comando de gestor de Node: { action, args } o null. */
function parseNodeCommand(command) {
  const m = /^\s*(npx|pnpx|bunx|npm|pnpm|yarn|bun)(?:\s+(.*))?$/.exec(command);
  if (!m) return null;
  const [, tool, rest = ""] = m;
  const words = rest.trim().split(/\s+/).filter(Boolean);
  if (tool === "npx" || tool === "pnpx" || tool === "bunx") {
    return toDlx(words);
  }
  const [sub = "install", ...args] = words;
  if (["install", "i", "ci"].includes(sub)) {
    // "npm install paquete" = agregar dependencia
    return args.some((a) => !a.startsWith("-"))
      ? { action: "add", args }
      : { action: "install", args };
  }
  if (sub === "add") return { action: "add", args };
  if (["remove", "rm", "uninstall", "un"].includes(sub)) return { action: "remove", args };
  if (sub === "run") return { action: "run", args };
  if (sub === "create" || sub === "init") {
    // "npm init vite" = "npm create vite"; "npm init -y" queda como init
    return args.length && !args[0].startsWith("-")
      ? { action: "create", args }
      : { action: "init", args };
  }
  if (sub === "dlx" || sub === "exec" || sub === "x") return toDlx(args);
  if (sub === "test" || sub === "start") return { action: "run", args: [sub, ...args] };
  if (NPM_BUILTINS.has(sub)) return null; // otro subcomando: se deja igual
  // "pnpm dev", "yarn build", "bun dev": atajo de script
  return { action: "run", args: [sub, ...args] };
}

const join = (...parts) => parts.flat().filter(Boolean).join(" ");

function formatNodeCommand(manager, { action, args }) {
  const isNpm = manager === "npm";
  switch (action) {
    case "install":
      return join(manager, "install", args);
    case "add":
      return isNpm
        ? join("npm install", args)
        : join(manager, "add", args.map((a) => (a === "--save-dev" ? "-D" : a)));
    case "remove":
      return join(manager, isNpm ? "uninstall" : "remove", args);
    case "run": {
      const [script, ...rest] = args;
      if (isNpm) {
        const short = script === "test" || script === "start";
        return join("npm", short ? null : "run", script, rest.length ? ["--", ...rest] : []);
      }
      // "bun build" y "bun test" son comandos propios de Bun: siempre "bun run"
      return join(manager, manager === "bun" ? "run" : null, script, rest);
    }
    case "exec":
      return manager === "npm"
        ? join("npx", args)
        : manager === "pnpm"
          ? join("pnpm exec", args)
          : manager === "bun"
            ? join("bunx", args)
            : join("yarn", args);
    case "create":
      return join(manager, "create", args);
    case "init":
      return join(manager, "init", args);
    case "dlx":
      return manager === "npm"
        ? join("npx", args)
        : manager === "bun"
          ? join("bunx", args)
          : join(manager, "dlx", args);
    default:
      return null;
  }
}

/**
 * Reescribe los comandos de Node al gestor elegido ("pnpm dev" -> "npm run
 * dev"). Lo que no reconoce (git, cd, python...) queda tal cual.
 */
export function adaptNodeCommands(commands = [], manager) {
  if (!manager || !ECOSYSTEMS.node.managers.some((m) => m.id === manager)) {
    return commands;
  }
  return commands.map((command) =>
    command
      .split(/(\s*&&\s*)/)
      .map((part) => {
        const parsed = parseNodeCommand(part);
        if (!parsed) return part;
        return formatNodeCommand(manager, parsed) || part;
      })
      .join(""),
  );
}

/** Comandos de serie si la IA no devolvió ninguno. */
export function defaultCommands(preferences) {
  const node = nodeManagerOf(preferences);
  if (node) return adaptNodeCommands(["npm install", "npm run dev"], node);
  const python = preferences?.managers?.python;
  if (python === "uv") return ["uv sync", "uv run python main.py"];
  if (python === "poetry") return ["poetry install", "poetry run python main.py"];
  if (python) {
    return preferences?.os === "windows"
      ? ["python -m venv .venv", ".venv\\Scripts\\Activate.ps1", "pip install -r requirements.txt"]
      : ["python -m venv .venv", "source .venv/bin/activate", "pip install -r requirements.txt"];
  }
  return ["git init"];
}
