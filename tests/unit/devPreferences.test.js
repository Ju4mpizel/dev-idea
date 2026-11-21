import { describe, expect, it } from "vitest";
import {
  adaptNodeCommands,
  defaultCommands,
  describePreferences,
  ecosystemOfLanguage,
  resolvePreferences,
  stackEcosystems,
} from "@/data/devPreferences";

describe("adaptNodeCommands · comandos con el gestor elegido", () => {
  const commands = [
    "npx create-next-app@latest heladeria --ts",
    "cd heladeria && pnpm install",
    "pnpm add -D prisma",
    "pnpm dev",
    "npx prisma migrate dev",
    "git init",
  ];

  it("npm", () => {
    expect(adaptNodeCommands(commands, "npm")).toEqual([
      "npm create next-app@latest heladeria --ts",
      "cd heladeria && npm install",
      "npm install -D prisma",
      "npm run dev",
      "npx prisma migrate dev",
      "git init",
    ]);
  });

  it("pnpm usa exec para binarios instalados", () => {
    expect(adaptNodeCommands(["npx prisma migrate dev"], "pnpm")).toEqual([
      "pnpm exec prisma migrate dev",
    ]);
  });

  it("bun usa 'bun run' (bun build y bun test son comandos propios)", () => {
    expect(adaptNodeCommands(["npm run build", "npm test"], "bun")).toEqual([
      "bun run build",
      "bun run test",
    ]);
  });

  it("descarga remota con versión → dlx / npx / bunx", () => {
    const cmd = ["pnpm dlx shadcn@latest init"];
    expect(adaptNodeCommands(cmd, "npm")).toEqual(["npx shadcn@latest init"]);
    expect(adaptNodeCommands(cmd, "bun")).toEqual(["bunx shadcn@latest init"]);
  });

  it("sin gestor válido no toca nada", () => {
    expect(adaptNodeCommands(commands, null)).toBe(commands);
    expect(adaptNodeCommands(commands, "pip")).toBe(commands);
  });
});

describe("ecosistemas y preferencias", () => {
  it("lenguaje → ecosistema", () => {
    expect(ecosystemOfLanguage("TypeScript")).toBe("node");
    expect(ecosystemOfLanguage("Python")).toBe("python");
    expect(ecosystemOfLanguage("C#")).toBe("dotnet");
    expect(ecosystemOfLanguage("Kotlin")).toBe("jvm");
    expect(ecosystemOfLanguage("Cobol")).toBeNull();
  });

  it("Django + React suma Node para el frontend", () => {
    const stack = { title: "Django + React", selectedLanguage: "Python", tags: ["Django", "React"] };
    expect(stackEcosystems(stack)).toEqual([
      { id: "python", role: "main" },
      { id: "node", role: "frontend" },
    ]);
  });

  it("descarta un gestor que no es del ecosistema y completa valores de serie", () => {
    const stack = { title: "Laravel", selectedLanguage: "PHP", tags: ["Laravel"] };
    const prefs = resolvePreferences(stack, { managers: { php: "pnpm" }, os: "linux" });
    expect(prefs.managers).toEqual({ php: "composer" });
    expect(prefs.os).toBe("linux");
    expect(prefs.editor).toBe("vscode");
    expect(prefs.ai).toBe("agent");
  });

  it("Spring sugiere JetBrains y .NET sugiere Visual Studio", () => {
    expect(resolvePreferences({ selectedLanguage: "Java", tags: [] }).editor).toBe("jetbrains");
    expect(resolvePreferences({ selectedLanguage: "C#", tags: [] }).editor).toBe("visual-studio");
  });

  it("describePreferences arma una frase legible", () => {
    const text = describePreferences({ managers: { node: "pnpm" }, editor: "cursor", os: "windows", ai: "ide" });
    expect(text).toContain("gestor de paquetes JavaScript / Node: pnpm");
    expect(text).toContain("editor Cursor");
    expect(text).toContain("Windows (PowerShell)");
  });

  it("comandos de serie según el gestor y el sistema operativo", () => {
    expect(defaultCommands({ managers: { node: "pnpm" } })).toEqual(["pnpm install", "pnpm dev"]);
    expect(defaultCommands({ managers: { python: "uv" } })).toEqual(["uv sync", "uv run python main.py"]);
    expect(defaultCommands({ managers: { python: "pip" }, os: "windows" })[1]).toContain("Activate.ps1");
    expect(defaultCommands(null)).toEqual(["git init"]);
  });
});
