import { getRequestUser, isUnlimitedUser } from "@/lib/supabaseServer";

/**
 * Herramientas de desarrollo (p. ej. el proyecto de prueba), solo para las
 * cuentas listadas en la variable de servidor DEV_TOOLS_EMAILS. El cliente solo
 * pregunta "¿estoy habilitado?" y el servidor lo verifica con el JWT.
 *
 * @returns {Promise<object|null>} El usuario autorizado, o null.
 */
export async function getDevToolsUser(req) {
  const { user } = await getRequestUser(req);
  return isUnlimitedUser(user) ? user : null;
}
