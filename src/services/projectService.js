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
  currentStep = 0,
  isCompleted = false,
}) {
  const user = await getCurrentUser();
  if (!user) return null; // Modo local: sin sesión no escribe en la nube

  const headers = await getAuthHeaders();
  const payload = { blueprint, currentStep, isCompleted };

  if (!projectId) {
    // POST /api/projects
    const res = await fetch("/api/projects", {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al crear el proyecto en la nube");
    }

    const data = await res.json();
    return data.projectId;
  } else {
    // PUT /api/projects/[id]
    const res = await fetch(`/api/projects/${projectId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Error al actualizar el proyecto");
    }

    const data = await res.json();
    return data.projectId;
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
    const err = await res.json();
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
    const err = await res.json();
    throw new Error(err.error || "Error al eliminar el proyecto");
  }

  return true;
}
