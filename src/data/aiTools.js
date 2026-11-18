/**
 * Catálogo de herramientas de IA para PROGRAMAR (estación "Ecosistema de IA").
 *
 * No lo genera Gemini: es una galería fija con las herramientas más usadas.
 * `featured` marca las destacadas. `icon` es el nombre que busca
 * src/lib/techIcons.js; si la marca no tiene logo en simple-icons se usa
 * `fallbackIcon` (un ícono genérico de lucide, nunca una imitación del logo).
 *
 * Los precios cambian seguido: se muestran como orientativos.
 */

export const AI_TOOL_KINDS = {
  agent: { label: "Agente", hint: "Trabaja solo sobre tu repositorio" },
  ide: { label: "Editor con IA", hint: "Tu editor de código con IA integrada" },
  chat: { label: "Chat", hint: "Le preguntas y copias el código a mano" },
  local: { label: "Modelo local", hint: "La IA corre en tu propia PC" },
};

export const AI_TOOLS = [
  // ---------- Destacados ----------
  {
    id: "claude-code",
    name: "Claude Code",
    vendor: "Anthropic",
    kind: "agent",
    featured: true,
    icon: "Claude Code",
    tagline:
      "Agente que entiende todo tu proyecto y hace cambios en varios archivos.",
    helpsWith: [
      "Implementar funcionalidades completas a partir de una descripción",
      "Ejecutar comandos y tests, y corregir los errores que aparezcan",
      "Planificar tareas grandes antes de tocar el código",
    ],
    bestFor:
      "Proyectos medianos o grandes donde quieres delegar tareas enteras.",
    pricing: "Incluido en Claude Pro y Max, o pago por uso con API.",
    start: "Instálalo, abre la terminal en tu proyecto y escribe claude.",
    url: "https://claude.com/product/claude-code",
  },
  {
    id: "codex",
    name: "Codex",
    vendor: "OpenAI",
    kind: "agent",
    featured: true,
    icon: null,
    fallbackIcon: "terminal",
    tagline:
      "Agente de OpenAI para la terminal, el editor y tareas en la nube.",
    helpsWith: [
      "Lanzar varias tareas en paralelo en la nube",
      "Revisar pull requests y proponer correcciones",
      "Trabajar desde la terminal con su CLI open source",
    ],
    bestFor: "Quien ya paga ChatGPT y quiere un agente sin otra suscripción.",
    pricing: "Incluido en los planes de pago de ChatGPT.",
    start: "Instala la CLI de Codex e inicia sesión con tu cuenta de ChatGPT.",
    url: "https://openai.com/codex",
  },
  {
    id: "opencode",
    name: "OpenCode",
    vendor: "Open source",
    kind: "agent",
    featured: true,
    icon: "OpenCode",
    tagline:
      "Agente open source para la terminal que funciona con casi cualquier modelo.",
    helpsWith: [
      "Usar Claude, GPT, Gemini o modelos gratuitos desde un mismo agente",
      "Cambiar de modelo sin cambiar de herramienta",
      "Conectarlo a modelos locales con Ollama",
    ],
    bestFor: "Quien quiere libertad de modelo o empezar sin pagar suscripción.",
    pricing: "Gratis y open source; pagas el modelo que conectes.",
    start: "Instálalo, conecta un proveedor de modelos y ejecuta opencode.",
    url: "https://opencode.ai",
  },
  {
    id: "antigravity",
    name: "Antigravity",
    vendor: "Google",
    kind: "ide",
    featured: true,
    icon: null,
    fallbackIcon: "orbit",
    tagline:
      "Editor de Google donde varios agentes programan, prueban y te muestran avances.",
    helpsWith: [
      "Delegar tareas a agentes que usan el editor, la terminal y el navegador",
      "Revisar planes y capturas antes de aceptar cambios",
      "Trabajar con Gemini y otros modelos en un mismo lugar",
    ],
    bestFor: "Quien quiere un editor completo pensado desde cero para agentes.",
    pricing: "Plan gratuito para uso individual, con límites de uso.",
    start:
      "Descárgalo, inicia sesión con Google y abre tu carpeta del proyecto.",
    url: "https://antigravity.google",
  },

  // ---------- Editores y asistentes ----------
  {
    id: "cursor",
    name: "Cursor",
    vendor: "Anysphere",
    kind: "ide",
    icon: "Cursor",
    tagline: "Editor basado en VS Code con autocompletado y agente integrados.",
    helpsWith: [
      "Autocompletar varias líneas mientras escribes",
      "Pedir cambios en lenguaje natural sobre tus archivos",
      "Chatear con el contexto de todo el proyecto",
    ],
    bestFor: "Quien viene de VS Code y quiere IA sin cambiar de costumbres.",
    pricing: "Plan Hobby gratis; Pro de pago mensual.",
    start: "Descárgalo e importa tus extensiones de VS Code.",
    url: "https://cursor.com",
  },
  {
    id: "github-copilot",
    name: "GitHub Copilot",
    vendor: "GitHub",
    kind: "ide",
    icon: "GitHub Copilot",
    tagline:
      "Asistente dentro de VS Code, JetBrains y GitHub, con modo agente.",
    helpsWith: [
      "Sugerencias de código mientras escribes",
      "Modo agente para tareas de varios archivos",
      "Asignarle issues de GitHub para que abra un pull request",
    ],
    bestFor: "Estudiantes y equipos que ya trabajan en GitHub.",
    pricing: "Plan Free con límites; gratis para estudiantes verificados.",
    start: "Activa Copilot en tu cuenta de GitHub e instala la extensión.",
    url: "https://github.com/features/copilot",
  },
  {
    id: "gemini-cli",
    name: "Gemini CLI",
    vendor: "Google",
    kind: "agent",
    icon: "Gemini",
    tagline: "Agente open source de Google para la terminal.",
    helpsWith: [
      "Leer y modificar el proyecto desde la terminal",
      "Trabajar con proyectos grandes gracias a su contexto amplio",
      "Automatizar tareas con scripts",
    ],
    bestFor: "Empezar con un agente sin pagar, solo con tu cuenta de Google.",
    pricing: "Gratis con cuenta de Google, con cuota diaria.",
    start: "Instálalo con npm y ejecuta gemini en tu proyecto.",
    url: "https://github.com/google-gemini/gemini-cli",
  },

  // ---------- Chats ----------
  {
    id: "chatgpt",
    name: "ChatGPT",
    vendor: "OpenAI",
    kind: "chat",
    icon: null,
    fallbackIcon: "chat",
    tagline:
      "El chat más popular: explica, genera y corrige código conversando.",
    helpsWith: [
      "Entender un error pegando el mensaje",
      "Aprender un concepto con ejemplos paso a paso",
      "Editar código junto a la IA con Canvas",
    ],
    bestFor: "Aprender y resolver dudas puntuales.",
    pricing: "Gratis con límites; planes de pago para más uso.",
    start: "Entra a chatgpt.com y describe lo que necesitas.",
    url: "https://chatgpt.com",
  },
  {
    id: "claude-chat",
    name: "Claude",
    vendor: "Anthropic",
    kind: "chat",
    icon: "Claude",
    tagline: "Chat muy bueno con código, que muestra componentes en vivo.",
    helpsWith: [
      "Ver un componente funcionando en Artifacts antes de copiarlo",
      "Subir archivos de tu proyecto a un Proyecto con contexto",
      "Revisar y explicar código largo",
    ],
    bestFor: "Diseñar componentes y revisar código con explicaciones claras.",
    pricing: "Gratis con límites; Pro de pago mensual.",
    start: "Entra a claude.ai y crea un Proyecto con tus archivos.",
    url: "https://claude.ai",
  },
  {
    id: "gemini-chat",
    name: "Gemini",
    vendor: "Google",
    kind: "chat",
    icon: "Gemini",
    tagline: "Chat de Google con contexto muy largo e integración con Drive.",
    helpsWith: [
      "Analizar documentos y repositorios grandes de una vez",
      "Prototipar páginas con Canvas",
      "Usar tus archivos de Google Drive como contexto",
    ],
    bestFor: "Leer mucho material a la vez sin pagar.",
    pricing: "Gratis; Google AI Pro para más uso.",
    start: "Entra a gemini.google.com con tu cuenta de Google.",
    url: "https://gemini.google.com",
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    vendor: "DeepSeek",
    kind: "chat",
    icon: "DeepSeek",
    tagline: "Chat gratuito y API muy barata, con modelos abiertos.",
    helpsWith: [
      "Resolver problemas de lógica con su modo de razonamiento",
      "Conectar su API barata a OpenCode u otros agentes",
      "Descargar sus modelos abiertos para usarlos en local",
    ],
    bestFor: "Presupuesto mínimo o pruebas con muchas llamadas a la API.",
    pricing: "Chat gratis; API de bajo costo.",
    start: "Entra a chat.deepseek.com o crea una API key.",
    url: "https://chat.deepseek.com",
  },

  // ---------- Local ----------
  {
    id: "ollama",
    name: "Ollama",
    vendor: "Open source",
    kind: "local",
    icon: "Ollama",
    tagline:
      "Corre modelos abiertos (Qwen, Llama, DeepSeek...) en tu propia PC.",
    helpsWith: [
      "Programar sin internet y sin enviar tu código a terceros",
      "Usar la IA sin costo por mensaje",
      "Darle un modelo local a OpenCode u otros agentes",
    ],
    bestFor: "Privacidad total o trabajar sin conexión.",
    pricing: "Gratis; necesitas una PC con buena RAM o GPU.",
    start: "Instálalo y ejecuta ollama run seguido del modelo.",
    url: "https://ollama.com",
  },
];

export const getAiTool = (id) => AI_TOOLS.find((t) => t.id === id) || null;

/** Lo que se guarda en el blueprint por cada herramienta elegida. */
export const toAiToolDecision = (tool) => ({
  id: tool.id,
  title: tool.name,
  vendor: tool.vendor,
  kind: tool.kind,
  tag: AI_TOOL_KINDS[tool.kind]?.label,
});
