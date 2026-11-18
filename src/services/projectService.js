import { supabase } from "@/lib/supabaseClient";

// ==========================================
// AUTENTICACIÓN GOOGLE OAUTH
// ==========================================
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/`,
    },
  });
  if (error) throw error;
  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Helper para adjuntar el JWT a las llamadas REST
async function getAuthHeaders() {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return {
    "Content-Type": "application/json",
    ...(session?.access_token
      ? { Authorization: `Bearer ${session.access_token}` }
      : {}),
  };
}

// ==========================================
// CRUD PROYECTOS CONSUMIENDO NUESTROS ENDPOINTS REST
// ==========================================

/**
 * Guarda o actualiza el proyecto y su blueprint a través de la API REST
 */
export async function syncProjectToCloud({
  projectId = null,
  blueprint,
  generatedOptions = {},
  currentStep = 0,
  isCompleted = false,
  ideaRunId = null,
}) {
  const headers = await getAuthHeaders();
  // Modo local: sin sesión no escribe en la nube
  if (!headers.Authorization) return null;

  const body = JSON.stringify({
    blueprint,
    generatedOptions,
    currentStep,
    isCompleted,
    ideaRunId,
  });

  if (projectId) {
    // PUT /api/projects/[id]
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers,
      body,
    });

    if (res.ok) {
      const data = await res.json();
      return data.projectId;
    }

    // 404: el proyecto se borró en la nube -> lo recreamos con POST
    if (res.status !== 404) {
      const err = await readJsonSafe(res);
      throw new Error(err.error || "Error al actualizar el proyecto");
    }
  }

  // POST /api/projects
  const res = await fetch("/api/projects", { method: "POST", headers, body });

  if (!res.ok) {
    const err = await readJsonSafe(res);
    throw new Error(err.error || "Error al crear el proyecto en la nube");
  }

  const data = await res.json();
  return data.projectId;
}

async function readJsonSafe(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

/**
 * Obtiene todos los proyectos del usuario a través de GET /api/projects
 */
export async function fetchUserProjects() {
  const user = await getCurrentUser();
  if (!user) return [];

  const headers = await getAuthHeaders();
  const res = await fetch("/api/projects", {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    const err = await readJsonSafe(res);
    throw new Error(err.error || "Error al obtener proyectos");
  }

  const { data } = await res.json();
  return data || [];
}

/**
 * Elimina un proyecto a través de DELETE /api/projects/[id]
 */
export async function deleteProjectFromCloud(projectId) {
  const headers = await getAuthHeaders();
  const res = await fetch(`/api/projects/${projectId}`, {
    method: "DELETE",
    headers,
  });

  if (!res.ok) {
    const err = await readJsonSafe(res);
    throw new Error(err.error || "Error al eliminar el proyecto");
  }

  return true;
}

// ==========================================
// HERRAMIENTAS DE DESARROLLO (cuentas autorizadas en el servidor)
// ==========================================

/** ¿La sesión actual puede usar las herramientas de desarrollo? */
export async function checkDevToolsAccess() {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return false;
  const res = await fetch("/api/dev-tools", { headers });
  if (!res.ok) return false;
  const { enabled } = await readJsonSafe(res);
  return Boolean(enabled);
}

/** Proyecto de prueba completo hasta el Layout (403 si no está autorizado). */
export async function fetchTestProject() {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/dev-tools/test-project", { headers });
  const body = await readJsonSafe(res);
  if (!res.ok || !body.data) {
    throw new Error(body.error || "No se pudo cargar el proyecto de prueba");
  }
  return body.data;
}

// ==========================================
// GENERACIÓN CON IA Y CUPO DE IDEAS
// ==========================================

/** Error de la API con su status y cuerpo (p. ej. 429 con el cupo). */
export class ApiError extends Error {
  constructor(message, status, body = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = body.code || null;
    this.body = body;
  }
}

/**
 * Sesión vencida o revocada (401): se cierra la sesión local y la portada
 * vuelve a pedir el login. El mapa del navegador no se borra.
 */
async function handleUnauthorized(res) {
  if (res.status === 401) {
    await supabase.auth.signOut({ scope: "local" }).catch(() => {});
  }
}

/** Cupo de ideas del usuario: { unlimited, used, limit, nextFreeAt }. */
export async function fetchIdeaQuota() {
  const headers = await getAuthHeaders();
  if (!headers.Authorization) return null;
  const res = await fetch("/api/idea-runs", { headers });
  const body = await readJsonSafe(res);
  if (!res.ok) {
    await handleUnauthorized(res);
    throw new ApiError(body.error || "No se pudo leer tu cupo.", res.status, body);
  }
  return body;
}

/**
 * Abre una idea nueva (ticket). Lanza ApiError 429 (`code: "IDEA_LIMIT"`) si
 * no queda cupo; su `body` trae `nextFreeAt`.
 * @returns {Promise<{ ideaRunId: string|null, unlimited: boolean, used: number, limit: number|null, nextFreeAt: string|null }>}
 */
export async function claimIdeaRun(idea, context) {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/idea-runs", {
    method: "POST",
    headers,
    body: JSON.stringify({ idea, context }),
  });
  const body = await readJsonSafe(res);
  if (!res.ok) {
    await handleUnauthorized(res);
    throw new ApiError(body.error || "No se pudo abrir la idea.", res.status, body);
  }
  return body;
}

/** Pide a la IA las cartas de una estación (con sesión y ticket de idea). */
export async function requestStepGeneration({
  stepId,
  blueprint,
  extras,
  ideaRunId,
  signal,
}) {
  const headers = await getAuthHeaders();
  const res = await fetch("/api/generate-step", {
    method: "POST",
    signal,
    headers,
    body: JSON.stringify({ stepId, blueprint, extras, ideaRunId }),
  });
  const body = await readJsonSafe(res);
  if (!res.ok || !body.success) {
    await handleUnauthorized(res);
    throw new ApiError(
      body.error || "No se pudo generar la propuesta técnica.",
      res.status,
      body,
    );
  }
  return body.data;
}
