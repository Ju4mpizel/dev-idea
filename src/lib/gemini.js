const apiKey = process.env.GEMINI_API_KEY;
const projectId = process.env.GOOGLE_CLOUD_PROJECT || "dev-idea-510800";

// Modelos activos en orden de prioridad y costo/eficiencia
export const MODELS = [
  "gemini-3.8-flash", // Principal: máxima capacidad y velocidad
  "gemini-3.7-flash", // Fallback 1: optimizado para código y agentes
  "gemini-3.5-flash-lite", // Fallback 2: liviano y rápido ante saturación
];

// Presupuesto de tiempo total (debe quedar por debajo del maxDuration de la ruta)
const DEFAULT_BUDGET_MS = 80_000;
// Tope por intento. Medido en vivo con 6 cartas por estación: 14-28 s en
// gemini-3.8-flash; Diagramas (con ejemplos Mermaid) supera los 35 s.
const ATTEMPT_TIMEOUT_MS = 50_000;
// Tiempo que se reserva para cada modelo de respaldo pendiente (flash-lite responde
// en ~3-5 s), para que un intento lento no deje sin oportunidad a los demás.
const FALLBACK_RESERVE_MS = 10_000;
// Por debajo de esto no vale la pena lanzar otro intento
const MIN_ATTEMPT_MS = 5_000;
const RETRY_PAUSE_MS = 400;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Llama al pool de modelos en orden hasta obtener una respuesta VÁLIDA.
 *
 * Un intento falla si: hay error HTTP/red, la respuesta llega vacía, se agota su
 * timeout o `validate(text)` lanza. En cualquiera de esos casos se pasa al siguiente
 * modelo, siempre que quede presupuesto de tiempo (`budgetMs`).
 *
 * @param {object} options  Cuerpo de generateContent.
 * @param {object} [config]
 * @param {(text: string) => any} [config.validate]  Devuelve el valor final o lanza.
 * @param {number} [config.budgetMs]
 * @returns {Promise<any>} El resultado de `validate` (o el texto crudo sin validador).
 */
export async function generateWithFallback(
  options,
  { validate = (text) => text, budgetMs = DEFAULT_BUDGET_MS } = {},
) {
  if (!apiKey) {
    throw new Error("Falta GEMINI_API_KEY en .env.local");
  }

  const deadline = Date.now() + budgetMs;
  let lastError = null;

  for (const [index, modelName] of MODELS.entries()) {
    const remaining = deadline - Date.now();
    if (remaining < MIN_ATTEMPT_MS) {
      console.warn(
        `[Gemini] Presupuesto agotado; se omiten ${MODELS.length - index} modelo(s).`,
      );
      break;
    }

    const isLast = index === MODELS.length - 1;
    const fallbacksLeft = MODELS.length - 1 - index;
    const timeoutMs = isLast
      ? remaining
      : Math.max(
          MIN_ATTEMPT_MS,
          Math.min(
            ATTEMPT_TIMEOUT_MS,
            remaining - fallbacksLeft * FALLBACK_RESERVE_MS,
          ),
        );

    try {
      console.log(
        `[Gemini] Intento ${index + 1}/${MODELS.length}: ${modelName}`,
      );
      const text = await callModelWithSchemaGuard(
        modelName,
        options,
        timeoutMs,
      );
      return validate(text);
    } catch (err) {
      lastError =
        err?.name === "TimeoutError"
          ? new Error(`${modelName} excedió ${Math.round(timeoutMs / 1000)}s`)
          : err;
      console.warn(
        `[Gemini] ${modelName} descartado:`,
        lastError?.message || lastError,
      );
      if (!isLast) await sleep(RETRY_PAUSE_MS);
    }
  }

  throw (
    lastError ||
    new Error("Todos los modelos del pool de fallbacks fallaron al responder.")
  );
}

/**
 * Si un modelo rechaza el `responseSchema` (400 que menciona el esquema), reintenta
 * ese mismo modelo sin esquema: el saneamiento de stepContracts sigue protegiendo.
 * Verificado en vivo: los 3 modelos actuales aceptan los esquemas de stepSchemas.js.
 */
async function callModelWithSchemaGuard(modelName, options, timeoutMs) {
  const startedAt = Date.now();
  try {
    return await callModel(modelName, options, timeoutMs);
  } catch (err) {
    const hasSchema = Boolean(options?.generationConfig?.responseSchema);
    const isSchemaRejection =
      err?.status === 400 && /schema/i.test(err?.message || "");
    if (!hasSchema || !isSchemaRejection) throw err;

    console.warn(
      `[Gemini] ${modelName} rechazó responseSchema; reintento sin él.`,
    );
    const { responseSchema, ...generationConfig } = options.generationConfig;
    const remaining = timeoutMs - (Date.now() - startedAt);
    return callModel(
      modelName,
      { ...options, generationConfig },
      Math.max(remaining, MIN_ATTEMPT_MS),
    );
  }
}

async function callModel(modelName, options, timeoutMs) {
  const endpoint = `https://aiplatform.googleapis.com/v1/projects/${projectId}/locations/global/publishers/google/models/${modelName}:generateContent?key=${apiKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(options),
    signal: AbortSignal.timeout(timeoutMs),
  });

  const responseData = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(
      responseData?.error?.message || `HTTP ${res.status}: ${res.statusText}`,
    );
    error.status = res.status;
    throw error;
  }

  const text = responseData?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error(`Respuesta vacía recibida de ${modelName}`);
  }
  return text;
}
