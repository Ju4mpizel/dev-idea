import { NextResponse } from "next/server";
import {
  getRequestUser,
  isUnlimitedUser,
  serverError,
  unauthorized,
} from "@/lib/supabaseServer";

/**
 * Cupo de ideas: cada usuario abre como máximo 2 ideas (rutas completas) cada
 * 3 horas. Los límites viven en las funciones SQL `idea_quota` y
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

    // Cuentas sin límite: generan sin ticket
    if (isUnlimitedUser(user)) {
      return NextResponse.json({ ...UNLIMITED, ideaRunId: null });
    }

    const body = await req.json().catch(() => ({}));
    const idea = typeof body.idea === "string" ? body.idea.trim().slice(0, 600) : "";
    const context = typeof body.context === "string" ? body.context : "startup";
    if (!idea) {
      return NextResponse.json(
        { error: "Escribe tu idea antes de comenzar." },
        { status: 400 },
      );
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
