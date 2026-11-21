import { describe, expect, it } from "vitest";
import {
  LAST_STEP,
  STATIONS,
  blueprintToDbRow,
  createInitialBlueprint,
  dbRowToBlueprint,
  highestStepOf,
  isStationInMode,
  nextStepInMode,
  prevStepInMode,
  resolveMode,
  resolveStation,
  stationNumberInMode,
  stationsInMode,
  toIdKeyedOptions,
} from "@/config/stations.config";

const route = (mode) => {
  const steps = [0];
  let step = 0;
  while ((step = nextStepInMode(step, mode)) !== null) steps.push(step);
  return steps;
};

describe("registro de estaciones", () => {
  it("15 estaciones con pasos consecutivos y ids únicos", () => {
    expect(STATIONS).toHaveLength(15);
    expect(STATIONS.map((s) => s.stepNumber)).toEqual([...Array(15).keys()]);
    expect(new Set(STATIONS.map((s) => s.id)).size).toBe(15);
    expect(LAST_STEP).toBe(14);
  });

  it("resolveStation acepta id, número o texto numérico", () => {
    expect(resolveStation("stack").stepNumber).toBe(5);
    expect(resolveStation(5).id).toBe("stack");
    expect(resolveStation("5").id).toBe("stack");
    expect(resolveStation("nada")).toBeNull();
  });
});

describe("modos del recorrido", () => {
  it("Rápido salta a lo esencial", () => {
    expect(route("quick")).toEqual([0, 2, 3, 5, 6, 14]);
  });

  it("Estándar omite historias, metodología, diagramas e IA", () => {
    expect(route("standard")).toEqual([0, 1, 2, 3, 5, 6, 7, 10, 11, 12, 14]);
  });

  it("Completo (y los proyectos sin modo) recorren todo", () => {
    expect(route("complete")).toHaveLength(15);
    expect(route(undefined)).toHaveLength(15);
    expect(resolveMode("inventado")).toBe("complete");
  });

  it("'Anterior' respeta el modo", () => {
    expect(prevStepInMode(5, "quick")).toBe(3);
    expect(prevStepInMode(2, "quick")).toBe(0);
    expect(prevStepInMode(5, "complete")).toBe(4);
  });

  it("numeración sin saltos en los modos cortos", () => {
    expect(stationsInMode("quick").map((s) => stationNumberInMode(s, "quick"))).toEqual([0, 1, 2, 3, 4, 5]);
    expect(stationNumberInMode("workspace", "quick")).toBe(5);
    expect(stationNumberInMode(9, "complete")).toBe(9);
  });

  it("ningún modo omite lo esencial", () => {
    for (const mode of ["quick", "standard", "complete"]) {
      for (const id of ["idea", "system-type", "requirements", "stack", "database", "workspace"]) {
        expect(isStationInMode(id, mode)).toBe(true);
      }
    }
  });
});

describe("cartas guardadas y migraciones", () => {
  it("convierte claves numéricas antiguas (v4) a ids", () => {
    const converted = toIdKeyedOptions({ 2: { a: 1 }, 5: { b: 2 }, 99: { c: 3 } }, 4);
    expect(converted).toEqual({ "system-type": { a: 1 }, stack: { b: 2 } });
  });

  it("en v3 no existía 'Tipo de sistema' (el paso 2 era Requisitos)", () => {
    expect(toIdKeyedOptions({ 2: { a: 1 } }, 3)).toEqual({ requirements: { a: 1 } });
  });

  it("descarta valores que no son objetos y estaciones inexistentes", () => {
    expect(toIdKeyedOptions({ stack: [1], fake: {} })).toEqual({});
    expect(toIdKeyedOptions(null)).toEqual({});
  });

  it("highestStepOf devuelve el paso más avanzado", () => {
    expect(highestStepOf({ naming: {}, deploy: {} })).toBe(12);
    expect(highestStepOf({})).toBe(0);
  });
});

describe("blueprint ↔ fila de Supabase", () => {
  it("ida y vuelta conserva idea, contexto, modo y decisiones", () => {
    const blueprint = createInitialBlueprint({
      idea: "pos para minimarket",
      context: "personal",
      mode: "quick",
      selectedStack: { id: "s1", title: "Laravel" },
    });
    const row = blueprintToDbRow(blueprint);
    expect(row.mode).toBe("quick");
    expect(row.selected_requirements).toEqual([]);
    const back = dbRowToBlueprint(row);
    expect(back.idea).toBe("pos para minimarket");
    expect(back.mode).toBe("quick");
    expect(back.selectedStack.title).toBe("Laravel");
  });

  it("un proyecto anterior a los modos se lee como Completo", () => {
    expect(dbRowToBlueprint({ idea: "x" }).mode).toBe("complete");
  });
});
