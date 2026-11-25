// Informe de pruebas: Markdown → HTML para abrir en el navegador y copiar/pegar en Word.
// Uso (desde la raíz del proyecto): node docs/informe/build-informe.mjs [nombre]
// nombre: informe-de-pruebas (por defecto) o informe-final
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const nm = (p) => path.join(root, "node_modules/.pnpm", p);
const { marked } = await import(pathToFileURL(nm("marked@16.4.2/node_modules/marked/lib/marked.esm.js")).href);
// Mermaid va incrustado para que el HTML funcione aunque se mueva de carpeta
const mermaidJs = fs.readFileSync(nm("mermaid@11.17.2/node_modules/mermaid/dist/mermaid.min.js"), "utf8").replace(/<\/script/gi, "<\\/script");

const dir = path.join(root, "docs/informe");
const name = process.argv[2] || "informe-de-pruebas";
const md = fs.readFileSync(path.join(dir, name + ".md"), "utf8");
const title = md.match(/^# (.+)$/m)[1];
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

let n = 0;
const renderer = new marked.Renderer();
renderer.code = function ({ text, lang }) {
  const id = `code-${n++}`;
  if (lang === "mermaid") {
    return `<div class="note diagram"><div class="mermaid">${esc(text)}</div>
<details><summary>Código Mermaid</summary><pre id="${id}">${esc(text)}</pre>
<button onclick="copy('${id}', this)">Copiar código</button></details></div>`;
  }
  return `<div class="note cmd"><pre id="${id}">${esc(text)}</pre><button onclick="copy('${id}', this)">Copiar</button></div>`;
};
renderer.blockquote = function ({ tokens }) {
  return `<div class="note tip">${this.parser.parse(tokens)}</div>`;
};
renderer.paragraph = function ({ tokens }) {
  const html = this.parser.parseInline(tokens);
  const cls = html.startsWith("📸") ? ' class="note shot"' : html.startsWith("🧩") ? ' class="note-label"' : "";
  return `<p${cls}>${html}</p>\n`;
};
const body = marked.parse(md, { renderer, gfm: true });

const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8" />
<title>${title}</title>
<style>
  body { font: 11pt/1.55 Calibri, "Segoe UI", sans-serif; color: #1f2328; max-width: 900px; margin: 32px auto; padding: 0 20px; background: #fff; }
  h1 { font-size: 18pt; margin-top: 40px; border-bottom: 2px solid #6d4fc2; padding-bottom: 4px; }
  table { border-collapse: collapse; width: 100%; margin: 10px 0 16px; font-size: 10pt; }
  th { background: #efeaf9; text-align: left; }
  th, td { border: 1px solid #c9ced6; padding: 4px 7px; vertical-align: top; }
  code { font-family: Consolas, monospace; font-size: 9.5pt; background: #f3f4f6; padding: 0 3px; }
  hr { border: none; border-top: 1px dashed #ccc; margin: 30px 0; }
  .note { border-radius: 8px; padding: 10px 14px; margin: 12px 0; }
  .tip { background: #f3f4f6; color: #555; border-left: 4px solid #9ca3af; font-size: 10pt; }
  .shot { background: #fff7e6; border-left: 4px solid #f59e0b; }
  .diagram { border: 1px solid #c9ced6; text-align: center; }
  .note-label { font-weight: 600; color: #2b2340; margin-bottom: 0; }
  .cmd { background: #f3f4f6; }
  pre { text-align: left; background: #f8f8fb; border: 1px solid #e3e3ea; padding: 8px 10px; white-space: pre-wrap; font: 9.5pt Consolas, monospace; }
  details summary { cursor: pointer; color: #6d4fc2; text-align: left; margin-top: 8px; }
  button { font: inherit; font-size: 9.5pt; border: 1px solid #6d4fc2; color: #6d4fc2; background: #fff; border-radius: 6px; padding: 3px 10px; cursor: pointer; }
</style></head>
<body>
${body}
<script>${mermaidJs}</script>
<script>
  mermaid.initialize({ startOnLoad: true, theme: "neutral", fontFamily: "Calibri, Segoe UI, sans-serif" });
  function copy(id, btn) {
    navigator.clipboard.writeText(document.getElementById(id).innerText).then(() => {
      const t = btn.textContent; btn.textContent = "¡Copiado!"; setTimeout(() => (btn.textContent = t), 1500);
    });
  }
</script>
</body></html>`;

fs.writeFileSync(path.join(dir, name + ".html"), html);
console.log("docs/informe/" + name + ".html");
