const apiKey = process.env.GEMINI_API_KEY;
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "dev-idea-510800";

// Modelos activos en orden de prioridad y costo/eficiencia
export const MODELS = [
  "gemini-3.8-flash", // Principal: máxima capacidad y velocidad
  "gemini-3.7-flash", // Fallback 1: optimizado para código y agentes
  "gemini-3.5-flash-lite", // Fallback 2: liviano y rápido ante saturación
];

export async function generateWithFallback(options) {
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY en .env.local");
  }

  let lastError = null;

  for (const modelName of MODELS) {
    try {
      console.log(
        `[Google Cloud Agent Platform] Consultando: ${modelName} (global)...`,
      );

      const endpoint = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${modelName}:generateContent?key=${apiKey}`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(options),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(
          responseData?.error?.message ||
            `HTTP ${res.status}: ${res.statusText}`,
        );
      }

      const text = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (text) {
        return text;
      }

      throw new Error(`Respuesta vacía recibida de ${modelName}`);
    } catch (err) {
      lastError = err;
      console.warn(
        `[Google Cloud Agent Platform] ${modelName} no respondió correctamente:`,
        err?.message || err,
      );
      // Pausa breve de 400ms antes de conmutar al modelo de reserva
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
  }

  throw (
    lastError ||
    new Error("Todos los modelos del pool de fallbacks fallaron al responder.")
  );
}
