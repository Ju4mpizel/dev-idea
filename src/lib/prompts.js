/**
 * Generador de prompts estructurados para el flujo completo de estaciones en Dev.Idea.
 */
export function buildStepPrompt(stepId, blueprint = {}) {
  const {
    idea = "",
    context = "startup",
    selectedName = "",
    selectedStack = null,
    selectedArchitecture = null,
  } = blueprint;

  const stackTitle = selectedStack?.title || "Stack Estándar Moderno";
  const archTitle = selectedArchitecture?.title || "Arquitectura Estándar";

  // ========================================================
  // ESTACIÓN 1: NAMING & CONCEPTO
  // ========================================================
  if (stepId === 1 || stepId === "naming") {
    return `
Eres el estratega técnico de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}".
Propón 4 opciones de NOMBRE con estilos: Modern SaaS, Técnico/Pragmático, Disruptivo y Minimalista.
Devuelve ÚNICAMENTE un JSON con:
{
  "dialogue": "Comentario astuto de Strobi sobre el bautizo del software.",
  "mood": "thinking",
  "names": [
    {
      "id": "name-1",
      "name": "NombrePropuesto",
      "style": "Modern SaaS",
      "tagline": "Una línea concisa de propuesta de valor.",
      "rationale": "Por qué este nombre resuena técnicamente."
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 2: STACK TECNOLÓGICO DINÁMICO
  // ========================================================
  if (stepId === 2 || stepId === "stack") {
    return `
Eres el arquitecto senior de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}" | NOMBRE: "${selectedName || "App"}".

Genera entre 4 y 5 opciones de STACK tecnológico diversas, clasificadas por nivel de curva y complejidad técnica mediante el campo "level" ("simple", "medium", "advanced"):

- simple (Azul / Ágil): Mínimo setup y despliegue instantáneo (ej. Next.js Jamstack, Laravel/Django clásico, o herramientas Local-First/Client-side).
- medium (Amarillo / Pragmático): Balance para proyectos en crecimiento (ej. React + Node/FastAPI/Go, bases de datos relacionales estándar Postgres/MySQL).
- advanced (Rojo / Enterprise o Alto Rendimiento): Ecosistemas con tipado robusto y tipados estrictos (ej. C# / .NET con ASP.NET Core, Java/Spring Boot, Rust).

Devuelve ÚNICAMENTE un JSON con:
{
  "dialogue": "Consejo técnico de Strobi sobre no complicar las dependencias más de lo necesario.",
  "mood": "curious",
  "stacks": [
    {
      "id": "stack-1",
      "level": "simple",
      "badge": "ÁGIL / VELOZ",
      "title": "Nombre del Stack",
      "tags": ["Framework", "Backend", "DB", "CSS"],
      "defaultLanguage": "TypeScript",
      "availableLanguages": ["TypeScript", "JavaScript"],
      "pro": "Ventaja técnica principal.",
      "con": "Desventaja o trade-off a considerar."
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 3: ARQUITECTURA TÉCNICA (DINÁMICA Y PERSONALIZADA AL STACK)
  // ========================================================
  // ========================================================
  // ESTACIÓN 3: ARQUITECTURA TÉCNICA (6 OPCIONES BALANCEADAS AL STACK)
  // ========================================================
  if (stepId === 3 || stepId === "architecture") {
    return `
Eres el arquitecto de sistemas de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}" | STACK SELECCIONADO: "${stackTitle}".

Genera EXACTAMENTE 6 opciones de patrones arquitectónicos técnicos adaptados y aterrizados ESPECÍFICAMENTE al stack tecnológico elegido ("${stackTitle}"), distribuidos estrictamente en 3 niveles de complejidad (2 simples, 2 intermedias, 2 avanzadas) mediante el campo "level" ("simple", "medium", "advanced"):

1. 2 OPCIONES "simple" (Rápido / Directo / Sin Sobreingeniería):
   - Adapta patrones directos consagrados a las convenciones de este stack (ej. MVC/MVT Tradicional con vistas y controladores directos, Arquitectura en 3 Capas Clásica Presentación-Servicio-Datos, o API CRUD Monolítica directa).
   - "level": "simple", "tag": "Rápido / Directo" o "Estructurado Simple".

2. 2 OPCIONES "medium" (Pragmático / Modular):
   - Adapta patrones desacoplados y limpios (ej. Monolito Modular delimitado por dominios, Clean API Desacoplada Backend/Frontend con contratos DTO, o Vertical Slice Architecture orientada a características).
   - "level": "medium", "tag": "Pragmático / Modular" o "Independiente".

3. 2 OPCIONES "advanced" (Escalable / Robusto):
   - Adapta patrones de alta ingeniería para proyectos de alta concurrencia o aislamiento extremo (ej. Arquitectura Hexagonal con Puertos y Adaptadores adaptada a las librerías del stack, CQRS Ligero con Eventos de dominio, o Arquitectura Orientada a Eventos / Colas).
   - "level": "advanced", "tag": "Aislamiento Total" o "Alto Desempeño".

IMPORTANTE: Los nombres, "techs", "pros" y "cons" deben mencionar explícitamente herramientas, componentes o conceptos que tengan sentido con "${stackTitle}" y la idea "${idea}".

Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "thinking",
  "companionComment": "Comentario técnico de Strobi sobre el balance arquitectónico adecuado para este stack sin caer en sobreingeniería.",
  "options": [
    {
      "id": "arch-1",
      "level": "simple",
      "title": "Nombre del Patrón Aterrizado",
      "tag": "Rápido / Directo",
      "summary": "Resumen conciso de cómo fluyen los datos y peticiones usando las piezas del stack.",
      "pros": "Ventaja clara de desarrollo o mantenimiento.",
      "cons": "Límite o trade-off a considerar.",
      "techs": ["Componente/Capa 1", "Componente/Capa 2", "Componente/Capa 3", "Componente/Capa 4"]
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 4: METODOLOGÍA DE TRABAJO (CADENCIA & FLUJO ÁGIL)
  // ========================================================
  if (stepId === 4 || stepId === "methodology") {
    return `
Eres el Lead Agile Coach y Gestor de Ingeniería de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}" | STACK: "${stackTitle}" | ARQUITECTURA: "${archTitle}".

Genera 4 opciones de metodología y gestión de desarrollo ágil adaptadas a la envergadura del proyecto y al equipo esperado, clasificadas por complejidad ("level": "simple", "medium", "advanced"):

- 1 opción "simple": Flujos de fricción cero ideales para desarrolladores solos o MVPs ultrarrápidos (ej. Kanban Continuo con límite WIP estricto, Personal Kanban).
- 2 opciones "medium": Enfoques iterativos para equipos pequeños o desarrollo por objetivos (ej. Micro-Sprints de 1 semana con entregables testeables, o Shape Up / Ciclos de Enfoque con apetito fijo).
- 1 opción "advanced": Enfoques estructurados para defensa académica o trabajo riguroso en equipo (ej. Scrum Formal con ceremonias completas y métricas, o XP / Extreme Programming con TDD continuo).

Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "working",
  "companionComment": "Comentario astuto de Strobi sobre no ahogarse en reuniones y elegir un ritmo que se pueda sostener.",
  "options": [
    {
      "id": "meth-1",
      "level": "simple",
      "title": "Nombre de la Metodología",
      "tag": "Etiqueta Corta",
      "summary": "Descripción de la cadencia de trabajo y cómo se gestionan los requerimientos.",
      "pros": "Mayor beneficio para la velocidad o claridad del equipo.",
      "cons": "Riesgo o compromiso que exige esta metodología.",
      "techs": ["Práctica o Herramienta 1", "Práctica 2", "Práctica 3"]
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 5: DIAGRAMAS DINÁMICOS IA
  // ========================================================
  if (stepId === 5 || stepId === "diagrams") {
    return `
Eres el arquitecto visual de Dev.Idea.
IDEA: "${idea}" | STACK: "${stackTitle}" | ARQUITECTURA: "${archTitle}".
Genera 3 paquetes de diagramación según la profundidad que el usuario necesita defender o entender.
Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "curious",
  "companionComment": "Los diagramas justos para no perder medio día dibujando cajas.",
  "options": [
    {
      "id": "diag-1",
      "title": "Paquete Esencial",
      "tag": "Recomendado",
      "summary": "Arquitectura de componentes y flujo de usuario principal en Mermaid.",
      "pros": "Suficiente para entender la interacción básica entre cliente y servidor.",
      "cons": "No detalla el modelo de tablas ni el flujo de excepciones.",
      "techs": ["Diagrama Arquitectura", "User Flow Básico"]
    },
    {
      "id": "diag-2",
      "title": "Paquete Técnico Completo",
      "tag": "Para Defender Proyecto",
      "summary": "Arquitectura + Modelo Entidad-Relación (ERD) detallado con llaves foráneas.",
      "pros": "Deja la base de datos lista para tirar el schema de Prisma o SQL.",
      "cons": "Requiere validar bien los tipos de datos de entrada.",
      "techs": ["Arquitectura C4 Nivel 2", "Diagrama ERD BD", "Secuencia Auth"]
    },
    {
      "id": "diag-3",
      "title": "Paquete de Infraestructura & Cloud",
      "tag": "Enfoque DevOps",
      "summary": "Mapeo de servicios cloud, buckets, CDNs y pipeline CI/CD.",
      "pros": "Muestra con claridad la ruta de despliegue a producción y los límites de costos.",
      "cons": "Puede ser excesivo si solo quieres un MVP local.",
      "techs": ["Cloud Map", "Pipeline GitHub Actions", "Edge Network"]
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 6: LENGUAJE VISUAL / MORPHISM
  // ========================================================
  if (stepId === 6 || stepId === "morphism") {
    return `
Eres el Lead Designer de Dev.Idea.
IDEA: "${idea}".
Genera 3 o 4 estilos cosméticos y de interfaz adaptados al tono del proyecto.
Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "playful",
  "companionComment": "Elegir el estilo desde el principio evita rehacer estilos tres veces.",
  "options": [
    {
      "id": "morph-1",
      "title": "Minimalismo Plano / Modern SaaS",
      "tag": "Estándar Limpio",
      "summary": "Bordes de 1px, grises de alto contraste, acentos monocromáticos y tipografía suiza.",
      "pros": "Accesibilidad garantizada, peso CSS mínimo y muy fácil de mantener.",
      "cons": "Menos diferenciador si buscas una experiencia visual juguetona.",
      "techs": ["Radix Colors", "Zinc Palette", "Geist Sans", "Border Subtlety"]
    },
    {
      "id": "morph-2",
      "title": "Dark Glassmorphism Sutil",
      "tag": "Elegante & Técnico",
      "summary": "Capas translúcidas con backdrop-blur, reflejos tenues de luz y gradientes oscuros.",
      "pros": "Sensación premium inmediata que destaca en presentaciones y landing pages.",
      "cons": "El desenfoque backdrop puede penalizar frames en móviles de gama baja.",
      "techs": ["Backdrop Blur", "Glass Borders", "Radial Glows", "Dark Obsidian"]
    },
    {
      "id": "morph-3",
      "title": "Claymorphism 3D Suave",
      "tag": "Lúdico & Amigable",
      "summary": "Sombras internas dobles que dan volumen de arcilla inflada a botones y tarjetas.",
      "pros": "Altamente carismático, ideal para apps que buscan cercanía o productos educativos.",
      "cons": "Requiere calibrar sombras personalizadas complejas en Tailwind.",
      "techs": ["Inner Shadows", "Soft Rounded 3XL", "Pastel Accents", "Chubby UI"]
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 7: LAYOUT PATTERN
  // ========================================================
  if (stepId === 7 || stepId === "layout") {
    return `
Eres el diseñador de UX de Dev.Idea.
IDEA: "${idea}".
Propón 3 estructuras espaciales de pantalla para resolver la experiencia de usuario.
Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "thinking",
  "companionComment": "Un buen layout resuelve el 80% de la experiencia de usuario.",
  "options": [
    {
      "id": "lay-1",
      "title": "Bento Grid Dinámico",
      "tag": "Visual & Modular",
      "summary": "Módulos rectangulares asimétricos con jerarquía según la prioridad de los datos.",
      "pros": "Escanea mucha información en una sola pantalla sin sentirse abrumador.",
      "cons": "Requiere una adaptación responsiva cuidada para móviles.",
      "techs": ["CSS Grid 12 cols", "Span Adaptive", "Aspect Ratio Cards"]
    },
    {
      "id": "lay-2",
      "title": "App Shell con Sidebar Fija",
      "tag": "Estándar Dashboard",
      "summary": "Barra lateral replegable para navegación y canvas central de trabajo.",
      "pros": "Navegación familiar para cualquier usuario de software profesional.",
      "cons": "Resta ancho útil si la app requiere foco de lectura inmersiva.",
      "techs": ["Collapsible Nav", "Main Container", "Sticky Header"]
    },
    {
      "id": "lay-3",
      "title": "Canvas Inmersivo / Focus View",
      "tag": "Centrado en el Contenido",
      "summary": "Área de trabajo maximizada con herramientas flotantes y cero distracciones.",
      "pros": "Máxima concentración en la tarea principal del software.",
      "cons": "Dificulta descubrir acciones secundarias o de configuración.",
      "techs": ["Floating Island Controls", "Full Bleed Canvas", "Overlay Drawers"]
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 8: INFRAESTRUCTURA & DEPLOY
  // ========================================================
  if (stepId === 8 || stepId === "deploy") {
    return `
Eres el DevOps Lead de Dev.Idea.
IDEA: "${idea}" | STACK: "${stackTitle}".
Genera 3 planes de despliegue y hosting costo $0 con respaldo de repositorio.
Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "proud",
  "companionComment": "Hosting listo. Y recuerda: código que no está en GitHub, no existe.",
  "options": [
    {
      "id": "dep-1",
      "title": "Vercel / Cloudflare Pages + GitHub",
      "tag": "Zero Config",
      "summary": "Despliegue automático con cada git push a main mediante webhooks.",
      "pros": "CI/CD integrado, HTTPS automático, CDN global en el edge sin tocar servidores.",
      "cons": "Límites en funciones serverless prolongadas en el tier gratuito.",
      "techs": ["GitHub CI/CD", "Edge CDN", "Preview Deployments"]
    },
    {
      "id": "dep-2",
      "title": "Render / Railway + PostgreSQL",
      "tag": "Para Backends Persistentes",
      "summary": "Contenedores Docker automáticos para APIs en Python, Node o Go con BD gestionada.",
      "pros": "Soporta procesos en segundo plano y websockets sin caídas de conexión.",
      "cons": "El plan gratuito de bases de datos suele tener tiempo de expiración o límites de RAM.",
      "techs": ["Docker Containers", "Managed DB", "Environment Secrets"]
    },
    {
      "id": "dep-3",
      "title": "VPS Autónomo (Hetzner / Oracle Cloud Free)",
      "tag": "Control Total",
      "summary": "Máquina virtual Linux configurada con Coolify o Docker Compose.",
      "pros": "Costo fijo predecible y libertad absoluta de microservicios sin bloqueos.",
      "cons": "Debes encargarte manualmente de la seguridad, backups y parches de Linux.",
      "techs": ["Coolify PaaS", "Docker Compose", "Caddy Reverse Proxy"]
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 9: ECOSISTEMA DE IA & HERRAMIENTAS
  // ========================================================
  if (stepId === 9 || stepId === "ai-ecosystem") {
    return `
Eres el AI Strategist de Dev.Idea.
IDEA: "${idea}" | STACK: "${stackTitle}".
Propón 3 combinaciones de modelos de IA para el producto + copilots para acelerar el desarrollo del programador.
Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "celebrate",
  "companionComment": "El kit de aceleración listo para construir sin fricción cognitiva.",
  "options": [
    {
      "id": "ai-1",
      "title": "Kit Flash + Cursor IDE",
      "tag": "Velocidad & Precisión",
      "summary": "Inferencia con Gemini Flash para la app + Cursor Composer en el editor.",
      "pros": "Costo de tokens ultra bajo en producción y generación de código veloz en tu IDE.",
      "cons": "Requiere cuenta activa de Cursor y gestionar API keys separadas.",
      "techs": ["Gemini Flash API", "Cursor Composer", "Rules for AI"]
    },
    {
      "id": "ai-2",
      "title": "Kit Local / Open Source",
      "tag": "Privacidad 100%",
      "summary": "Modelos DeepSeek-R1 / Qwen2.5 vía Ollama para desarrollo sin salir de tu máquina.",
      "pros": "Cero costos recurrentes, privacidad total de datos y disponibilidad offline.",
      "cons": "Demanda buena GPU y memoria RAM en tu equipo de desarrollo.",
      "techs": ["Ollama Local", "DeepSeek Coder", "Continue.dev Extension"]
    },
    {
      "id": "ai-3",
      "title": "Kit Prototipado Híbrido",
      "tag": "Generación Acelerada",
      "summary": "v0 de Vercel para scaffold de componentes UI + Claude Code para refactorizaciones complejas.",
      "pros": "Pasa de cero a interfaz funcional con animaciones en cuestión de minutos.",
      "cons": "El código generado por v0 necesita revisión manual de tipados y arquitectura.",
      "techs": ["v0 Component Gen", "Claude Code CLI", "Tailwind UI Blocks"]
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 10 (⭐): BLUEPRINT FINAL
  // ========================================================
  return `
Eres el Lead Architect de Dev.Idea.
El usuario ha completado todas las decisiones para: "${idea}".
Genera el blueprint de cierre con el resumen técnico y los primeros comandos para inicializar el proyecto.
Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "celebrate",
  "companionComment": "¡Plano terminado! Copia tu contexto y ponte a construir.",
  "scaffold": {
    "projectName": "${selectedName || "mi-proyecto"}",
    "techSummary": "${stackTitle}",
    "commands": ["pnpm install", "pnpm dev"]
  }
}
`;
}
