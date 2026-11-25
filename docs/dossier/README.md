# Documentación técnica y de pruebas de Dev.Idea

| Archivo | Qué es |
|---------|--------|
| [`Dev.Idea-Documentacion.pdf`](Dev.Idea-Documentacion.pdf) | Documento completo (31 páginas): sistema, requisitos, historias de usuario, arquitectura, modelo de datos, frontend, backend, IA, seguridad, pruebas, errores, despliegue y anexos. |
| [`dev-idea-dossier.md`](dev-idea-dossier.md) | Fuente editable del documento (se ve con diagramas directamente en GitHub). |
| [`build-dossier.mjs`](build-dossier.mjs) | Script que convierte la fuente en HTML con portada, índice y diagramas Mermaid. |

## Regenerar el PDF

Después de editar `dev-idea-dossier.md`:

```bash
# 1. Markdown → HTML (en una carpeta temporal)
node docs/dossier/build-dossier.mjs . ./.dossier-tmp

# 2. HTML → PDF con Chrome sin interfaz
"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --no-pdf-header-footer \
  --allow-file-access-from-files --virtual-time-budget=30000 \
  --print-to-pdf=docs/dossier/Dev.Idea-Documentacion.pdf ./.dossier-tmp/dossier.html
```

El script usa `marked` y `mermaid` desde `node_modules/.pnpm` (vienen como dependencias de Mermaid). Si cambian sus versiones en `pnpm-lock.yaml`, actualiza las rutas al inicio del script.
