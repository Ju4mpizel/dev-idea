import { beforeEach, describe, expect, it, vi } from "vitest";
import { fake, createFakeClient, request, rpcCalls, USER, RUN_ID } from "./helpers/fakeSupabase";

vi.mock("@supabase/supabase-js", () => ({ createClient: () => createFakeClient() }));
const gemini = { result: { isSoftware: true, reason: "" }, error: null, calls: 0 };
vi.mock("@/lib/gemini", () => ({
  generateWithFallback: async (_options, { validate }) => {
    gemini.calls += 1;
    if (gemini.error) throw gemini.error;
    return validate(JSON.stringify(gemini.result));
  },
}));

const { GET, POST } = await import("@/app/api/idea-runs/route");

const claimOk = () => ({ data: { ok: true, id: RUN_ID, used: 1, limit: 2, next_free_at: null }, error: null });

beforeEach(() => {
  fake.reset();
  fake.user = USER;
  gemini.result = { isSoftware: true, reason: "" };
  gemini.error = null;
  gemini.calls = 0;
});

describe("POST /api/idea-runs · filtro de ideas + cupo", () => {
  it("sin sesión responde 401", async () => {
    const res = await POST(request("/api/idea-runs", { token: null, body: { idea: "pos para minimarket" } }));
    expect(res.status).toBe(401);
  });

  it("una idea de software abre el ticket", async () => {
    fake.rpc.claim_idea_run = claimOk;
    const res = await POST(request("/api/idea-runs", { body: { idea: "pos para minimarket", context: "personal" } }));
    expect(res.status).toBe(200);
    expect((await res.json()).ideaRunId).toBe(RUN_ID);
    expect(gemini.calls).toBe(0);
  });

  it("'hazme el diseño de una polera' responde 422 sin IA ni cupo", async () => {
    const res = await POST(request("/api/idea-runs", { body: { idea: "hazme el diseño de una polera" } }));
    expect(res.status).toBe(422);
    expect((await res.json()).code).toBe("OFF_TOPIC");
    expect(rpcCalls("claim_idea_run")).toHaveLength(0);
    expect(gemini.calls).toBe(0);
  });

  it("una idea muy corta responde 422 IDEA_TOO_SHORT", async () => {
    const res = await POST(request("/api/idea-runs", { body: { idea: "hola" } }));
    expect((await res.json()).code).toBe("IDEA_TOO_SHORT");
  });

  it("un caso dudoso lo decide la IA: si no es software, 422", async () => {
    gemini.result = { isSoftware: false, reason: "Es una receta." };
    const res = await POST(request("/api/idea-runs", { body: { idea: "quiero vender mis tortas por internet" } }));
    expect(res.status).toBe(422);
    expect(gemini.calls).toBe(1);
    expect(rpcCalls("claim_idea_run")).toHaveLength(0);
  });

  it("si la IA del filtro falla, la idea pasa (nunca bloquea por un error nuestro)", async () => {
    gemini.error = new Error("caído");
    fake.rpc.claim_idea_run = claimOk;
    const res = await POST(request("/api/idea-runs", { body: { idea: "quiero vender mis tortas por internet" } }));
    expect(res.status).toBe(200);
  });

  it("sin cupo responde 429 IDEA_LIMIT con la hora en que se libera", async () => {
    fake.rpc.claim_idea_run = () => ({
      data: { ok: false, used: 2, limit: 2, next_free_at: "2026-11-21T20:00:00Z" },
      error: null,
    });
    const res = await POST(request("/api/idea-runs", { body: { idea: "pos para minimarket" } }));
    expect(res.status).toBe(429);
    const body = await res.json();
    expect(body.code).toBe("IDEA_LIMIT");
    expect(body.nextFreeAt).toBe("2026-11-21T20:00:00Z");
  });
});

describe("GET /api/idea-runs", () => {
  it("devuelve el cupo del usuario", async () => {
    fake.rpc.idea_quota = () => ({ data: { used: 1, limit: 2, next_free_at: null }, error: null });
    const res = await GET(request("/api/idea-runs", { method: "GET" }));
    expect(await res.json()).toEqual({ unlimited: false, used: 1, limit: 2, nextFreeAt: null });
  });
});
