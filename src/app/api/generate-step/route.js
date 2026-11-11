import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { buildStepPrompt } from "@/lib/prompts";
import { normalizeStepResponse, parseModelJson } from "@/lib/stepContracts";
import { getResponseSchema } from "@/lib/stepSchemas";
import { STATIONS } from "@/config/stations.config";

export const maxDuration = 60;
// Margen de 10 s respecto a maxDuration para serializar y responder
const GENERATION_BUDGET_MS = 50_000;
// Mínimo de opciones utilizables para aceptar una respuesta (pasos 1-9)
const MIN_VALID_OPTIONS = 2;

class InvalidModelOutputError extends Error {
  name = "InvalidModelOutputError";
}

/** Parsea y sanea la salida del modelo; lanza si no es utilizable. */
function validateStepText(stepNumber, rawText, blueprint) {
  const parsed = parseModelJson(rawText);
  if (!parsed) {
    throw new InvalidModelOutputError(
      `JSON ilegible: ${String(rawText).slice(0, 200)}`,
    );
  }

  const { data, validCount } = normalizeStepResponse(
    stepNumber,
    parsed,
    blueprint,
  );
  const minimum = stepNumber === 10 ? 1 : MIN_VALID_OPTIONS;
  if (validCount < minimum) {
    throw new InvalidModelOutputError(
      `Solo ${validCount} opción(es) válida(s); se requieren ${minimum}.`,
    );
  }
  return data;
}

// Acepta el id textual ("stack") o el número de paso (2)
function resolveStepNumber(stepId) {
  const station = STATIONS.find(
    (s) => s.id === stepId || s.stepNumber === Number(stepId),
  );
  return station && station.stepNumber > 0 ? station.stepNumber : null;
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

  const { stepId, blueprint } = body || {};
  const stepNumber = resolveStepNumber(stepId);

  if (!stepNumber) {
    return NextResponse.json(
      { success: false, error: `Estación desconocida: "${stepId}".` },
      { status: 400 },
    );
  }

  const safeBlueprint =
    blueprint && typeof blueprint === "object" ? blueprint : {};

  try {
    // El validador convierte una respuesta ilegible o incompleta en un fallo del
    // intento, para que el pool pruebe el siguiente modelo en vez de aceptarla.
    const data = await generateWithFallback(
      {
        contents: [
          {
            role: "user",
            parts: [{ text: buildStepPrompt(stepNumber, safeBlueprint) }],
          },
        ],
        generationConfig: {
          responseMimeType: "application/json",
          // Restringe la salida a la forma del contrato (prevención); el
          // validador de abajo sigue siendo la segunda barrera.
          responseSchema: getResponseSchema(stepNumber),
        },
      },
      {
        budgetMs: GENERATION_BUDGET_MS,
        validate: (rawText) =>
          validateStepText(stepNumber, rawText, safeBlueprint),
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
