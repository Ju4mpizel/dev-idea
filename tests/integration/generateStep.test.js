import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake, createFakeClient, request, rpcCalls, USER, RUN_ID } from "./helpers/fakeSupabase";

// Supabase y Gemini simulados; el resto (ruta, prompts, contratos) es real
vi.mock("@supabase/supabase-js", () => ({ createClient: () => createFakeClient() }));
const gemini = { text: "", error: null, lastPrompt: "" };
vi.mock("@/lib/gemini", () => ({
  generateWithFallback: async (options, { validate }) => {
    gemini.lastPrompt = options.contents[0].parts[0].text;
    if (gemini.error) throw gemini.error;
    return validate(gemini.text);
  },
}));

const { POST } = await import("@/app/api/generate-step/route");

const ARCH_RESPONSE = JSON.stringify({
  companionMood: "thinking",
  companionComment: "Elige con calma.",
  options: [1, 2, 3, 4, 5, 6].map((i) => ({
    id: `arch-${i}`,
    level: "simple",
    title: `Arquitectura ${i}`,
    summary: "Capas claras.",
  })),
});

const ticketOk = () => ({ data: { idea: "pos para minimarket", context: "personal" }, error: null });

beforeEach(() => {
  fake.reset();
  fake.user = USER;
  gemini.text = ARCH_RESPONSE;
  gemini.error = null;
  gemini.lastPrompt = "";
});

describe("POST /api/generate-step", () => {
  it("sin sesión responde 401 y no gasta IA", async () => {
    const res = await POST(request("/api/generate-step", { token: null, body: { stepId: "architecture" } }));
    expect(res.status).toBe(401);
    expect(gemini.lastPrompt).toBe("");
  });

  it("una estación desconocida responde 400", async () => {
    const res = await POST(request("/api/generate-step", { body: { stepId: "inventada", ideaRunId: RUN_ID } }));
    expect(res.status).toBe(400);
  });

  it("sin ticket de idea responde 403 NO_IDEA_RUN", async () => {
    const res = await POST(request("/api/generate-step", { body: { stepId: "architecture" } }));
    expect(res.status).toBe(403);
    expect((await res.json()).code).toBe("NO_IDEA_RUN");
  });

  it("un ticket agotado responde 429", async () => {
    fake.rpc.use_idea_generation = () => ({ data: null, error: null });
    const res = await POST(request("/api/generate-step", { body: { stepId: "architecture", ideaRunId: RUN_ID } }));
    expect(res.status).toBe(429);
    expect((await res.json()).code).toBe("IDEA_GENERATIONS_LIMIT");
  });

  it("genera, normaliza las cartas y usa la idea del ticket (no la del navegador)", async () => {
    fake.rpc.use_idea_generation = ticketOk;
    const res = await POST(request("/api/generate-step", {
      body: { stepId: "architecture", ideaRunId: RUN_ID, blueprint: { idea: "idea manipulada" } },
    }));
    expect(res.status).toBe(200);
    const { data } = await res.json();
    expect(data.options).toHaveLength(6);
    expect(data.options[0].level).toBe("simple");
    expect(gemini.lastPrompt).toContain("pos para minimarket");
    expect(gemini.lastPrompt).not.toContain("idea manipulada");
  });

  it("si Gemini falla responde 503 y devuelve la generación al cupo", async () => {
    fake.rpc.use_idea_generation = ticketOk;
    fake.rpc.refund_idea_generation = () => ({ data: true, error: null });
    gemini.error = new Error("timeout");
    const res = await POST(request("/api/generate-step", { body: { stepId: "architecture", ideaRunId: RUN_ID } }));
    expect(res.status).toBe(503);
    expect(rpcCalls("refund_idea_generation")).toEqual([
      { type: "rpc", name: "refund_idea_generation", args: { p_run: RUN_ID } },
    ]);
  });

  it("una respuesta incompleta de la IA responde 502 y también devuelve el cupo", async () => {
    fake.rpc.use_idea_generation = ticketOk;
    gemini.text = JSON.stringify({ options: [{ title: "Solo una" }] });
    const res = await POST(request("/api/generate-step", { body: { stepId: "architecture", ideaRunId: RUN_ID } }));
    expect(res.status).toBe(502);
    expect(rpcCalls("refund_idea_generation")).toHaveLength(1);
  });

  it("si la función de devolución no existe, la respuesta no se rompe", async () => {
    fake.rpc.use_idea_generation = ticketOk;
    fake.rpc.refund_idea_generation = () => ({ data: null, error: { message: "function does not exist" } });
    gemini.error = new Error("timeout");
    const res = await POST(request("/api/generate-step", { body: { stepId: "architecture", ideaRunId: RUN_ID } }));
    expect(res.status).toBe(503);
  });

  it("el layout de un sistema sin pantallas responde 400 sin descontar cupo", async () => {
    const res = await POST(request("/api/generate-step", {
      body: { stepId: "layout", ideaRunId: RUN_ID, blueprint: { selectedSystemType: { surfaces: ["api"] } } },
    }));
    expect(res.status).toBe(400);
    expect(rpcCalls("use_idea_generation")).toHaveLength(0);
  });

  it("un cuerpo demasiado grande responde 413", async () => {
    const res = await POST(request("/api/generate-step", { raw: "x".repeat(70 * 1024) }));
    expect(res.status).toBe(413);
  });
});
