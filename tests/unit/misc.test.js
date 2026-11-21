import { describe, expect, it } from "vitest";
import { contrastRatio, normalizeHex, normalizePalette } from "@/lib/palettes";
import { layoutSurfacesFor, buildLayoutDecision } from "@/data/layoutCatalog";
import { buildAgentsMd } from "@/lib/agentsMd";
import { buildPlanEntries } from "@/lib/planSummary";

describe("paletas", () => {
  it("normaliza hex cortos y rechaza valores inválidos", () => {
    expect(normalizeHex("#abc")).toBe("#aabbcc");
    expect(normalizeHex("12345")).toBeNull();
  });

  it("corrige un texto ilegible para cumplir el contraste mínimo", () => {
    const p = normalizePalette({ primary: "#111111", secondary: "#222222", accent: "#333333", background: "#000000", text: "#050505" });
    expect(contrastRatio(p.text, p.background)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("layout", () => {
  it("un sistema sin pantallas no tiene superficies (ERR-03)", () => {
    expect(layoutSurfacesFor({ selectedSystemType: { surfaces: ["api"] } })).toEqual([]);
  });

  it("un proyecto antiguo sin tipo de sistema cae en el sitio público", () => {
    expect(layoutSurfacesFor({ idea: "algo" })).toEqual(["public"]);
  });

  it("la decisión guarda un layout por superficie", () => {
    const d = buildLayoutDecision({ public: "hero-sections" });
    expect(d.selections).toHaveLength(1);
    expect(d.selections[0].surface).toBe("public");
  });
});

describe("AGENTS.md y Mi plano", () => {
  const blueprint = {
    idea: "pos para minimarket",
    context: "personal",
    mode: "quick",
    selectedName: "Caja",
    selectedStack: { title: "Laravel", selectedLanguage: "PHP", preferences: { managers: { php: "composer" }, editor: "vscode", os: "windows", ai: "agent" } },
    selectedDatabase: { title: "MySQL", dbType: "relational", adminToolLabel: "MySQL Workbench" },
  };
  const scaffold = {
    commands: ["composer install"],
    suggestions: [{ stationId: "architecture", title: "MVC de Laravel", detail: "El patrón nativo." }],
    diagrams: [{ title: "Casos de uso", mermaid: "flowchart LR\\n A-->B" }],
  };

  it("incluye entorno, administrador, diagramas y sugerencias", () => {
    const md = buildAgentsMd(blueprint, scaffold);
    expect(md).toContain("# Caja · AGENTS.md");
    expect(md).toContain("Composer");
    expect(md).toContain("MySQL Workbench");
    expect(md).toContain("```mermaid");
    expect(md).toContain("**Arquitectura Técnica:** MVC de Laravel");
  });

  it("Mi plano solo lista las estaciones del modo", () => {
    const ids = buildPlanEntries(blueprint, {}).map((e) => e.station.id);
    expect(ids).toEqual(["system-type", "requirements", "stack", "database"]);
  });
});
