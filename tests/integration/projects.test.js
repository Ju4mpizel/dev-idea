import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake, createFakeClient, request, USER, RUN_ID } from "./helpers/fakeSupabase";

vi.mock("@supabase/supabase-js", () => ({ createClient: () => createFakeClient() }));

const projects = await import("@/app/api/projects/route");
const project = await import("@/app/api/projects/[id]/route");

const PROJECT_ID = "33333333-3333-4333-8333-333333333333";
const params = (id) => ({ params: Promise.resolve({ id }) });
const insertOf = (table) =>
  fake.calls.find((c) => c.type === "query" && c.table === table && c.op === "insert");

beforeEach(() => {
  fake.reset();
  fake.user = USER;
  fake.tables.projects = (q) =>
    q.op === "insert"
      ? { data: { id: PROJECT_ID }, error: null }
      : q.op === "update"
        ? { data: [{ id: PROJECT_ID }], error: null }
        : { data: [], error: null };
  fake.tables.blueprints = () => ({ data: null, error: null });
});

describe("POST /api/projects", () => {
  it("sin sesión responde 401", async () => {
    const res = await projects.POST(request("/api/projects", { token: null, body: { blueprint: {} } }));
    expect(res.status).toBe(401);
  });

  it("crea el proyecto y su blueprint con el modo elegido", async () => {
    fake.tables.idea_runs = () => ({ data: { id: RUN_ID }, error: null });
    const res = await projects.POST(request("/api/projects", {
      body: { blueprint: { idea: "pos", mode: "quick" }, ideaRunId: RUN_ID, currentStep: 99 },
    }));
    expect(res.status).toBe(201);
    expect(insertOf("projects").payload[0]).toMatchObject({ idea_run_id: RUN_ID, current_step: 14 });
    expect(insertOf("blueprints").payload[0].mode).toBe("quick");
  });

  it("no vincula el ticket de idea de otra cuenta", async () => {
    // RLS: idea_runs solo devuelve los tickets propios → aquí no encuentra nada
    fake.tables.idea_runs = () => ({ data: null, error: null });
    await projects.POST(request("/api/projects", { body: { blueprint: { idea: "pos" }, ideaRunId: RUN_ID } }));
    expect(insertOf("projects").payload[0].idea_run_id).toBeNull();
  });

  it("un cuerpo demasiado grande responde 413", async () => {
    const res = await projects.POST(request("/api/projects", { raw: JSON.stringify({ blueprint: { idea: "x".repeat(600 * 1024) } }) }));
    expect(res.status).toBe(413);
  });

  it("un JSON inválido responde 400", async () => {
    const res = await projects.POST(request("/api/projects", { raw: "{no es json" }));
    expect(res.status).toBe(400);
  });

  it("si falla el blueprint, borra el proyecto recién creado (rollback)", async () => {
    fake.tables.blueprints = () => ({ data: null, error: { message: "fallo" } });
    const res = await projects.POST(request("/api/projects", { body: { blueprint: { idea: "pos" } } }));
    expect(res.status).toBe(500);
    expect(fake.calls.some((c) => c.table === "projects" && c.op === "delete")).toBe(true);
  });
});

describe("PUT y DELETE /api/projects/[id]", () => {
  it("un id que no es UUID responde 400 (antes era 500)", async () => {
    const put = await project.PUT(request("/api/projects/abc", { method: "PUT", body: {} }), params("abc"));
    const del = await project.DELETE(request("/api/projects/123", { method: "DELETE" }), params("123"));
    expect(put.status).toBe(400);
    expect(del.status).toBe(400);
  });

  it("si el proyecto no existe o no es tuyo responde 404", async () => {
    fake.tables.projects = () => ({ data: [], error: null });
    const res = await project.PUT(
      request(`/api/projects/${PROJECT_ID}`, { method: "PUT", body: { blueprint: { idea: "pos" } } }),
      params(PROJECT_ID),
    );
    expect(res.status).toBe(404);
    expect((await res.json()).code).toBe("PROJECT_NOT_FOUND");
  });

  it("actualiza el proyecto y su blueprint", async () => {
    const res = await project.PUT(
      request(`/api/projects/${PROJECT_ID}`, { method: "PUT", body: { blueprint: { idea: "pos" }, currentStep: 3 } }),
      params(PROJECT_ID),
    );
    expect(res.status).toBe(200);
    expect(fake.calls.some((c) => c.table === "blueprints" && c.op === "upsert")).toBe(true);
  });
});
