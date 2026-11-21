import { describe, expect, it } from "vitest";
import {
  adminToolsFor,
  detectDatabase,
  recommendDataStorage,
} from "@/data/databases";
import { buildSystemTypeDecision } from "@/data/systemTypes";

const withType = (typeId, extra = {}) => ({
  selectedSystemType: buildSystemTypeDecision(typeId),
  ...extra,
});

describe("recommendDataStorage · valor inicial del interruptor", () => {
  it("un POS necesita base de datos (y apagarla dispara el aviso)", () => {
    expect(recommendDataStorage(withType("pos"))).toMatchObject({ needed: true, strong: true });
  });

  it("una landing no la necesita", () => {
    expect(recommendDataStorage(withType("landing"))).toMatchObject({ needed: false, strong: false });
  });

  it("una landing con un stack que ya trae Supabase la sugiere", () => {
    const r = recommendDataStorage(
      withType("landing", { selectedStack: { title: "Next.js + Supabase", tags: ["Supabase"] } }),
    );
    expect(r.needed).toBe(true);
    expect(r.strong).toBe(false);
  });

  it("un bot casi siempre guarda algo, pero se puede apagar", () => {
    expect(recommendDataStorage(withType("bot"))).toMatchObject({ needed: true, strong: false });
  });

  it("un stack HTML sin servidor se marca como estático", () => {
    const r = recommendDataStorage(
      withType("landing", { selectedStack: { title: "HTML + CSS + JS", tags: ["HTML"] } }),
    );
    expect(r.staticStack).toBe(true);
  });
});

describe("motor y administradores de una carta", () => {
  it("Supabase y Neon no se confunden con un PostgreSQL propio", () => {
    expect(detectDatabase({ title: "Supabase (PostgreSQL)" }).id).toBe("supabase");
    expect(detectDatabase({ title: "PostgreSQL en Neon" }).id).toBe("neon");
    expect(detectDatabase({ title: "PostgreSQL" }).id).toBe("postgresql");
  });

  it("MySQL ofrece Workbench y suma Prisma Studio si usa Prisma", () => {
    const ids = adminToolsFor({ title: "MySQL", techs: ["MySQL", "Prisma"] }).map((t) => t.id);
    expect(ids[0]).toBe("workbench");
    expect(ids).toContain("prisma-studio");
  });

  it("un motor desconocido ofrece herramientas universales", () => {
    const ids = adminToolsFor({ title: "Base exótica" }).map((t) => t.id);
    expect(ids).toEqual(["dbeaver", "tableplus"]);
  });
});
