import { NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/gemini";
import { buildStepPrompt } from "@/lib/prompts";
import { normalizeStepResponse, parseModelJson } from "@/lib/stepContracts";
import { getResponseSchema } from "@/lib/stepSchemas";
import { STATIONS } from "@/config/stations.config";
import { layoutSurfacesFor } from "@/data/layoutCatalog";
import {
  getRequestUser,
  isUnlimitedUser,
  isUuid,
  serverError,
  unauthorized,
} from "@/lib/supabaseServer";

export const maxDuration = 90;
// Margen de 10 s respecto a maxDuration para serializar y responder
const GENERATION_BUDGET_MS = 80_000;
// Mínimo de opciones utilizables para aceptar una respuesta (de las 6 pedidas)
const MIN_VALID_OPTIONS = 3;
// Un blueprint completo con todas sus decisiones ocupa ~10-20 KB
const MAX_BODY_BYTES = 64 * 1024;

const fail = (status, error, code) =>
  NextResponse.json({ success: false, error, code }, { status });

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

/**
 * Devuelve al ticket la generación descontada. Si la función SQL aún no
 * existe (migración 20261122 sin correr) solo se registra: nunca rompe la
 * respuesta.
 */
async function refundGeneration(supabase, runId) {
  try {
    const { error } = await supabase.rpc("refund_idea_generation", { p_run: runId });
    if (error) console.warn("[API generate-step] No se pudo devolver la generación:", error.message);
  } catch (err) {
    console.warn("[API generate-step] No se pudo devolver la generación:", err?.message);
  }
}

export async function POST(request) {
  // 1. Solo usuarios con sesión (cada llamada gasta créditos de Gemini)
  const { user, supabase } = await getRequestUser(request);
  if (!user) return unauthorized("Inicia sesión con Google para generar.");

  // 2. Cuerpo acotado
  const rawBody = await request.text().catch(() => "");
  if (rawBody.length > MAX_BODY_BYTES) {
    return fail(413, "La petición es demasiado grande.");
  }
  let body;
  try {
    body = JSON.parse(rawBody);
  } catch {
    return fail(400, "Cuerpo de la petición inválido.");
  }

  const { stepId, blueprint, extras: rawExtras, ideaRunId } = body || {};
  const station = resolveStation(stepId);
  if (!station) return fail(400, "Estación desconocida.");

  const safeBlueprint =
    blueprint && typeof blueprint === "object" && !Array.isArray(blueprint)
      ? { ...blueprint }
      : {};

  // Un sistema sin pantallas (API, bot) no tiene layout: no se gasta cupo
  if (station.id === "layout" && layoutSurfacesFor(safeBlueprint).length === 0) {
    return fail(400, "Este sistema no tiene pantallas: no hay layout que generar.");
  }

  // 3. Cupo: cada generación gasta una del ticket de la idea. La idea y el
  //    contexto salen del ticket (no del navegador), así no se recicla una idea
  //    para otra. Las cuentas sin límite no usan ticket.
  // Ticket del que se descontó esta generación (para devolverla si falla)
  let chargedRun = null;
  if (!isUnlimitedUser(user)) {
    if (!isUuid(ideaRunId)) {
      return fail(
        403,
        "Esta ruta no tiene una idea activa. Vuelve a la Estación 0 y comienza de nuevo.",
        "NO_IDEA_RUN",
      );
    }
    const { data: run, error: runError } = await supabase.rpc(
      "use_idea_generation",
      { p_run: ideaRunId },
    );
    if (runError) {
      return serverError("generate-step cupo", runError, "No se pudo verificar tu cupo.");
    }
    if (!run) {
      return fail(
        429,
        "Esta idea llegó a su límite de generaciones. Empieza una idea nueva cuando tengas cupo.",
        "IDEA_GENERATIONS_LIMIT",
      );
    }
    chargedRun = ideaRunId;
    safeBlueprint.idea = run.idea;
    safeBlueprint.context = run.context;
  }

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

    // El usuario canceló (botón Pausar) mientras se generaba: nadie recibe
    // estas cartas, así que la generación vuelve a su cupo
    if (request.signal?.aborted && chargedRun) {
      await refundGeneration(supabase, chargedRun);
    }
    return NextResponse.json({ success: true, data });
  } catch (error) {
    // El detalle técnico queda en el log; al navegador, un mensaje genérico
    console.error("[API generate-step] Error:", error);
    // Un fallo nuestro (o una cancelación) no le cuesta cupo al usuario
    if (chargedRun) await refundGeneration(supabase, chargedRun);
    const isInvalidOutput = error instanceof InvalidModelOutputError;
    return fail(
      isInvalidOutput ? 502 : 503,
      isInvalidOutput
        ? "La IA devolvió una respuesta incompleta. Intenta de nuevo."
        : "La IA no respondió a tiempo. Intenta de nuevo en unos segundos.",
    );
  }
}
