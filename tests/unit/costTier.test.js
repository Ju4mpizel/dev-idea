import { describe, expect, it } from "vitest";
import { normalizeStepResponse } from "@/lib/stepContracts";

/** Franja deducida del texto de costo (planes guardados sin costTier). */
const tierOf = (cost) =>
  normalizeStepResponse("deploy", { options: [{ title: "Plan", cost }] }).data.options[0].costTier;

describe("franja de costo deducida del texto", () => {
  it("planes gratis, aunque mencionen otras cifras", () => {
    expect(tierOf("$0 / mes")).toBe("free");
    expect(tierOf("Gratis hasta 100 GB de tráfico")).toBe("free");
    expect(tierOf("$0 / mes hasta 100 GB y 1000 peticiones")).toBe("free");
  });

  it("montos con $ o US$", () => {
    expect(tierOf("≈ US$12 / mes")).toBe("low");
    expect(tierOf("US$80/mes")).toBe("premium");
  });

  it("montos en euros o con la moneda al final", () => {
    expect(tierOf("≈ 12 €/mes")).toBe("low");
    expect(tierOf("€60 al mes")).toBe("premium");
    expect(tierOf("20 USD / mes")).toBe("low");
    expect(tierOf("unos 100 dólares al mes")).toBe("premium");
  });
});
