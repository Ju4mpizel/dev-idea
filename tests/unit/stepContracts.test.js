import { describe, expect, it } from "vitest";
import { normalizeStepResponse, parseModelJson } from "@/lib/stepContracts";

describe("parseModelJson", () => {
  it("acepta JSON limpio, con ``` o con texto alrededor", () => {
    expect(parseModelJson('{"a":1}')).toEqual({ a: 1 });
    expect(parseModelJson('```json\n{"a":1}\n```')).toEqual({ a: 1 });
    expect(parseModelJson('Aquí tienes: {"a":1} ¡listo!')).toEqual({ a: 1 });
  });

  it("devuelve null si no hay JSON", () => {
    expect(parseModelJson("sin json")).toBeNull();
    expect(parseModelJson("")).toBeNull();
  });
});

describe("normalizeStepResponse · nunca lanza", () => {
  it("datos basura → contrato válido con defaults", () => {
    const { data, validCount } = normalizeStepResponse("architecture", "basura");
    expect(validCount).toBe(0);
    expect(data.options).toEqual([]);
    expect(typeof data.companionComment).toBe("string");
  });

  it("stack JS siempre ofrece TypeScript y JavaScript", () => {
    const { data } = normalizeStepResponse("stack", {
      stacks: [{ title: "Next.js", tags: ["Next.js"], availableLanguages: ["TypeScript"] }],
    });
    expect(data.stacks[0].availableLanguages).toEqual(["TypeScript", "JavaScript"]);
  });

  it("deploy deduce la franja de costo si falta", () => {
    const { data } = normalizeStepResponse("deploy", {
      options: [
        { title: "A", cost: "$0 / mes" },
        { title: "B", cost: "≈ US$12 / mes" },
        { title: "C", cost: "US$80/mes" },
        { title: "D", cost: "x", costTier: "premium" },
      ],
    });
    expect(data.options.map((o) => o.costTier)).toEqual(["free", "low", "premium", "premium"]);
  });

  it("base de datos con tipo inválido cae en relacional", () => {
    const { data } = normalizeStepResponse("database", {
      options: [{ title: "Algo", dbType: "inventado" }],
    });
    expect(data.options[0].dbType).toBe("relational");
  });

  it("layout completa las superficies que Gemini olvidó", () => {
    const blueprint = { selectedSystemType: { surfaces: ["public", "admin"] } };
    const { data, validCount } = normalizeStepResponse(
      "layout",
      { options: [{ surface: "public", ranking: [{ layoutId: "hero-sections" }] }] },
      blueprint,
    );
    expect(data.options.map((o) => o.surface)).toEqual(["public", "admin"]);
    expect(validCount).toBe(1);
  });
});

describe("normalizeStepResponse · cierre (workspace)", () => {
  const blueprint = {
    mode: "quick",
    selectedStack: { title: "Next.js", selectedLanguage: "TypeScript", tags: ["Next.js"], preferences: { managers: { node: "npm" } } },
  };

  it("reescribe los comandos al gestor elegido", () => {
    const { data } = normalizeStepResponse("workspace", { scaffold: { commands: ["pnpm install", "pnpm dev"] } }, blueprint);
    expect(data.scaffold.commands).toEqual(["npm install", "npm run dev"]);
  });

  it("sin comandos usa los de serie de su gestor", () => {
    const { data } = normalizeStepResponse("workspace", { scaffold: {} }, blueprint);
    expect(data.scaffold.commands).toEqual(["npm install", "npm run dev"]);
  });

  it("solo acepta sugerencias de estaciones fuera del modo, sin duplicados", () => {
    const { data } = normalizeStepResponse(
      "workspace",
      {
        scaffold: {
          suggestions: [
            { stationId: "architecture", title: "MVC" },
            { stationId: "stack", title: "no va: está en el modo" },
            { stationId: "deploy", title: "VPS" },
            { stationId: "deploy", title: "duplicada" },
            { stationId: "inventada", title: "no existe" },
          ],
        },
      },
      blueprint,
    );
    expect(data.scaffold.suggestions.map((s) => s.stationId)).toEqual(["architecture", "deploy"]);
  });

  it("un diagrama sin código de la IA usa el ejemplo de la carta", () => {
    const { data } = normalizeStepResponse(
      "workspace",
      { scaffold: { diagrams: [] } },
      { selectedDiagrams: [{ id: "d1", title: "Casos de uso", diagramType: "use-case", sampleMermaid: "flowchart LR\n A-->B" }] },
    );
    expect(data.scaffold.diagrams[0]).toMatchObject({ title: "Casos de uso", isSample: true });
    expect(data.scaffold.diagrams[0].mermaid).toContain("A-->B");
  });
});
