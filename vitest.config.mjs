import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";

/**
 * Pruebas de Dev.Idea:
 * - tests/unit:        lógica pura (detección, filtros, contratos, prompts…)
 * - tests/integration: rutas API completas con Supabase y Gemini simulados
 * `pnpm test` las corre todas; `pnpm test:coverage` agrega el reporte de
 * cobertura en coverage/ (texto en consola + HTML).
 */
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: [
        "src/lib/**/*.js",
        "src/data/**/*.js",
        "src/config/**/*.js",
        "src/app/api/**/*.js",
      ],
      exclude: [
        // Datos de demostración y textos: no tienen lógica que probar
        "src/data/testProject.js",
        "src/data/strobiQuotes.js",
        "src/data/stationGuides.js",
        "src/data/stationCategories.js",
        "src/data/aiTools.js",
        // Clientes de red: se simulan en las pruebas de integración
        "src/lib/supabaseClient.js",
        "src/lib/gemini.js",
        "src/lib/techIcons.js",
      ],
      reporter: ["text", "html", "json-summary"],
      reportsDirectory: "coverage",
    },
  },
});
