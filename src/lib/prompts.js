/**
 * Generador de prompts estructurados para el flujo completo de 11 estaciones en Dev.Idea.
 */
export function buildStepPrompt(stepId, blueprint = {}) {
  const {
    idea = "",
    context = "startup",
    selectedName = "",
    selectedStack = null,
  } = blueprint;

  const stackTitle = selectedStack?.title || "Stack Estándar Moderno";

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
  // ESTACIÓN 2: STACK TECNOLÓGICO DINÁMICO (CON NIVELES DE DIFICULTAD)
  // ========================================================
  if (stepId === 2 || stepId === "stack") {
    return `
Eres el arquitecto senior de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}" | NOMBRE: "${selectedName || "App"}".

Genera entre 4 y 5 opciones de STACK tecnológico diversas, clasificadas por nivel de curva y complejidad técnica mediante el campo "level" ("simple", "medium", "advanced"):

- simple (Azul / Ágil): Mínimo setup y despliegue instantáneo (ej. Next.js Jamstack, Laravel/Django clásico, o herramientas Local-First/Client-side si la idea no requiere backend relacional complejo).
- medium (Amarillo / Pragmático): Balance para proyectos en crecimiento (ej. React + Node/FastAPI/Go, bases de datos relacionales estándar Postgres/MySQL).
- advanced (Rojo / Enterprise o Alto Rendimiento): Ecosistemas con tipado robusto y tipados estrictos (ej. C# / .NET con ASP.NET Core Web API o Blazor, Java/Spring Boot, Rust).

Devuelve ÚNICAMENTE un JSON con:
{
  "dialogue": "Consejo técnico de Strobi sobre no complicar las dependencias más de lo necesario.",
  "mood": "curious",
  "stacks": [
    {
      "id": "stack-1",
      "level": "simple",
      "badge": "ÁGIL / VELOZ",
      "title": "The Rapid Jamstack",
      "tags": ["Next.js", "Tailwind CSS", "Supabase", "PostgreSQL"],
      "defaultLanguage": "TypeScript",
      "availableLanguages": ["TypeScript", "JavaScript"],
      "pro": "Despliegue ultra rápido con autenticación y APIs listas sin gestionar infraestructura.",
      "con": "Mayor acoplamiento al ecosistema gestionado."
    },
    {
      "id": "stack-2",
      "level": "advanced",
      "badge": "ENTERPRISE ROBUSTO",
      "title": "ASP.NET Core Web Platform",
      "tags": ["ASP.NET Core", "C#", "SQL Server / Postgres", "React"],
      "defaultLanguage": "C#",
      "availableLanguages": ["C#", "F#"],
      "pro": "Rendimiento extremo de cómputo en backend, contratos tipados y soporte enterprise maduro.",
      "con": "Requiere mayor configuración de contenedores Docker y curva de despliegue."
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 3: ARQUITECTURA TÉCNICA (EXACTAMENTE 6 OPCIONES: 2 SIMPLE, 2 MEDIUM, 2 ADVANCED)
  // ========================================================
  if (stepId === 3 || stepId === "architecture") {
    return `
Eres el arquitecto de sistemas de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}" | STACK: "${stackTitle}".

Genera EXACTAMENTE 6 opciones de patrones arquitectónicos técnicos divididas estrictamente en 3 niveles de complejidad (2 simples, 2 intermedias y 2 avanzadas) con su campo "level":

1. NIVEL SIMPLE (level: "simple", tag: "Rápido / Directo"):
   - Es OBLIGATORIO incluir patrones consagrados, directos y sin sobreingeniería:
     * MVC Tradicional (Model-View-Controller clásico con vistas servidas por backend o componentes directos).
     * Arquitectura en 3 Capas Directa (Presentación -> Lógica de Negocio -> Repositorio CRUD/DB) o API Minimalista.

2. NIVEL INTERMEDIO (level: "medium", tag: "Pragmático / Modular"):
   - Patrones para proyectos que necesitan modularidad sin llegar al extremo:
     * Monolito Modular delimitado por dominios de negocio.
     * Clean API Desacoplada (Backend REST/RPC aislado consumido por frontend independiente).

3. NIVEL AVANZADO (level: "advanced", tag: "Escalable / Robusto"):
   - Patrones de alta ingeniería para proyectos de grado corporativo o alta concurrencia:
     * Arquitectura Hexagonal (Puertos y Adaptadores / Onion Architecture).
     * Event-Driven / CQRS ligero con sincronización de estado.

Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "thinking",
  "companionComment": "Comentario técnico de Strobi sobre el peligro de la sobreingeniería y cómo elegir el nivel adecuado.",
  "options": [
    {
      "id": "arch-mvc",
      "level": "simple",
      "title": "MVC Tradicional (Model-View-Controller)",
      "tag": "Rápido / Directo",
      "summary": "Controladores gestionando flujos, modelos mapeando datos y vistas renderizadas con enlace directo.",
      "pros": "Cero fricción de red interna, estándar universitario indiscutible y desarrollo a máxima velocidad.",
      "cons": "Menor desacoplamiento si en el futuro se quiere servir a múltiples clientes cliente/móvil.",
      "techs": ["Controllers", "Model Bindings", "Views/Templates", "DbContext/ORM"]
    },
    {
      "id": "arch-layers",
      "level": "simple",
      "title": "Arquitectura en 3 Capas Clásica",
      "tag": "Estructurado Simple",
      "summary": "Capa de Presentación que delega en Servicios de Negocio y estos en Repositorios de datos.",
      "pros": "Estructura mental clara y directa; ideal para CRUDs sin complejidades innecesarias.",
      "cons": "Fácil tentación de filtrar lógica de negocio directamente en los controladores.",
      "techs": ["Presentation API", "Service Layer", "Data Access", "SQL Engine"]
    },
    {
      "id": "arch-modular",
      "level": "medium",
      "title": "Monolito Modular por Dominios",
      "tag": "Pragmático / Modular",
      "summary": "Módulos de negocio delimitados con fronteras de paquetes dentro de una sola unidad de despliegue.",
      "pros": "Despliegue atómico en 1 servidor pero con código ordenado que evita el código espagueti.",
      "cons": "Exige disciplina del equipo para no importar módulos prohibidos entre sí.",
      "techs": ["Domain Modules", "Single DB Schema", "In-Process Communication"]
    },
    {
      "id": "arch-clean-api",
      "level": "medium",
      "title": "Clean API Desacoplada",
      "tag": "Independiente",
      "summary": "Backend REST/RPC consumido por frontend independiente con contratos DTO estrictos.",
      "pros": "Independencia total del frontend; permite sumar clientes móviles o bots fácilmente.",
      "cons": "Manejo de CORS, serialización JSON y gestión de dos ciclos de despliegue.",
      "techs": ["REST Contracts", "DTOs", "Auth Middleware", "CORS Isolation"]
    },
    {
      "id": "arch-hexagonal",
      "level": "advanced",
      "title": "Arquitectura Hexagonal (Puertos & Adaptadores)",
      "tag": "Aislamiento Total",
      "summary": "El núcleo del negocio no conoce bases de datos ni frameworks; todo entra y sale por puertos.",
      "pros": "Testabilidad del 100% de la lógica sin tocar bases de datos; desacoplamiento de librerías.",
      "cons": "Sobrecarga notable de código boilerplate, interfaces, adaptadores y mappers.",
      "techs": ["Domain Core", "Inbound Ports", "Outbound Adapters", "Dependency Inversion"]
    },
    {
      "id": "arch-cqrs",
      "level": "advanced",
      "title": "CQRS Ligero con Eventos",
      "tag": "Alto Desempeño",
      "summary": "Separación formal entre comandos que mutan datos y queries de consulta de alto rendimiento.",
      "pros": "Optimización extrema de lecturas pesadas y trazabilidad de cambios por eventos.",
      "cons": "Complejidad conceptual elevada para reglas simples de negocio.",
      "techs": ["Command Handlers", "Query Handlers", "Domain Events", "Read/Write Separation"]
    }
  ]
}
`;
  }

  // ========================================================
  // ESTACIÓN 4: METODOLOGÍA DE TRABAJO
  // ========================================================
  if (stepId === 4 || stepId === "methodology") {
    return `
Eres el gestor de ingeniería de Dev.Idea.
IDEA: "${idea}" | CONTEXTO: "${context}".
Propón 3 flujos de gestión de trabajo (ej. Kanban Continuo, Scrum en Sprints de 1 semana, o Modo Sniper / Shape Up).
Devuelve ÚNICAMENTE un JSON con:
{
  "companionMood": "working",
  "companionComment": "Si trabajas en solitario, el exceso de burocracia te mata el foco.",
  "options": [
    {
      "id": "meth-1",
      "title": "Kanban Continuo (WIP Estricto)",
      "tag": "Ideal Solo Dev",
      "summary": "Flujo de tareas sin fechas artificiales, limitando a 2 tareas en progreso.",
      "pros": "Cero fricción de ceremonias, foco total en terminar antes de empezar otra.",
      "cons": "Requiere mucha disciplina para no dejar acumular tareas en el backlog.",
      "techs": ["Límites WIP", "Cycle Time", "Tablero Visual"]
    },
    {
      "id": "meth-2",
      "title": "Micro-Sprints de 1 Semana",
      "tag": "Para Equipos / Entregas",
      "summary": "Metas cerradas cada 7 días con un entregable visible y testeable.",
      "pros": "Obliga a recortar alcance semanalmente para nunca quedarse a medias.",
      "cons": "La estimación errada al inicio de semana genera frustración.",
      "techs": ["Sprint Review", "Demo Semanal", "Scope Boxing"]
    },
    {
      "id": "meth-3",
      "title": "Modo Sniper (Ciclos de 2 Semanas)",
      "tag": "Enfoque Feature-Driven",
      "summary": "Un solo objetivo grande atacado hasta completarse al 100%.",
      "pros": "Profundidad técnica sin interrupciones ni cambios de contexto.",
      "cons": "Poco margen de cambio de rumbo si la feature era inviable.",
      "techs": ["Deep Work", "Milestone Based", "Bug Quota"]
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
IDEA: "${idea}" | STACK: "${stackTitle}".
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
      "summary": "Inferencia con Gemini 3.8 Flash para la app + Cursor Composer con Claude Sonnet en el editor.",
      "pros": "Costo de tokens prácticamente $0 en producción y generación de código veloz en tu IDE.",
      "cons": "Requiere cuenta activa de Cursor y gestionar API keys separadas.",
      "techs": ["Gemini 3.8 Flash API", "Cursor Composer", "Rules for AI"]
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
  // ESTACIÓN 10 (⭐): ¡A TRABAJAR!
  // ========================================================
  return `
Eres el Lead Architect de Dev.Idea.
El usuario ha completado todas las estaciones para: "${idea}".
Genera el blueprint de cierre con el árbol de directorios y el archivo AGENTS.md.
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
