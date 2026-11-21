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

Completar las columnas **Resultado obtenido**, **Estado** (Aprobado / Fallido) y **Evidencia** (nombre de la captura) al ejecutar cada caso.

| ID | Func. | Prioridad | Caso | Pasos | Resultado esperado | Resultado obtenido | Estado | Evidencia |
|----|:-----:|:---------:|------|-------|--------------------|--------------------|:------:|:---------:|
| CP-01 | F-01 | Alta | Acceso sin sesión | Abrir la URL sin iniciar sesión | Se muestra la landing con "Iniciar sesión con Google" | | | |
| CP-02 | F-01 | Alta | Inicio de sesión | Pulsar "Iniciar sesión con Google" y elegir la cuenta | Entra a la Estación 0 con avatar y cupo visibles | | | |
| CP-03 | F-02 | Alta | Idea fuera de tema | Escribir "hazme un diseño de una polera" y comenzar | Strobi se enoja; no se abre el mapa ni baja el cupo | | | |
| CP-04 | F-02 | Media | Idea muy corta | Escribir "hola" y comenzar | Strobi pide más detalle | | | |
| CP-05 | F-04 | Alta | Modo Completo por defecto | Abrir la Estación 0 | "Completo" seleccionado; "¿Qué incluye?" muestra las 13 estaciones | | | |
| CP-06 | F-04, F-05 | Alta | Recorrido en modo Rápido | Elegir Rápido, escribir "pos para minimarket" y comenzar | Va directo a Tipo de sistema (Estación 1), con POS recomendado | | | |
| CP-07 | F-05 | Media | Vista enfocada | Idea "landing page para heladeria" → Tipo de sistema | Solo tipos web + Catálogo; botón "Ver todos los tipos" | | | |
| CP-08 | F-06 | Media | Stack y entorno | En Stack elegir una carta y cambiar gestor a npm y editor | Se guardan; el cierre usa npm en los comandos | | | |
| CP-09 | F-07 | Alta | Base de datos con interruptor | En un POS, apagar el interruptor | Dev-i avisa que un POS necesita guardar datos | | | |
| CP-10 | F-07 | Media | Base favorita y administrador | Encender, elegir PostgreSQL y ver cartas; elegir una y su administrador | PostgreSQL aparece primera; el administrador queda guardado | | | |
| CP-11 | F-09 | Media | Sistema sin pantallas | Idea "bot de telegram para recordatorios", tipo Bot, llegar a Layout | "Tu sistema no tiene pantallas propias"; se continúa sin layout | | | |
| CP-12 | F-10 | Media | Deploy por franjas | Llegar a Deploy (Estándar o Completo) | Cartas Gratis, Económico y Profesional, ordenadas | | | |
| CP-13 | F-11 | Alta | Cierre en modo Rápido | Terminar el recorrido Rápido | Celdas "Sugerido por Dev-i", 2 diagramas y `AGENTS.md` con sugerencias | | | |
| CP-14 | F-11 | Media | Diagramas desplegables | En el cierre abrir un diagrama y "Ver dibujado" | Se ve el código Mermaid y el diagrama dibujado | | | |
| CP-15 | F-11 | Media | Descargar `AGENTS.md` | Pulsar "Descargar" en el cierre | Se descarga `AGENTS.md` con todas las secciones | | | |
| CP-16 | F-13 | Media | Reescribir desde aquí | Volver a una estación superada y reescribir | Se descarta lo posterior y se puede elegir de nuevo | | | |
| CP-17 | F-12 | Alta | Guardado en la nube | Recargar la página a mitad del recorrido | El mapa, las cartas y el modo se conservan | | | |
| CP-18 | F-03 | Alta | Cupo de ideas | Abrir 2 ideas y luego una tercera | La tercera se bloquea mostrando la hora en que se libera | | | |
| CP-19 | F-14 | Baja | Página 404 | Abrir `/ruta-que-no-existe` | Página "Esta estación no existe" con botón al inicio | | | |
| CP-20 | F-04 | Media | Mapa de ruta por modo | En modo Rápido abrir "Mapa" | Solo 6 estaciones, numeradas 0 a 5 | | | |
