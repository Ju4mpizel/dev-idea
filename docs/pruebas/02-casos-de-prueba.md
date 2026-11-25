# 02 · Casos de prueba

## 1. Pruebas automatizadas (Vitest)

### 1.1 Unitarias (`tests/unit`)

| Archivo | Pruebas | Qué verifica | Funcionalidad |
|---------|:------:|--------------|:-------------:|
| `systemTypes.test.js` | 13 | Detección del tipo de sistema, vista enfocada, palabra completa ("posible" ≠ POS), complementos | F-05 |
| `ideaGuard.test.js` | 15 | Filtro de ideas: rechaza poleras, logos, poemas y recetas; acepta software; casos dudosos | F-02 |
| `devPreferences.test.js` | 11 | Comandos con npm/pnpm/yarn/bun, ecosistemas por lenguaje, preferencias de entorno | F-06, F-11 |
| `stations.test.js` | 14 | Registro de estaciones, rutas por modo, numeración, migraciones de cartas, blueprint ↔ Supabase | F-04, F-12 |
| `databases.test.js` | 8 | Valor inicial del interruptor de base de datos, motor y administradores de cada carta | F-07 |
| `stepContracts.test.js` | 11 | Lectura del JSON de la IA, normalización por estación, cierre (comandos, sugerencias, diagramas) | F-08, F-11 |
| `prompts.test.js` | 10 | Coherencia entre estaciones en los prompts y protección contra prompt-injection | F-06, F-07, F-10 |
| `costTier.test.js` | 3 | Franja de costo deducida del texto (dólares, euros, monedas al final) | F-10 |
| `edgeCases.test.js` | 2 | Casos borde encontrados al probar ("página" sin "web", `npx -y`) | F-02, F-11 |
| `misc.test.js` | 7 | Paletas con contraste mínimo, layout sin pantallas, `AGENTS.md`, Mi plano por modo | F-09, F-11 |

### 1.2 Integración (`tests/integration`)

Ejecutan las **rutas API reales** (`POST`/`GET`/`PUT`/`DELETE`) con sus prompts, contratos y validaciones; solo Supabase y Gemini se reemplazan por dobles en memoria.

| Archivo | Pruebas | Escenarios |
|---------|:------:|------------|
| `generateStep.test.js` | 10 | Sin sesión → 401 · estación desconocida → 400 · sin ticket → 403 · ticket agotado → 429 · éxito con cartas normalizadas y la idea del ticket · Gemini falla → 503 + devolución de cupo · respuesta incompleta → 502 + devolución · función de devolución ausente no rompe · layout sin pantallas → 400 sin cupo · cuerpo grande → 413 |
| `ideaRuns.test.js` | 8 | Sin sesión → 401 · idea válida abre ticket · idea fuera de tema → 422 sin IA ni cupo · idea corta → 422 · caso dudoso decidido por la IA · IA caída deja pasar · sin cupo → 429 con hora de liberación · consulta de cupo |
| `projects.test.js` | 9 | Sin sesión → 401 · crea proyecto con modo · no vincula ticket ajeno · cuerpo grande → 413 · JSON inválido → 400 · rollback si falla el blueprint · id no UUID → 400 · proyecto ajeno → 404 · actualización |
| `devTools.test.js` | 4 | Herramientas de desarrollo solo para `DEV_TOOLS_EMAILS` · sin sesión no hay acceso · URL pública del sitio |

**Total: 125 pruebas en 14 archivos.**

## 2. Casos funcionales (manuales, sobre la app desplegada)

Ejecutados en producción ([dev-idea-eight.vercel.app](https://dev-idea-eight.vercel.app)) con una sesión real de Google. La evidencia de cada caso es su captura, incluida en el informe con el mismo ID.

| ID | Caso | Resultado esperado | Resultado obtenido | Estado |
|----|------|--------------------|--------------------|:------:|
| CP-01 | Acceso sin sesión | Se muestra la landing con "Iniciar sesión con Google" | Correcto, como se esperaba (captura CP-01) | ✅ Aprobado |
| CP-02 | Inicio de sesión | Entra a la Estación 0 con avatar y cupo visibles | Correcto, como se esperaba (captura CP-02) | ✅ Aprobado |
| CP-03 | Idea fuera de tema | Strobi se enoja; no se abre el mapa ni baja el cupo | Correcto, como se esperaba (captura CP-03) | ✅ Aprobado |
| CP-04 | Idea muy corta | Strobi pide más detalle | Correcto, como se esperaba (captura CP-04) | ✅ Aprobado |
| CP-05 | Modo Completo por defecto | "Completo" seleccionado; "¿Qué incluye?" muestra las 13 estaciones | Correcto, como se esperaba (captura CP-05) | ✅ Aprobado |
| CP-06 | Recorrido en modo Rápido | Va directo a Tipo de sistema (Estación 1), con POS recomendado | Correcto, como se esperaba (captura CP-06) | ✅ Aprobado |
| CP-07 | Vista enfocada | Solo tipos web + Catálogo; botón "Ver todos los tipos" | Correcto, como se esperaba (captura CP-07) | ✅ Aprobado |
| CP-08 | Stack y entorno | Se guardan; el cierre usa npm en los comandos | Correcto, como se esperaba (captura CP-08) | ✅ Aprobado |
| CP-09 | Base de datos con interruptor | Dev-i avisa que un POS necesita guardar datos | Correcto, como se esperaba (captura CP-09) | ✅ Aprobado |
| CP-10 | Base favorita y administrador | PostgreSQL aparece primera; el administrador queda guardado | Correcto, como se esperaba (captura CP-10) | ✅ Aprobado |
| CP-11 | Sistema sin pantallas | "Tu sistema no tiene pantallas propias"; se continúa sin layout | Correcto, como se esperaba (captura CP-11) | ✅ Aprobado |
| CP-12 | Deploy por franjas | Cartas Gratis, Económico y Profesional, ordenadas | Correcto, como se esperaba (captura CP-12) | ✅ Aprobado |
| CP-13 | Cierre en modo Rápido | Celdas "Sugerido por Dev-i", 2 diagramas y `AGENTS.md` con sugerencias | Correcto, como se esperaba (captura CP-13) | ✅ Aprobado |
| CP-14 | Diagramas desplegables | Se ve el código Mermaid y el diagrama dibujado | Correcto, como se esperaba (captura CP-14) | ✅ Aprobado |
| CP-15 | Descargar `AGENTS.md` | Se descarga `AGENTS.md` con todas las secciones | Correcto, como se esperaba (captura CP-15) | ✅ Aprobado |
| CP-16 | Reescribir desde aquí | Se descarta lo posterior y se puede elegir de nuevo | Correcto, como se esperaba (captura CP-16) | ✅ Aprobado |
| CP-17 | Guardado en la nube | El mapa, las cartas y el modo se conservan | Correcto, como se esperaba (captura CP-17) | ✅ Aprobado |
| CP-18 | Cupo de ideas | La tercera se bloquea mostrando la hora en que se libera | Correcto, como se esperaba (captura CP-18) | ✅ Aprobado |
| CP-19 | Página 404 | Página "Esta estación no existe" con botón al inicio | Correcto, como se esperaba (captura CP-19) | ✅ Aprobado |
| CP-20 | Mapa de ruta por modo | Solo 6 estaciones, numeradas 0 a 5 | Correcto, como se esperaba (captura CP-20) | ✅ Aprobado |

**Resultado: 20 de 20 casos aprobados.**
