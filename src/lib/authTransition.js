/**
 * Recuerda, a través de la redirección de Google, que el usuario venía de
 * iniciar sesión: al volver, la puerta de sesión muestra la bienvenida de
 * Dev-i en lugar de una pantalla de carga. sessionStorage puede fallar
 * (modo privado, almacenamiento bloqueado): en ese caso no hay bienvenida.
 */
const KEY = "devidea:auth-transition";

export function markLoginTransition() {
  try {
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // Sin almacenamiento: se vuelve sin bienvenida
  }
}

/** ¿Volvemos de iniciar sesión? Solo si la ida a Google fue reciente. */
export function hasLoginTransition() {
  try {
    const startedAt = Number(sessionStorage.getItem(KEY));
    return startedAt > 0 && Date.now() - startedAt < 10 * 60 * 1000;
  } catch {
    return false;
  }
}

export function clearLoginTransition() {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Nada que borrar
  }
}

export const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
