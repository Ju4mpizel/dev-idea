# Pruebas de Dev.Idea

Documentación del plan, la ejecución y los resultados de las pruebas del sistema.

| Documento | Contenido |
|-----------|-----------|
| [01 · Plan de pruebas](01-plan-de-pruebas.md) | Objetivos, alcance, funcionalidades a evaluar, tipos de prueba, herramientas y criterios de aceptación. |
| [02 · Casos de prueba](02-casos-de-prueba.md) | Casos automatizados (unitarios e integración) y casos funcionales manuales (CP-01…CP-20). |
| [03 · Resultados](03-resultados.md) | Resultados reales de Vitest, cobertura, casos funcionales y Lighthouse. |
| [04 · Registro de errores](04-registro-de-errores.md) | Errores encontrados (ERR-01…ERR-14): causa, corrección, commit y prueba que lo cubre. |
| [05 · Despliegue y verificación](05-despliegue.md) | Entorno en Vercel y Supabase, integración continua y verificación del sistema desplegado. |

## Cómo correr las pruebas

```bash
pnpm test            # todas las pruebas (unitarias + integración)
pnpm test:coverage   # con reporte de cobertura (coverage/index.html)
pnpm test:watch      # modo desarrollo: se vuelven a correr al guardar
```

Las pruebas viven en `tests/`:

```text
tests/
├── unit/          # lógica pura: detección, filtros, contratos, prompts, modos…
└── integration/   # rutas API reales con Supabase y Gemini simulados
    └── helpers/fakeSupabase.js
```

En cada push a `main` y en cada pull request, **GitHub Actions** ([`.github/workflows/ci.yml`](../../.github/workflows/ci.yml)) ejecuta lint, pruebas con cobertura y build.
