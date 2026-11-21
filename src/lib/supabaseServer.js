import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

/**
 * Utilidades de servidor para las rutas de la API: un cliente de Supabase que
 * actúa COMO el usuario (su JWT), de modo que RLS y `auth.uid()` aplican igual
 * que en la base. Nunca se usa la service key.
 */

/** Token del encabezado `Authorization: Bearer <jwt>` (o null). */
export function getBearerToken(req) {
  const header = req.headers.get("authorization") || "";
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

/** Cliente de Supabase con el JWT del usuario (o anónimo si no hay token). */
export function getSupabaseForRequest(req) {
  const token = getBearerToken(req);
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      },
    },
  );
}

/**
 * Usuario autenticado de la petición, validado contra Supabase.
 * @returns {Promise<{ user: object|null, supabase: object }>}
 */
export async function getRequestUser(req) {
  const supabase = getSupabaseForRequest(req);
  if (!getBearerToken(req)) return { user: null, supabase };
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return { user: error ? null : user || null, supabase };
}

/**
 * Cuentas sin límites (ideas ilimitadas y herramientas de desarrollo), listadas
 * en la variable de SERVIDOR `DEV_TOOLS_EMAILS` (separadas por comas). La lista
 * nunca llega al navegador ni al repositorio.
 */
function unlimitedEmails() {
  return (process.env.DEV_TOOLS_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isUnlimitedUser(user) {
  const email = user?.email?.toLowerCase();
  return Boolean(email) && unlimitedEmails().includes(email);
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const isUuid = (value) =>
  typeof value === "string" && UUID_RE.test(value);

/**
 * Lee el cuerpo JSON con un tope de tamaño (evita guardar payloads gigantes).
 * @returns {Promise<{ body: object } | { response: NextResponse }>}
 */
export async function readJsonBody(req, maxBytes) {
  const raw = await req.text().catch(() => "");
  if (raw.length > maxBytes) {
    return {
      response: NextResponse.json(
        { error: "La petición es demasiado grande.", code: "PAYLOAD_TOO_LARGE" },
        { status: 413 },
      ),
    };
  }
  try {
    const body = JSON.parse(raw || "{}");
    if (!body || typeof body !== "object" || Array.isArray(body)) throw new Error();
    return { body };
  } catch {
    return {
      response: NextResponse.json(
        { error: "Cuerpo de la petición inválido.", code: "INVALID_BODY" },
        { status: 400 },
      ),
    };
  }
}

/**
 * Ticket de idea solo si existe y es DEL USUARIO (la política RLS de
 * idea_runs solo deja leer los propios). Si no, null: nunca se vincula un
 * proyecto al ticket de otra persona.
 */
export async function ownedIdeaRunId(supabase, value) {
  if (!isUuid(value)) return null;
  const { data, error } = await supabase
    .from("idea_runs")
    .select("id")
    .eq("id", value)
    .maybeSingle();
  return !error && data?.id ? data.id : null;
}

/** Respuesta 400 para un id de proyecto que no es UUID. */
export function invalidId() {
  return NextResponse.json(
    { error: "El id del proyecto no es válido.", code: "INVALID_ID" },
    { status: 400 },
  );
}

/** Respuesta 401 uniforme. */
export function unauthorized(message = "Inicia sesión para continuar.") {
  return NextResponse.json(
    { success: false, error: message, code: "UNAUTHORIZED" },
    { status: 401 },
  );
}

/** Error interno sin filtrar detalles al navegador (quedan en el log). */
export function serverError(tag, err, message = "Error interno del servidor.") {
  console.error(`[API ${tag}]`, err);
  return NextResponse.json(
    { success: false, error: message },
    { status: 500 },
  );
}
