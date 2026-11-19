import { NextResponse } from "next/server";
import {
  getRequestUser,
  isUnlimitedUser,
  serverError,
  unauthorized,
} from "@/lib/supabaseServer";
import { generateWithFallback } from "@/lib/gemini";
import { parseModelJson } from "@/lib/stepContracts";
import {
  IDEA_CHECK_SCHEMA,
  buildIdeaCheckPrompt,
  screenIdea,
} from "@/lib/ideaGuard";

// Margen corto: es solo un sí/no antes de abrir la idea
const IDEA_CHECK_BUDGET_MS = 15_000;

/**
 * ¿La idea es de software? Primero el filtro local (sin IA); solo los casos
 * dudosos van a Gemini. Si Gemini falla, se deja pasar (nunca se bloquea a
 * alguien por un error nuestro).
 * @returns {Promise<{ ok: boolean, code?: string, reason?: string }>}
 */
async function checkIdea(idea) {
  const local = screenIdea(idea);
  if (local.verdict === "software") return { ok: true };
  if (local.verdict === "too-short") return { ok: false, code: "IDEA_TOO_SHORT" };
  if (local.verdict === "off-topic") return { ok: false, code: "OFF_TOPIC" };
  try {
    const result = await generateWithFallback(
      {
        contents: [{ role: "user", parts: [{ text: buildIdeaCheckPrompt(idea) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: IDEA_CHECK_SCHEMA,
        },
      },
      {
        budgetMs: IDEA_CHECK_BUDGET_MS,
        validate: (raw) => {
          const parsed = parseModelJson(raw);
          if (typeof parsed?.isSoftware !== "boolean") {
            throw new Error("Respuesta del filtro ilegible");
          }
          return parsed;
        },
      },
    );
    return result.isSoftware
      ? { ok: true }
      : { ok: false, code: "OFF_TOPIC", reason: String(result.reason || "").slice(0, 200) };
  } catch (err) {
    console.warn("[API idea-runs] Filtro de idea no disponible, se deja pasar:", err?.message);
    return { ok: true };
  }
}

/**
 * Cupo de ideas: cada usuario abre como máximo 2 ideas (rutas completas) cada
 * 8 horas. Los límites viven en las funciones SQL `idea_quota` y
 * `claim_idea_run` (supabase/migrations/20261119_limite_ideas.sql).
 */

const UNLIMITED = { unlimited: true, used: 0, limit: null, nextFreeAt: null };

const toQuota = (row = {}) => ({
  unlimited: false,
  used: Number(row.used) || 0,
  limit: Number(row.limit) || 0,
  nextFreeAt: row.next_free_at || null,
});

// GET: cupo actual del usuario
export async function GET(req) {
  try {
    const { user, supabase } = await getRequestUser(req);
    if (!user) return unauthorized();
    if (isUnlimitedUser(user)) return NextResponse.json(UNLIMITED);

    const { data, error } = await supabase.rpc("idea_quota");
    if (error) return serverError("idea-runs GET", error, "No se pudo leer tu cupo.");
    return NextResponse.json(toQuota(data));
  } catch (err) {
    return serverError("idea-runs GET", err, "No se pudo leer tu cupo.");
  }
}

// POST: abre una idea nueva (ticket) si queda cupo
export async function POST(req) {
  try {
    const { user, supabase } = await getRequestUser(req);
    if (!user) return unauthorized("Inicia sesión con Google para empezar una idea.");

    const body = await req.json().catch(() => ({}));
    const idea = typeof body.idea === "string" ? body.idea.trim().slice(0, 600) : "";
    const context = typeof body.context === "string" ? body.context : "startup";
    if (!idea) {
      return NextResponse.json(
        { error: "Escribe tu idea antes de comenzar." },
        { status: 400 },
      );
    }

    // Solo ideas de software: lo demás no abre idea ni gasta cupo
    const check = await checkIdea(idea);
    if (!check.ok) {
      return NextResponse.json(
        {
          code: check.code,
          reason: check.reason || null,
          error:
            check.code === "IDEA_TOO_SHORT"
              ? "Cuéntame un poco más de tu idea."
              : "Tu idea no parece un proyecto de software.",
        },
        { status: 422 },
      );
    }

    // Cuentas sin límite: generan sin ticket
    if (isUnlimitedUser(user)) {
      return NextResponse.json({ ...UNLIMITED, ideaRunId: null });
    }

    const { data, error } = await supabase.rpc("claim_idea_run", {
      p_idea: idea,
      p_context: context,
    });
    if (error) return serverError("idea-runs POST", error, "No se pudo abrir la idea.");

    if (!data?.ok) {
      return NextResponse.json(
        {
          ...toQuota(data),
          code: "IDEA_LIMIT",
          error: "Ya usaste tus ideas disponibles por ahora.",
        },
        { status: 429 },
      );
    }

    return NextResponse.json({ ...toQuota(data), ideaRunId: data.id });
  } catch (err) {
    return serverError("idea-runs POST", err, "No se pudo abrir la idea.");
  }
}
