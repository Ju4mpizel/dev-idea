# 04 · Registro de errores

Errores encontrados durante el desarrollo, la revisión de código y las pruebas automatizadas. Todos están **corregidos** y cubiertos por al menos una prueba o verificación.

**Severidad:** Alta (bloquea o da un resultado incorrecto al usuario) · Media (resultado confuso o riesgo controlado) · Baja (detalle visual o de experiencia).

**Detección:** Uso (al probar la app) · Revisión (análisis estático / revisión de código) · Prueba (prueba automatizada que falló).

| ID | Error | Severidad | Detección | Causa | Corrección | Commit | Verificado por |
|----|-------|:---------:|:---------:|-------|------------|:------:|----------------|
| ERR-01 | "Landing… lo más rápido **posible**" recomendaba un sistema POS | Alta | Uso | Las palabras clave se buscaban por prefijo: "pos" coincidía con "posible" | Búsqueda por palabra completa con plural opcional | `05d27f9` | `systemTypes.test.js` |
| ERR-02 | "restaurante" detectaba una API y "botón"/"botica" un bot | Alta | Uso | Mismo problema de prefijos ("rest", "bot") | Igual que ERR-01 y limpieza de pistas genéricas | `05d27f9` | `systemTypes.test.js` |
| ERR-03 | Un bot o una API recibía layouts de "Sitio público" | Media | Revisión | Faltaba contemplar sistemas sin pantallas | Layout se resuelve sin IA con un aviso; el servidor lo rechaza sin descontar cupo | `05d27f9` | `misc.test.js`, `generateStep.test.js` |
| ERR-04 | Se podía elegir "Laravel + MySQL" y luego MongoDB, o una carta "sin base de datos" en un POS | Alta | Revisión | Stack y Base de datos decidían la base por separado | Stack sin motor de base; interruptor "¿guardará datos?" según el tipo de sistema | `05d27f9` | `databases.test.js`, `prompts.test.js` |
| ERR-05 | Texto borroso en algunas pantallas | Baja | Uso | `will-change: transform` permanente en elementos con texto | Capa de GPU solo mientras se anima (`useAnimatingLayer`) | `04608ca` | Verificación visual |
| ERR-06 | Logo deformado en el README de GitHub en celular | Baja | Uso | Imagen horizontal (1062×235) forzada a 140×140 | SVG con proporción real y versión clara/oscura (`<picture>`) | `00208da` | Verificación visual a 375 px |
| ERR-07 | Una generación que fallaba igual descontaba del cupo | Media | Revisión | El cupo se descuenta antes de llamar a Gemini y no se devolvía | Función SQL `refund_idea_generation` llamada si Gemini falla o el usuario cancela | `baf5659` | `generateStep.test.js` |
| ERR-08 | Las rutas de proyectos aceptaban cuerpos de cualquier tamaño | Media | Revisión | Sin límite de tamaño en `POST`/`PUT` | Lectura con tope de 512 KB → 413; JSON inválido → 400 | `baf5659` | `projects.test.js` |
| ERR-09 | Un id de proyecto que no es UUID devolvía error 500 | Baja | Revisión | El id llegaba sin validar a la base de datos | Validación de UUID → 400 `INVALID_ID` | `baf5659` | `projects.test.js` |
| ERR-10 | Un proyecto podía vincularse al ticket de idea de otra cuenta | Media | Revisión | Solo se validaba el formato del `idea_run_id` | Se comprueba que el ticket pertenezca al usuario (RLS) | `baf5659` | `projects.test.js` |
| ERR-11 | Sin páginas propias de error; numeración con saltos en modos cortos | Baja | Revisión | Faltaban `error.jsx`/`not-found.jsx`; se mostraba el número interno de la estación | Páginas de error y 404 propias; numeración por posición en el modo | `baf5659` | `stations.test.js`, verificación visual |
| ERR-12 | Una carta de la estación Deploy que costaba "≈ 12 €/mes" se etiquetaba como **Gratis** | Media | Prueba | Solo se reconocían montos con "$" | Reconocimiento de montos con $, US$, €, USD, EUR o "dólares", ignorando "GB" o "peticiones" | `baf5659` | `costTier.test.js` |
| ERR-13 | "Quiero una **página** para mostrar mis diseños de poleras" se rechazaba como fuera de tema | Alta | Prueba | Solo "página web" contaba como software, no "página" sola | "página" agregada a las pistas de software | `baf5659` | `edgeCases.test.js` |
| ERR-14 | `npx -y create-next-app` se traducía mal a otros gestores | Media | Prueba | La bandera `-y` se tomaba como nombre del paquete | Se ignoran `-y` / `--yes` (solo aplican a npx) | `baf5659` | `edgeCases.test.js` |

## Resumen

| Severidad | Cantidad | Corregidos |
|-----------|:--------:|:----------:|
| Alta | 5 | 5 |
| Media | 6 | 6 |
| Baja | 3 | 3 |
| **Total** | **14** | **14** |

| Detección | Cantidad |
|-----------|:--------:|
| Uso de la aplicación | 5 |
| Revisión de código | 6 |
| Pruebas automatizadas | 3 |

> Los errores ERR-07 a ERR-14 se corrigieron en el commit `baf5659` ("feat: Pruebas"), verificado por GitHub Actions y desplegado en Vercel.
