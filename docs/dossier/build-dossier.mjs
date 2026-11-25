// Dossier de Dev.Idea: Markdown → HTML (portada, índice, diagramas Mermaid) → PDF con Chrome.
// Uso: node build-dossier.mjs <raíz del proyecto> <carpeta de salida HTML>
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [, , root, outDir] = process.argv;
const nm = (p) => path.join(root, "node_modules/.pnpm", p);
const { marked } = await import(pathToFileURL(nm("marked@16.4.2/node_modules/marked/lib/marked.esm.js")).href);
const mermaidJs = pathToFileURL(nm("mermaid@11.17.2/node_modules/mermaid/dist/mermaid.min.js")).href;
const logo = pathToFileURL(path.join(root, "public/assets/readme/dev-idea-lockup-light.svg")).href;

const md = fs.readFileSync(path.join(root, "docs/dossier/dev-idea-dossier.md"), "utf8");

// Ids para el índice + bloques mermaid como <div class="mermaid">
const slug = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const toc = [];
const renderer = new marked.Renderer();
renderer.heading = function ({ tokens, depth }) {
  const text = this.parser.parseInline(tokens);
  const plain = text.replace(/<[^>]+>/g, "");
  const id = slug(plain);
  if (depth <= 2) toc.push({ depth, text: plain, id });
  // Los anexos B, C y D son cortos: comparten página
  const cls = depth === 1 && /^Anexo [B-Z]/.test(plain) ? ' class="keep"' : "";
  return `<h${depth} id="${id}"${cls}>${text}</h${depth}>\n`;
};
renderer.code = function ({ text, lang }) {
  if (lang === "mermaid") return `<figure class="diagram"><div class="mermaid">${text}</div></figure>`;
  const esc = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return `<pre><code>${esc}</code></pre>`;
};
renderer.link = function ({ href, tokens }) {
  return `<a href="${href}">${this.parser.parseInline(tokens)}</a>`;
};
const body = marked.parse(md, { renderer, gfm: true });

const tocHtml = toc
  .map((t) => `<li class="toc-${t.depth}"><a href="#${t.id}">${t.text}</a></li>`)
  .join("\n");

const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<title>Dev.Idea · Documentación técnica y de pruebas</title>
<style>
  @page { size: A4; margin: 15mm 15mm 17mm 15mm;
    @bottom-center { content: "Dev.Idea · Documentación técnica y de pruebas  —  " counter(page); font: 8pt "Segoe UI", sans-serif; color: #8a8a8a; } }
  @page :first { @bottom-center { content: none; } }
  :root { --ink: #1f2328; --muted: #57606a; --line: #d0d7de; --soft: #f6f8fa; --accent: #6d4fc2; }
  * { box-sizing: border-box; }
  html { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  body { font: 9.6pt/1.5 "Segoe UI", system-ui, -apple-system, sans-serif; color: var(--ink); margin: 0; }
  a { color: var(--accent); text-decoration: none; }
  h1 { break-before: page; font-size: 20pt; margin: 0 0 10pt; padding-bottom: 6pt; border-bottom: 2.5pt solid var(--accent); }
  h1.keep { break-before: auto; margin-top: 18pt; }
  h2 { font-size: 13.5pt; margin: 18pt 0 6pt; color: #2b2340; break-after: avoid; }
  h3 { font-size: 11pt; margin: 12pt 0 4pt; break-after: avoid; }
  p, li { orphans: 3; widows: 3; }
  ul, ol { padding-left: 18pt; }
  li { margin: 2pt 0; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0 12pt; font-size: 8.3pt; break-inside: auto; }
  thead { display: table-header-group; }
  tr { break-inside: avoid; }
  th { background: #efeaf9; color: #2b2340; text-align: left; font-weight: 600; }
  th, td { border: 0.6pt solid var(--line); padding: 3pt 5pt; vertical-align: top; }
  tr:nth-child(even) td { background: #fbfbfd; }
  code { font: 8.4pt Consolas, "Cascadia Mono", monospace; background: var(--soft); padding: 0.5pt 3pt; border-radius: 3pt; }
  pre { background: var(--soft); border: 0.6pt solid var(--line); border-radius: 5pt; padding: 8pt 10pt; overflow: hidden; break-inside: avoid; }
  pre code { background: none; padding: 0; font-size: 8pt; line-height: 1.45; white-space: pre-wrap; }
  blockquote { margin: 8pt 0; padding: 6pt 10pt; border-left: 3pt solid var(--accent); background: #f7f4fd; color: var(--muted); }
  figure.diagram { margin: 10pt 0 14pt; padding: 10pt; border: 0.6pt solid var(--line); border-radius: 6pt; text-align: center; break-inside: avoid; }
  figure.diagram svg { max-width: 100% !important; height: auto; max-height: 150mm; }
  strong { color: #111; }
  /* Portada */
  .cover { height: 255mm; display: flex; flex-direction: column; justify-content: space-between; padding: 30mm 6mm 6mm; }
  .cover img { width: 92mm; }
  .cover .title { font-size: 26pt; font-weight: 700; line-height: 1.15; margin: 18mm 0 4mm; color: #1b1530; }
  .cover .subtitle { font-size: 12pt; color: var(--muted); max-width: 140mm; }
  .cover .band { height: 4pt; width: 60mm; background: linear-gradient(90deg, #f59e0b, #38bdf8, #a78bfa, #34d399); border-radius: 4pt; margin: 8mm 0; }
  .cover table { width: auto; font-size: 9.5pt; }
  .cover td { border: none; padding: 2pt 14pt 2pt 0; background: none !important; }
  .cover td:first-child { color: var(--muted); }
  /* Índice */
  .toc { break-before: page; }
  .toc h1 { break-before: avoid; }
  .toc ol { list-style: none; padding: 0; columns: 1; }
  .toc li { margin: 0; padding: 2.5pt 0; border-bottom: 0.4pt dotted var(--line); }
  .toc .toc-1 a { font-weight: 600; color: var(--ink); }
  .toc .toc-2 { padding-left: 14pt; font-size: 9pt; }
  .toc .toc-2 a { color: var(--muted); }
</style>
</head>
<body>
<section class="cover">
  <div>
    <img src="${logo}" alt="Dev.Idea" />
    <div class="title">Documentación técnica<br/>y de pruebas</div>
    <div class="subtitle">Lienzo interactivo para planificar software paso a paso: descripción del sistema, requisitos, historias de usuario, arquitectura, frontend, backend, inteligencia artificial, pruebas y despliegue.</div>
    <div class="band"></div>
    <table>
      <tr><td>Versión</td><td>1.0</td></tr>
      <tr><td>Fecha</td><td>Noviembre de 2026</td></tr>
      <tr><td>Producción</td><td>dev-idea-eight.vercel.app</td></tr>
      <tr><td>Repositorio</td><td>github.com/Ju4mpizel/dev-idea</td></tr>
      <tr><td>Commit documentado</td><td>baf5659</td></tr>
    </table>
  </div>
  <div style="font-size:8.5pt;color:#8a8a8a">Next.js 16 · React 19 · Tailwind CSS 4 · Supabase · Google Gemini · Vercel</div>
</section>
<nav class="toc"><h1>Índice</h1><ol>${tocHtml}</ol></nav>
${body}
<script src="${mermaidJs}"></script>
<script>
  mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict",
    flowchart: { useMaxWidth: true, htmlLabels: true }, er: { useMaxWidth: true }, sequence: { useMaxWidth: true },
    fontFamily: "Segoe UI, sans-serif" });
  mermaid.run({ querySelector: ".mermaid" }).then(() => { document.body.dataset.ready = "1"; })
    .catch((e) => { document.body.dataset.ready = "error:" + e.message; });
</script>
</body>
</html>`;

fs.mkdirSync(outDir, { recursive: true });
const out = path.join(outDir, "dossier.html");
fs.writeFileSync(out, html);
console.log(out, "secciones:", toc.filter((t) => t.depth === 1).length, "subsecciones:", toc.filter((t) => t.depth === 2).length);
