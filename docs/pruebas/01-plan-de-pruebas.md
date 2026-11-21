# 01 · Plan de pruebas

## 1. Descripción del sistema bajo prueba

**Dev.Idea** es una aplicación web (Next.js 16 + Supabase + Google Gemini) que guía a personas que empiezan a programar desde una idea hasta un plano técnico. El usuario recorre estaciones (tipo de sistema, requisitos, stack, base de datos, arquitectura, diagramas, diseño, deploy…) y en cada una elige entre cartas generadas por IA o catálogos fijos. El recorrido termina en un cierre con comandos, estructura de carpetas, modelo de datos, diagramas Mermaid y un `AGENTS.md`.

Componentes principales:

| Capa | Componentes | Responsabilidad |
|------|-------------|-----------------|
| Frontend | Estaciones (`src/components/map/stations`), store Zustand, mapa de ruta, Mi plano, cierre | Interfaz, estado y navegación por modos |
| Lógica de dominio | `src/data/*` (tipos de sistema, bases de datos, entorno, layouts), `src/config/stations.config.js` | Catálogos fijos, detección de la idea, modos del recorrido |
| Contratos e IA | `src/lib/prompts.js`, `stepSchemas.js`, `stepContracts.js`, `ideaGuard.js` | Prompts, esquemas JSON, saneamiento de respuestas, filtro de ideas |
| Backend | `src/app/api/*` | Generación con Gemini, cupo de ideas, proyectos en la nube, herramientas de desarrollo |
| Datos | Supabase (`projects`, `blueprints`, `idea_runs`, funciones SQL con RLS) | Autenticación, guardado y límites |

## 2. Objetivos del plan de pruebas

1. Verificar que la **lógica de recomendación** sea coherente: el tipo de sistema, el stack, la base de datos, los diagramas y el deploy no se contradicen.
2. Comprobar que las **rutas API** respeten la autenticación, el cupo de ideas, el filtro de ideas y la validación de entradas.
3. Asegurar que los **datos guardados** (blueprint, cartas, modo) se conserven entre versiones y al ir y volver de Supabase.
4. Validar los **flujos de usuario** completos en los tres modos del recorrido.
5. Medir el **rendimiento, la accesibilidad y el SEO** de la aplicación desplegada.
6. Registrar, corregir y volver a probar todo error encontrado.

## 3. Alcance

**Dentro del alcance:** lógica de dominio, contratos con la IA, rutas API, persistencia, navegación por modos, interfaz principal y la aplicación desplegada en Vercel.

**Fuera del alcance:** la calidad del texto que genera Gemini (es un servicio externo; se valida su **forma**, no su redacción), el servicio de Google OAuth y la infraestructura interna de Vercel y Supabase.

## 4. Funcionalidades a evaluar

| ID | Funcionalidad | Tipo de prueba |
|----|---------------|----------------|
| F-01 | Inicio de sesión con Google y protección de rutas | Integración, funcional |
| F-02 | Filtro de ideas fuera de desarrollo (Strobi enojado) | Unitaria, integración, funcional |
| F-03 | Cupo de ideas (2 cada 8 horas, 40 generaciones por idea) y devolución de generaciones fallidas | Integración, funcional |
| F-04 | Modos del recorrido (Rápido, Estándar, Completo) | Unitaria, funcional |
| F-05 | Detección del tipo de sistema y vista enfocada | Unitaria, funcional |
| F-06 | Stack según el tipo de sistema + preferencias de entorno | Unitaria, funcional |
| F-07 | Base de datos con interruptor, favorita y administrador | Unitaria, funcional |
| F-08 | Generación de cartas con IA y normalización de respuestas | Unitaria, integración |
| F-09 | Layout por superficie y sistemas sin pantallas | Unitaria, funcional |
| F-10 | Deploy en 3 franjas de costo | Unitaria, funcional |
| F-11 | Cierre: comandos adaptados, diagramas Mermaid, sugerencias, `AGENTS.md` | Unitaria, funcional |
| F-12 | Guardado en la nube y migraciones de datos antiguos | Unitaria, integración |
| F-13 | Modo consulta y "Reescribir desde aquí" | Funcional |
| F-14 | Páginas de error y 404 | Funcional |
| F-15 | Rendimiento, accesibilidad, buenas prácticas y SEO | No funcional (Lighthouse) |

## 5. Tipos de prueba y herramientas

| Tipo | Herramienta | Qué se prueba |
|------|-------------|---------------|
| Unitarias | **Vitest 5** | Funciones puras de `src/lib`, `src/data` y `src/config`. |
| Integración | **Vitest** + Supabase y Gemini simulados | Las rutas API reales conectadas a prompts, contratos y validaciones. |
| Funcionales | Casos manuales con evidencia (capturas) | Flujos completos en la aplicación desplegada, con sesión real. |
| Rendimiento y calidad | **Lighthouse** (Chrome DevTools) | Rendimiento, accesibilidad, buenas prácticas y SEO en móvil y escritorio. |
| Análisis estático | **ESLint** + revisión de código | Errores de código y riesgos de seguridad. |
| Integración continua | **GitHub Actions** | Lint, pruebas y build en cada push. |
| Cobertura | **@vitest/coverage-v8** | Porcentaje de código ejecutado por las pruebas. |

## 6. Entorno de pruebas

| Entorno | Detalle |
|---------|---------|
| Local | Windows 11, Node.js 24, pnpm 12, `next dev` |
| Integración continua | GitHub Actions, Ubuntu, Node.js 24 |
| Producción | Vercel (despliegue automático desde `main`) + Supabase + Gemini |
| Navegadores | Chrome escritorio y Chrome móvil (375 px) |

## 7. Criterios de aceptación

- El 100 % de las pruebas automatizadas pasa en local y en GitHub Actions.
- Cobertura de líneas ≥ 80 % en la lógica probada.
- Todos los casos funcionales críticos (CP marcados como "Alta") en estado **Aprobado**.
- Ningún error de severidad Alta abierto en el registro de errores.
- Lighthouse en escritorio: Accesibilidad, Buenas prácticas y SEO ≥ 90.
