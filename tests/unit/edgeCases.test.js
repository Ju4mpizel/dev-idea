import { describe, expect, it } from "vitest";
import { screenIdea } from "@/lib/ideaGuard";
import { adaptNodeCommands } from "@/data/devPreferences";

describe("casos borde encontrados al probar", () => {
  it("'página' sin 'web' también es software, aunque hable de poleras", () => {
    expect(screenIdea("quiero una página para mostrar mis diseños de poleras").verdict).toBe("software");
    expect(screenIdea("una pagina para mi heladeria").verdict).toBe("software");
  });

  it("npx con banderas antes del paquete (-y, --yes)", () => {
    expect(adaptNodeCommands(["npx -y create-next-app@latest heladeria"], "pnpm")).toEqual([
      "pnpm create next-app@latest heladeria",
    ]);
    expect(adaptNodeCommands(["npx --yes shadcn@latest init"], "bun")).toEqual([
      "bunx shadcn@latest init",
    ]);
  });
});
