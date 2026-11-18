/**
 * Guía de categorías de cada estación (panel deslizable de la IZQUIERDA).
 *
 * Strobi (derecha) explica el CONCEPTO de la estación; este panel es la tabla
 * de referencia: qué significa cada nivel de las cartas (`levels`, en el mismo
 * orden simple / medium / advanced que la leyenda de la estación) y, cuando la
 * estación tiene un catálogo cerrado, todas las opciones posibles (`catalog`).
 */
import { SYSTEM_FAMILIES, getTypesOfFamily } from "./systemTypes";
import { getSurfaceLayouts, surfaceLabel } from "./layoutCatalog";
import { LAYOUT_SURFACE_IDS } from "@/lib/stepSchemas";

export const STATION_CATEGORIES = {
  // Catálogo fijo de la estación "Tipo de sistema" (sale de src/data/systemTypes.js)
  "system-type": {
    title: "Catálogo de tipos de sistema",
    catalog: SYSTEM_FAMILIES.map((family) => ({
      group: family.title,
      items: getTypesOfFamily(family.id).map((type) => ({
        name: type.title,
        desc: type.summary,
      })),
    })),
  },

  naming: {
    title: "Estilos de nombre",
    catalog: [
      {
        group: "Estilos",
        items: [
          { name: "Modern SaaS", desc: "Corto, inventado y pegadizo (Vercel, Notion)." },
          { name: "Técnico / Pragmático", desc: "Dice qué hace con lenguaje de desarrollador." },
          { name: "Disruptivo", desc: "Llamativo, rompe con lo esperado." },
          { name: "Minimalista", desc: "Una sola palabra simple y limpia." },
          { name: "Descriptivo", desc: "Explica la función sin rodeos (ReservaFácil)." },
          { name: "Juego de palabras", desc: "Mezcla dos ideas para que se recuerde." },
        ],
      },
    ],
  },

  requirements: {
    title: "Prioridades y tipos de requisito",
    levels: {
      simple: "Imprescindible para el MVP: sin esto la idea no funciona. Equivale a MUST en MoSCoW.",
      medium: "Aporta mucho valor pero puede llegar en la segunda versión. Equivale a SHOULD.",
      advanced: "Deseable a futuro, cuando el núcleo esté probado. Equivale a COULD.",
    },
    catalog: [
      {
        group: "Tipos de requisito",
        items: [
          { name: "RF · Funcional", desc: "Qué hace el sistema: “El sistema debe permitir…”." },
          { name: "RNF · Rendimiento", desc: "Tiempos de respuesta y carga: “< 2 s”." },
          { name: "RNF · Seguridad", desc: "Autenticación, roles, cifrado de datos." },
          { name: "RNF · Usabilidad", desc: "Facilidad de uso, accesibilidad, diseño responsive." },
          { name: "RNF · Disponibilidad", desc: "Tiempo en línea: “99% del mes”." },
          { name: "RNF · Mantenibilidad", desc: "Código ordenado, pruebas, documentación." },
        ],
      },
    ],
  },

  "user-stories": {
    title: "Prioridad y estimación",
    levels: {
      simple: "Prioridad alta: entra en el primer sprint o en el MVP.",
      medium: "Prioridad media: siguiente iteración.",
      advanced: "Prioridad baja: backlog para más adelante.",
    },
    catalog: [
      {
        group: "Puntos de historia (Fibonacci)",
        items: [
          { name: "1 – 2", desc: "Muy pequeña: unas horas." },
          { name: "3", desc: "Pequeña: alrededor de un día." },
          { name: "5", desc: "Mediana: dos o tres días." },
          { name: "8", desc: "Grande: conviene dividirla en historias más chicas." },
        ],
      },
      {
        group: "Criterios INVEST",
        items: [
          { name: "Independiente", desc: "Se puede hacer sin esperar a otra." },
          { name: "Valiosa", desc: "Aporta algo visible al usuario." },
          { name: "Estimable y pequeña", desc: "Se entiende y cabe en un sprint." },
          { name: "Testeable", desc: "Tiene criterios de aceptación claros." },
        ],
      },
    ],
  },

  stack: {
    title: "Niveles de stack",
    levels: {
      simple: "Ágil / Directo: pocas piezas, configuración mínima y despliegue en minutos. Incluye la demo HTML + CSS, Next.js + Supabase, Firebase o el clásico PHP/Django + MySQL. Ideal para un primer proyecto o un MVP.",
      medium: "Pragmático: frontend y backend separados (SPA + API). Más control y orden para proyectos que van a crecer o tienen varios desarrolladores.",
      advanced: "Enterprise: tipado estricto, arquitectura formal y herramientas corporativas (Java/Spring, .NET). Más curva de aprendizaje, muy valorado en empresas y en la universidad.",
    },
    catalog: [
      {
        group: "Piezas de un stack",
        items: [
          { name: "Frontend", desc: "Lo que ve el usuario: HTML/CSS, React, Vue, Angular." },
          { name: "Backend", desc: "Lógica y seguridad en el servidor: Node, Django, Laravel, Spring." },
          { name: "Full-stack", desc: "Un solo framework hace ambos: Next.js, Laravel, Django." },
          { name: "Base de datos", desc: "Dónde viven los datos: MySQL, PostgreSQL, MongoDB." },
          { name: "BaaS", desc: "Backend ya hecho (BD + login + API): Supabase, Firebase." },
          { name: "ORM", desc: "Traduce tablas a objetos: Prisma, Eloquent, Hibernate." },
        ],
      },
      {
        group: "Combinaciones famosas",
        items: [
          { name: "HTML + CSS + JS", desc: "Lo más básico: maquetas y demos estáticas." },
          { name: "LAMP", desc: "Linux, Apache, MySQL, PHP: el clásico de la web." },
          { name: "MERN", desc: "MongoDB, Express, React y Node: todo en JavaScript." },
          { name: "Next.js + Supabase", desc: "Full-stack moderno con base de datos y login listos." },
          { name: "Spring + Angular", desc: "Combinación corporativa típica en Java." },
        ],
      },
      {
        group: "TypeScript vs JavaScript",
        items: [
          { name: "JavaScript", desc: "Más simple para empezar: sin tipos." },
          { name: "TypeScript", desc: "JavaScript con tipos: detecta errores antes de ejecutar." },
        ],
      },
    ],
  },

  database: {
    title: "Tipos de almacenamiento",
    levels: {
      simple: "Sin servidor o cero configuración: archivos, localStorage o una base embebida (SQLite).",
      medium: "Base de datos gestionada estándar (PostgreSQL, MySQL, Supabase, Firebase).",
      advanced: "Requiere más diseño u operación: varias bases, cachés, réplicas o NoSQL a escala.",
    },
    catalog: [
      {
        group: "Tipos",
        items: [
          { name: "Sin base de datos", desc: "Contenido estático, JSON, Markdown o localStorage." },
          { name: "Relacional (SQL)", desc: "Tablas relacionadas: MySQL, PostgreSQL, SQL Server." },
          { name: "Documental (NoSQL)", desc: "Documentos flexibles tipo JSON: MongoDB, Firestore." },
          { name: "Clave-valor", desc: "Lecturas ultra rápidas, caché: Redis." },
          { name: "BaaS", desc: "Base + login + API listos: Supabase, Firebase, Appwrite." },
          { name: "Embebida", desc: "Un archivo dentro de la app: SQLite." },
        ],
      },
      {
        group: "Herramientas",
        items: [
          { name: "MySQL Workbench", desc: "Diseña tablas y relaciones de MySQL de forma visual." },
          { name: "pgAdmin / DBeaver", desc: "Clientes gráficos para PostgreSQL y otras bases." },
          { name: "dbdiagram.io", desc: "Dibuja el modelo entidad-relación escribiendo código." },
        ],
      },
    ],
  },

  architecture: {
    title: "Niveles de arquitectura",
    levels: {
      simple: "El patrón nativo del framework (MVC, MVT, capas). Rápido de entender y suficiente para la mayoría de proyectos.",
      medium: "Código separado por dominios o módulos, con capa de servicios. Ordena proyectos que crecen.",
      advanced: "Aislamiento fuerte del negocio (hexagonal, clean, eventos, microservicios). Solo si la complejidad lo justifica.",
    },
    catalog: [
      {
        group: "Patrones frecuentes",
        items: [
          { name: "MVC", desc: "Modelo (datos), Vista (pantalla), Controlador (lógica de entrada). Laravel, Spring MVC." },
          { name: "MVT", desc: "La variante de Django: Modelo, Vista, Template." },
          { name: "Capas (3 capas)", desc: "Presentación → Lógica → Datos. Clásico de la universidad." },
          { name: "Monolito modular", desc: "Un proyecto dividido por dominios (usuarios, pagos...)." },
          { name: "API + SPA", desc: "Backend REST separado de un frontend React/Vue/Angular." },
          { name: "Hexagonal / Clean", desc: "El negocio en el centro, sin depender del framework." },
          { name: "Orientada a eventos", desc: "Los módulos se comunican con mensajes o colas." },
          { name: "Microservicios", desc: "Servicios independientes que se despliegan por separado." },
        ],
      },
    ],
  },

  methodology: {
    title: "Niveles de metodología",
    levels: {
      simple: "Cero fricción: tablero simple y objetivos semanales. Ideal si trabajas solo.",
      medium: "Iterativo: ciclos cortos (1-2 semanas) con revisión de lo hecho.",
      advanced: "Estructurado: roles, ceremonias y métricas formales. Para equipos o defensa académica.",
    },
    catalog: [
      {
        group: "Metodologías",
        items: [
          { name: "Kanban", desc: "Tablero Por hacer / Haciendo / Hecho con límite de tareas." },
          { name: "Scrum", desc: "Sprints, Product Owner, Scrum Master y reuniones fijas." },
          { name: "Shape Up", desc: "Ciclos de 6 semanas con alcance cerrado (Basecamp)." },
          { name: "XP", desc: "Programación en pareja, TDD e integración continua." },
          { name: "Cascada", desc: "Fases secuenciales: requisitos → diseño → código → pruebas." },
          { name: "RUP", desc: "Proceso iterativo y muy documentado, frecuente en la universidad." },
        ],
      },
    ],
  },

  diagrams: {
    title: "Catálogo de diagramas",
    levels: {
      simple: "Básico: rápido de dibujar y fácil de leer por cualquiera.",
      medium: "Intermedio: requiere conocer la estructura interna del sistema.",
      advanced: "Detallado: documentación técnica profunda.",
    },
    catalog: [
      {
        group: "UML (universidad)",
        items: [
          { name: "Casos de uso", desc: "Actores y lo que pueden hacer en el sistema." },
          { name: "Clases", desc: "Clases, atributos, métodos y sus relaciones." },
          { name: "Secuencia", desc: "Mensajes entre objetos en el tiempo (login, pagos)." },
          { name: "Actividades", desc: "Flujo de un proceso con decisiones y paralelismo." },
          { name: "Estados", desc: "Estados por los que pasa una entidad (pedido, turno)." },
          { name: "Componentes", desc: "Módulos del software y sus dependencias." },
          { name: "Despliegue", desc: "Servidores, dispositivos y dónde corre cada parte." },
        ],
      },
      {
        group: "C4 (industria)",
        items: [
          { name: "C4 · Contexto", desc: "El sistema, sus usuarios y sistemas externos." },
          { name: "C4 · Contenedores", desc: "Apps, APIs y bases de datos que lo forman." },
        ],
      },
      {
        group: "Datos",
        items: [
          { name: "Entidad-Relación (ERD)", desc: "Tablas, campos y relaciones. Solo si hay base de datos." },
          { name: "Flujo de datos (DFD)", desc: "Cómo entran, se transforman y salen los datos." },
        ],
      },
      {
        group: "Procesos",
        items: [
          { name: "BPMN", desc: "Proceso de negocio estándar con roles y tareas." },
          { name: "Diagrama de flujo", desc: "Pasos y decisiones de un proceso." },
        ],
      },
      {
        group: "UX",
        items: [
          { name: "Wireflow", desc: "Bocetos de pantallas conectados por la navegación." },
          { name: "User journey", desc: "La experiencia del usuario paso a paso." },
        ],
      },
      {
        group: "Infraestructura",
        items: [
          { name: "Arquitectura cloud", desc: "Servicios de hosting, base de datos y red." },
        ],
      },
    ],
  },

  morphism: {
    title: "Catálogo de estilos",
    catalog: [
      {
        group: "Estilos visuales",
        items: [
          { name: "Minimalismo", desc: "Plano, bordes finos, neutros. Dashboards y B2B." },
          { name: "Glassmorphism", desc: "Cristal translúcido con desenfoque. Landings premium." },
          { name: "Claymorphism", desc: "Formas infladas tipo arcilla. Educación, lúdico." },
          { name: "Neobrutalismo", desc: "Bordes gruesos, alto contraste. Creativos." },
          { name: "Neumorphism", desc: "Relieve suave extruido. IoT, hardware." },
          { name: "Aurora", desc: "Degradados luminosos. IA, datos." },
          { name: "Cyberpunk", desc: "HUD y neón. Gaming, seguridad." },
          { name: "Skeuomorfismo", desc: "Imita materiales reales. Finanzas, audio." },
          { name: "Terminal", desc: "Consola retro monoespaciada. Herramientas dev." },
          { name: "Papercraft", desc: "Capas de papel con sombras suaves. Productividad." },
        ],
      },
    ],
  },

  // Catálogo fijo de layouts por superficie (sale de src/data/layoutCatalog.js)
  layout: {
    title: "Catálogo de layouts por superficie",
    catalog: LAYOUT_SURFACE_IDS.map((surface) => ({
      group: surfaceLabel(surface),
      items: getSurfaceLayouts(surface).map((layout) => ({
        name: layout.title,
        desc: layout.summary,
      })),
    })),
  },

  deploy: {
    title: "Niveles de despliegue",
    levels: {
      simple: "Un clic: conectas GitHub y se publica solo (Vercel, Netlify).",
      medium: "Configurable: PaaS con servidor y base de datos (Render, Railway, Fly.io).",
      advanced: "Control total: contenedores Docker, VPS o cloud (Cloud Run, AWS).",
    },
    catalog: [
      {
        group: "Tipos de hosting",
        items: [
          { name: "Estático / Jamstack", desc: "Solo archivos: GitHub Pages, Netlify, Vercel." },
          { name: "PaaS", desc: "Subes el código y la plataforma lo ejecuta." },
          { name: "Contenedores", desc: "Empaquetas la app con Docker y la ejecutas donde sea." },
          { name: "VPS", desc: "Un servidor virtual que administras tú." },
          { name: "CI/CD", desc: "Cada push prueba y despliega automáticamente (GitHub Actions)." },
        ],
      },
    ],
  },

  "ai-ecosystem": {
    title: "Niveles del kit de IA",
    levels: {
      simple: "Gratis / básico: planes gratuitos y un asistente de código.",
      medium: "Equilibrado: IA dentro del producto con una API y copilot en el editor.",
      advanced: "Avanzado: agentes, búsqueda semántica (RAG) o modelos propios.",
    },
    catalog: [
      {
        group: "Conceptos",
        items: [
          { name: "LLM", desc: "Modelo de lenguaje: Gemini, Claude, GPT." },
          { name: "Copilot", desc: "Asistente en el editor que sugiere código." },
          { name: "Agente", desc: "IA que ejecuta tareas por pasos (Claude Code)." },
          { name: "RAG", desc: "La IA responde usando tus propios documentos." },
          { name: "AGENTS.md", desc: "Archivo de contexto para que la IA conozca tu proyecto." },
        ],
      },
    ],
  },
};

export const getStationCategories = (stationId) =>
  STATION_CATEGORIES[stationId] || null;
