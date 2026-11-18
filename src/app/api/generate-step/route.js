import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { buildStepPrompt } from "@/lib/prompts";
import { normalizeStepResponse, parseModelJson } from "@/lib/stepContracts";
import { getResponseSchema } from "@/lib/stepSchemas";
import { STATIONS } from "@/config/stations.config";
import { layoutSurfacesFor } from "@/data/layoutCatalog";

export const maxDuration = 90;
// Margen de 10 s respecto a maxDuration para serializar y responder
const GENERATION_BUDGET_MS = 80_000;
// Mínimo de opciones utilizables para aceptar una respuesta (de las 6 pedidas)
const MIN_VALID_OPTIONS = 3;

class InvalidModelOutputError extends Error {
  name = "InvalidModelOutputError";
}

/** Parsea y sanea la salida del modelo; lanza si no es utilizable. */
function validateStepText(station, rawText, blueprint, minOptions) {
  const parsed = parseModelJson(rawText);
  if (!parsed) {
    throw new InvalidModelOutputError(
      `JSON ilegible: ${String(rawText).slice(0, 200)}`,
    );
  }

  const { data, validCount } = normalizeStepResponse(
    station.id,
    parsed,
    blueprint,
  );
  const minimum = station.id === "workspace" ? 1 : minOptions;
  if (validCount < minimum) {
    throw new InvalidModelOutputError(
      `Solo ${validCount} opción(es) válida(s); se requieren ${minimum}.`,
    );
  }
  return data;
}

/**
 * Ajustes de una petición parcial ("generar más historias"): solo para las
 * historias de usuario y siempre acotados, porque llegan del cliente.
 */
function sanitizeExtras(stationId, extras) {
  if (stationId !== "user-stories" || !extras || typeof extras !== "object") {
    return {};
  }
  const count = Math.round(Number(extras.count));
  const text = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");
  return {
    count: Number.isFinite(count) ? Math.min(Math.max(count, 3), 10) : undefined,
    focus: text(extras.focus, 80) || undefined,
    exclude: Array.isArray(extras.exclude)
      ? extras.exclude.map((t) => text(t, 80)).filter(Boolean).slice(0, 60)
      : undefined,
  };
}

// Acepta el id textual ("stack") o el número de paso (4)
function resolveStation(stepId) {
  const station = STATIONS.find(
    (s) => s.id === stepId || s.stepNumber === Number(stepId),
  );
  return station && station.stepNumber > 0 ? station : null;
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Cuerpo de la petición inválido." },
      { status: 400 },
    );
  }

  const { stepId, blueprint, extras: rawExtras } = body || {};
  const station = resolveStation(stepId);

  if (!station) {
    return NextResponse.json(
      { success: false, error: `Estación desconocida: "${stepId}".` },
      { status: 400 },
    );
  }

  const safeBlueprint =
    blueprint && typeof blueprint === "object" ? blueprint : {};
  const extras = sanitizeExtras(station.id, rawExtras);
  // Layout: una opción por superficie del proyecto (1, 2 o 3), no 6 cartas
  const layoutCount =
    station.id === "layout" ? layoutSurfacesFor(safeBlueprint).length : null;
  const schemaCount = layoutCount || extras.count;
  const minOptions = layoutCount
    ? 1
    : Math.min(MIN_VALID_OPTIONS, extras.count || Infinity);

  try {
    // El validador convierte una respuesta ilegible o incompleta en un fallo del
    // intento, para que el pool pruebe el siguiente modelo en vez de aceptarla.
    const data = await generateWithFallback(
      {
        contents: [
          {
            role: "user",
            parts: [
              { text: buildStepPrompt(station.id, safeBlueprint, extras) },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          // Restringe la salida a la forma del contrato (prevención); el
          // validador de abajo sigue siendo la segunda barrera.
          responseSchema: getResponseSchema(station.id, {
            count: schemaCount,
          }),
        },
      },
      {
        budgetMs: GENERATION_BUDGET_MS,
        validate: (rawText) =>
          validateStepText(station, rawText, safeBlueprint, minOptions),
      },
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("[API generate-step] Error:", error);
    const isInvalidOutput = error instanceof InvalidModelOutputError;
    return NextResponse.json(
      {
        success: false,
        error: isInvalidOutput
          ? "La IA devolvió una respuesta incompleta. Intenta de nuevo."
          : error.message || "Error al comunicarse con Gemini.",
      },
      { status: isInvalidOutput ? 502 : 500 },
    );
  }
}
