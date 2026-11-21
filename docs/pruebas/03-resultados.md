# 03 · Resultados de las pruebas

## 1. Pruebas automatizadas

Ejecución local con `pnpm test:coverage` (Vitest 5.1.1, Node.js 24, Windows 11).

| Métrica | Resultado |
|---------|-----------|
| Archivos de prueba | 14 (10 unitarios, 4 de integración) |
| Pruebas | **125** |
| Aprobadas | **125 (100 %)** |
| Fallidas | 0 |
| Duración total | < 1 segundo |

### Pruebas por archivo

| Archivo | Tipo | Pruebas | Estado |
|---------|------|:------:|:------:|
| `systemTypes.test.js` | Unitaria | 13 | ✅ |
| `ideaGuard.test.js` | Unitaria | 15 | ✅ |
| `devPreferences.test.js` | Unitaria | 11 | ✅ |
| `stations.test.js` | Unitaria | 14 | ✅ |
| `databases.test.js` | Unitaria | 8 | ✅ |
| `stepContracts.test.js` | Unitaria | 11 | ✅ |
| `prompts.test.js` | Unitaria | 10 | ✅ |
| `costTier.test.js` | Unitaria | 3 | ✅ |
| `edgeCases.test.js` | Unitaria | 2 | ✅ |
| `misc.test.js` | Unitaria | 7 | ✅ |
| `generateStep.test.js` | Integración | 10 | ✅ |
| `ideaRuns.test.js` | Integración | 8 | ✅ |
| `projects.test.js` | Integración | 9 | ✅ |
| `devTools.test.js` | Integración | 4 | ✅ |

### Ciclo de detección y corrección

Las pruebas nuevas encontraron **3 errores reales** (ERR-12, ERR-13, ERR-14 en el [registro](04-registro-de-errores.md)). En cada caso:

1. Se escribió la prueba con el resultado esperado.
2. La prueba **falló** (por ejemplo: `expected 'free' to be 'low'` al etiquetar una carta de deploy de "≈ 12 €/mes").
3. Se corrigió el código.
4. Se volvió a correr la batería completa: **125 de 125 aprobadas**.

## 2. Cobertura de código

Medida con `@vitest/coverage-v8` sobre la lógica y las rutas API (`src/lib`, `src/data`, `src/config`, `src/app/api`). Se excluyen datos de demostración, textos y los clientes de red, que se simulan.

| Métrica | Cobertura |
|---------|:---------:|
| Líneas | **85,24 %** (942 / 1105) |
| Sentencias | **82,81 %** (1046 / 1263) |
| Funciones | **78,15 %** |
| Ramas | **68,09 %** |

| Módulo | Líneas |
|--------|:------:|
| `ideaGuard.js` (filtro de ideas) | 96,8 % |
| `stations.config.js` (estaciones y modos) | 95,8 % |
| `systemTypes.js` (tipos de sistema) | 95,3 % |
| `databases.js` (bases de datos) | 97,3 % |
| `devPreferences.js` (entorno y comandos) | 95,1 % |
| `stepContracts.js` (contratos de la IA) | 97,3 % |
| `supabaseServer.js` (auth y validación) | 100 % |
| `api/idea-runs` (cupo y filtro) | 88,4 % |
| `api/generate-step` (generación) | 86,8 % |

El reporte HTML completo se genera en `coverage/index.html` y GitHub Actions lo guarda como artefacto (`cobertura`) en cada ejecución.

## 3. Pruebas funcionales

_Completar al ejecutar los casos de [02 · Casos de prueba](02-casos-de-prueba.md#2-casos-funcionales-manuales-sobre-la-app-desplegada) sobre la URL de producción._

| Resumen | Cantidad |
|---------|:--------:|
| Casos ejecutados | /20 |
| Aprobados | |
| Fallidos | |

## 4. Rendimiento y calidad (Lighthouse)

_Completar con Chrome DevTools → Lighthouse sobre la URL de producción (modo incógnito)._

| Página | Dispositivo | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
|--------|-------------|:-----------:|:-------------:|:----------------:|:---:|
| Landing | Escritorio | | | | |
| Landing | Móvil | | | | |
| App (Estación 0, con sesión) | Escritorio | | | | |
| App (Estación 0, con sesión) | Móvil | | | | |

## 5. Integración continua

| Paso del workflow | Resultado |
|-------------------|-----------|
| Instalar dependencias | _(ver pestaña Actions del repositorio)_ |
| Lint | |
| Pruebas con cobertura | |
| Build de producción | |
