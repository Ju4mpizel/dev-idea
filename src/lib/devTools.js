import { createClient } from "@supabase/supabase-js";

/**
 * Herramientas de desarrollo (p. ej. el proyecto de prueba), solo para las
 * cuentas listadas en la variable de servidor DEV_TOOLS_EMAILS (separadas por
 * comas). La lista nunca llega al navegador ni al repositorio: el cliente solo
 * pregunta "¿estoy habilitado?" y el servidor lo verifica con el JWT.
 */
function allowedEmails() {
  return (process.env.DEV_TOOLS_EMAILS || "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Usuario autenticado y autorizado a usar las herramientas de desarrollo, o
 * null. Valida el token contra Supabase (no confía en datos del cliente).
 */
export async function getDevToolsUser(req) {
  const emails = allowedEmails();
  if (!emails.length) return null;

  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    { global: { headers: { Authorization: `Bearer ${token}` } } },
  );
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email) return null;
  return emails.includes(user.email.toLowerCase()) ? user : null;
}
