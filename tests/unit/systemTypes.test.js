import { describe, expect, it } from "vitest";
import {
  buildSystemTypeDecision,
  detectSystemType,
  getComplementsFor,
  getSystemType,
  hasUserInterface,
} from "@/data/systemTypes";

describe("detectSystemType · idea clara (vista enfocada)", () => {
  it("una landing solo muestra tipos web y su escalón siguiente", () => {
    const r = detectSystemType("landing page para heladeria");
    expect(r.familyId).toBe("web");
    expect(r.recommended).toEqual(["landing"]);
    expect(r.focused).toEqual(["landing", "multipage", "cms-site", "catalog-orders"]);
    expect(r.focused).not.toContain("pos");
  });

  it("'sistema de tickets' es una mesa de ayuda, no un POS", () => {
    const r = detectSystemType("sistema de tickets de soporte");
    expect(r.recommended[0]).toBe("helpdesk");
    expect(r.focused).not.toContain("pos");
  });

  it("detecta reservas, cursos, bots e inventario", () => {
    expect(detectSystemType("sistema de reservas para barberia").recommended[0]).toBe("booking");
    expect(detectSystemType("plataforma de cursos de cocina").recommended[0]).toBe("lms");
    expect(detectSystemType("bot de telegram para recordatorios").recommended[0]).toBe("bot");
    expect(detectSystemType("sistema web de inventario").recommended[0]).toBe("inventory");
  });

  it("no repite pistas contenidas en otra («landing» dentro de «landing page»)", () => {
    expect(detectSystemType("landing page para heladeria").matched).toEqual(["landing page"]);
  });
});

describe("detectSystemType · palabra completa (ERR-01 y ERR-02)", () => {
  it("'posible' no activa POS", () => {
    const r = detectSystemType("landing para un restaurante lo mas rapido posible");
    expect(r.focused).not.toContain("pos");
    expect(r.recommended).toEqual(["landing"]);
  });

  it("'restaurante' no activa API ni 'botica' activa Bot", () => {
    expect(detectSystemType("pagina web para mi restaurante").familyId).toBe("web");
    expect(detectSystemType("boton de whatsapp para mi botica").familyId).toBeNull();
  });
});

describe("detectSystemType · idea ambigua o sin pistas", () => {
  it("'sistema para heladería' abre el catálogo completo con gestión sugerida", () => {
    const r = detectSystemType("sistema para heladeria");
    expect(r.focused).toBeNull();
    expect(r.familyId).toBe("management");
    expect(r.crossId).toBe("catalog-orders");
  });

  it("sin pistas no recomienda nada", () => {
    expect(detectSystemType("heladeria")).toEqual({
      familyId: null,
      recommended: [],
      crossId: null,
      matched: [],
      focused: null,
    });
  });
});

describe("complementos y decisión", () => {
  it("una API o un bot no reciben pedidos online ni app móvil", () => {
    const ids = getComplementsFor(getSystemType("bot")).map((c) => c.id);
    expect(ids).toEqual(["admin-panel"]);
  });

  it("los complementos que el tipo ya trae no se ofrecen", () => {
    const ids = getComplementsFor(getSystemType("cms-site")).map((c) => c.id);
    expect(ids).not.toContain("admin-panel");
  });

  it("la decisión suma las superficies de los complementos válidos", () => {
    const d = buildSystemTypeDecision("landing", ["admin-panel", "mobile-version"]);
    expect(d.surfaces).toEqual(["public", "admin", "mobile"]);
    expect(d.complements).toEqual(["admin-panel", "mobile-version"]);
  });

  it("descarta complementos no permitidos y tipos inexistentes", () => {
    expect(buildSystemTypeDecision("api", ["online-orders"]).complements).toEqual([]);
    expect(buildSystemTypeDecision("no-existe")).toBeNull();
  });

  it("hasUserInterface distingue sistemas sin pantallas", () => {
    expect(hasUserInterface(["api"])).toBe(false);
    expect(hasUserInterface(["api", "admin"])).toBe(true);
  });
});
