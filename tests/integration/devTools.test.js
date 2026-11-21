import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fake, createFakeClient, request, USER } from "./helpers/fakeSupabase";

vi.mock("@supabase/supabase-js", () => ({ createClient: () => createFakeClient() }));

const devTools = await import("@/app/api/dev-tools/route");
const testProject = await import("@/app/api/dev-tools/test-project/route");
const { getSiteUrl } = await import("@/lib/siteUrl");

beforeEach(() => {
  fake.reset();
  fake.user = USER;
  vi.stubEnv("DEV_TOOLS_EMAILS", "admin@example.com, otra@example.com");
});
afterEach(() => vi.unstubAllEnvs());

describe("herramientas de desarrollo (solo DEV_TOOLS_EMAILS)", () => {
  it("una cuenta normal no las ve ni puede cargar el proyecto de prueba", async () => {
    expect(await (await devTools.GET(request("/api/dev-tools", { method: "GET" }))).json()).toEqual({ enabled: false });
    const res = await testProject.GET(request("/api/dev-tools/test-project", { method: "GET" }));
    expect(res.status).toBe(403);
  });

  it("una cuenta autorizada (sin importar mayúsculas) carga el proyecto de prueba", async () => {
    fake.user = { ...USER, email: "Admin@Example.com" };
    expect(await (await devTools.GET(request("/api/dev-tools", { method: "GET" }))).json()).toEqual({ enabled: true });
    const res = await testProject.GET(request("/api/dev-tools/test-project", { method: "GET" }));
    expect(res.status).toBe(200);
    expect((await res.json()).data.blueprint.idea).toBeTruthy();
  });

  it("sin sesión no hay herramientas", async () => {
    const res = await testProject.GET(request("/api/dev-tools/test-project", { method: "GET", token: null }));
    expect(res.status).toBe(403);
  });
});

describe("URL pública del sitio", () => {
  it("usa NEXT_PUBLIC_SITE_URL, luego el dominio de Vercel y luego localhost", () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://devidea.app/");
    expect(getSiteUrl()).toBe("https://devidea.app");
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "dev-idea.vercel.app");
    expect(getSiteUrl()).toBe("https://dev-idea.vercel.app");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "");
    expect(getSiteUrl()).toBe("http://localhost:3000");
  });
});
