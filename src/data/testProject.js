/**
 * Proyecto de prueba ("Reservalo"): decisiones y cartas completas desde el
 * Naming hasta el Deploy, y la galería de Ecosistema de IA abierta para elegir.
 * Carga al instante y no gasta llamadas a Gemini: sirve para revisar las opciones.
 *
 * Solo lo sirve /api/dev-tools/test-project a las cuentas autorizadas
 * (DEV_TOOLS_EMAILS): este módulo no se importa desde el cliente.
 *
 * Las cartas pasan por `normalizeStepResponse`, así que tienen exactamente la
 * forma que producen las respuestas reales de la IA.
 */
import {
  createInitialBlueprint,
  getStationById,
} from "@/config/stations.config";
import { normalizeStepResponse } from "@/lib/stepContracts";
import { buildSystemTypeDecision } from "@/data/systemTypes";
import { buildLayoutDecision } from "@/data/layoutCatalog";

const IDEA =
  "Sistema de reservas para una pesquería local: los clientes eligen día y hora para pescar, pagan con QR y el dueño gestiona la agenda y los cupos.";

const RAW = {
  naming: {
    companionMood: "thinking",
    companionComment:
      "Un nombre corto se recuerda en la orilla y en el buscador.",
    names: [
      {
        id: "name-1",
        name: "Reservalo",
        style: "Modern SaaS",
        tagline: "Tu turno de pesca en dos toques.",
        rationale: "Verbo directo y fácil de dictar por teléfono.",
      },
      {
        id: "name-2",
        name: "PescaTurno",
        style: "Descriptivo (dice lo que hace)",
        tagline: "Reserva tu lugar en la laguna.",
        rationale: "Explica el producto sin necesidad de contexto.",
      },
      {
        id: "name-3",
        name: "Anzuelo",
        style: "Minimalista",
        tagline: "Pesca sin filas.",
        rationale: "Una palabra con identidad propia y dominio corto.",
      },
      {
        id: "name-4",
        name: "CupoFish",
        style: "Técnico/Pragmático",
        tagline: "Cupos y pagos en un solo lugar.",
        rationale: "Refleja el control de aforo del negocio.",
      },
      {
        id: "name-5",
        name: "PicaYa",
        style: "Juego de palabras",
        tagline: "Si pica, ya reservaste.",
        rationale: "Guiño a la pesca y a la inmediatez.",
      },
      {
        id: "name-6",
        name: "LagoPass",
        style: "Disruptivo",
        tagline: "El pase digital a tu jornada de pesca.",
        rationale: "Suena a producto moderno y escalable.",
      },
    ],
  },

  requirements: {
    companionMood: "thinking",
    companionComment:
      "Primero el QUÉ: reservas, pagos y agenda son el corazón.",
    options: [
      {
        id: "req-1",
        level: "simple",
        title: "Reservas por día y hora",
        tag: "Núcleo",
        summary: "El cliente elige fecha, turno y cantidad de cañas.",
        beginnerTip: "Como sacar turno en el médico, pero para pescar.",
        functional: [
          "El sistema debe permitir elegir fecha y turno disponibles",
          "El sistema debe permitir indicar la cantidad de personas",
          "El sistema debe enviar un comprobante de la reserva",
        ],
        nonFunctional: [
          "La reserva debe completarse en menos de 1 minuto en el celular",
        ],
      },
      {
        id: "req-2",
        level: "simple",
        title: "Pagos con QR",
        tag: "Cobros",
        summary: "Se paga la seña con un QR y la reserva queda confirmada.",
        beginnerTip: "Escaneas con la app del banco y listo.",
        functional: [
          "El sistema debe generar un QR de pago por reserva",
          "El sistema debe confirmar la reserva al recibir el pago",
        ],
        nonFunctional: [
          "Los datos de pago no se guardan en el servidor propio",
        ],
      },
      {
        id: "req-3",
        level: "medium",
        title: "Agenda y cupos del dueño",
        tag: "Gestión",
        summary: "El dueño ve las reservas del día y bloquea turnos.",
        beginnerTip: "Su cuaderno de reservas, pero ordenado solo.",
        functional: [
          "El sistema debe mostrar la agenda diaria y semanal",
          "El sistema debe permitir bloquear turnos por mal clima",
          "El sistema debe limitar el cupo por turno",
        ],
        nonFunctional: ["La agenda debe actualizarse sin recargar la página"],
      },
      {
        id: "req-4",
        level: "medium",
        title: "Cuentas de clientes",
        tag: "Usuarios",
        summary: "Registro con Google para ver y cancelar reservas.",
        beginnerTip: "Entras con tu cuenta de siempre.",
        functional: [
          "El sistema debe permitir iniciar sesión con Google",
          "El sistema debe listar las reservas del cliente",
        ],
        nonFunctional: ["Las sesiones deben expirar a los 30 días"],
      },
      {
        id: "req-5",
        level: "advanced",
        title: "Notificaciones",
        tag: "Comunicación",
        summary: "Recordatorios por correo un día antes de la reserva.",
        beginnerTip: "Un aviso para que nadie se olvide.",
        functional: ["El sistema debe enviar un recordatorio 24 h antes"],
        nonFunctional: [
          "El 99% de los correos debe salir en menos de 5 minutos",
        ],
      },
      {
        id: "req-6",
        level: "advanced",
        title: "Reportes de ocupación",
        tag: "Datos",
        summary: "Ocupación por día, ingresos y turnos más pedidos.",
        beginnerTip: "Gráficos para decidir precios y horarios.",
        functional: [
          "El sistema debe mostrar la ocupación mensual",
          "El sistema debe exportar las reservas a CSV",
        ],
        nonFunctional: ["Los reportes deben cargar en menos de 3 s"],
      },
    ],
  },

  "user-stories": {
    companionMood: "curious",
    companionComment:
      "Cada historia se puede probar: así sabes cuándo está terminada.",
    options: [
      {
        id: "story-1",
        level: "simple",
        title: "Reservar un turno",
        role: "cliente",
        action: "elegir fecha, turno y cantidad de personas",
        benefit: "asegurar mi lugar sin llamar por teléfono",
        acceptanceCriteria: [
          "Solo se muestran turnos con cupo",
          "Al terminar recibo un comprobante",
        ],
        points: "5",
        tag: "Reservas por día y hora",
      },
      {
        id: "story-2",
        level: "simple",
        title: "Pagar la seña con QR",
        role: "cliente",
        action: "pagar la seña escaneando un QR",
        benefit: "confirmar la reserva al instante",
        acceptanceCriteria: [
          "El QR expira a los 15 minutos",
          "La reserva pasa a 'confirmada' al recibir el pago",
        ],
        points: "8",
        tag: "Pagos con QR",
      },
      {
        id: "story-3",
        level: "simple",
        title: "Ver la agenda del día",
        role: "dueño",
        action: "ver las reservas de hoy ordenadas por turno",
        benefit: "preparar las cañas y los lugares",
        acceptanceCriteria: [
          "Se ve nombre, personas y estado de pago",
          "Se puede filtrar por turno",
        ],
        points: "3",
        tag: "Agenda y cupos del dueño",
      },
      {
        id: "story-4",
        level: "medium",
        title: "Bloquear turnos por clima",
        role: "dueño",
        action: "bloquear uno o varios turnos",
        benefit: "evitar reservas cuando no se puede pescar",
        acceptanceCriteria: [
          "Los turnos bloqueados no se pueden reservar",
          "Los clientes afectados reciben un aviso",
        ],
        points: "5",
        tag: "Agenda y cupos del dueño",
      },
      {
        id: "story-5",
        level: "medium",
        title: "Cancelar mi reserva",
        role: "cliente",
        action: "cancelar una reserva hasta 24 h antes",
        benefit: "liberar el cupo si no puedo ir",
        acceptanceCriteria: [
          "Después de 24 h el botón se desactiva",
          "El cupo vuelve a estar disponible",
        ],
        points: "3",
        tag: "Cuentas de clientes",
      },
      {
        id: "story-6",
        level: "advanced",
        title: "Recibir recordatorio",
        role: "cliente",
        action: "recibir un correo un día antes",
        benefit: "no olvidarme de la reserva",
        acceptanceCriteria: ["El correo incluye fecha, turno y ubicación"],
        points: "2",
        tag: "Notificaciones",
      },
    ],
  },

  stack: {
    companionMood: "curious",
    companionComment: "Un stack que ya conoces vale más que uno de moda.",
    stacks: [
      {
        id: "stack-1",
        level: "simple",
        badge: "ÁGIL / VELOZ",
        title: "Next.js + Supabase",
        summary:
          "Frontend y backend en un solo proyecto, con base de datos y login listos.",
        beginnerTip: "Una caja de herramientas donde todo ya viene conectado.",
        tags: ["Next.js", "Supabase", "PostgreSQL", "Tailwind CSS"],
        defaultLanguage: "TypeScript",
        availableLanguages: ["TypeScript", "JavaScript"],
        pros: "Login, base de datos y hosting gratis en minutos.",
        cons: "Dependes de los límites del plan gratuito de Supabase.",
      },
      {
        id: "stack-2",
        level: "medium",
        title: "React + Node.js (Express) + PostgreSQL",
        badge: "PRAGMÁTICO",
        summary: "SPA con una API propia separada.",
        beginnerTip: "La vitrina y la cocina en edificios distintos.",
        tags: ["React", "Express", "PostgreSQL", "Prisma"],
        defaultLanguage: "TypeScript",
        availableLanguages: ["TypeScript", "JavaScript"],
        pros: "Control total de la API.",
        cons: "Dos despliegues que mantener.",
      },
      {
        id: "stack-3",
        level: "simple",
        title: "Laravel + Livewire",
        badge: "CLÁSICO",
        summary: "Monolito PHP con vistas reactivas.",
        beginnerTip: "Todo en un mismo lugar, como una tienda de barrio.",
        tags: ["Laravel", "Livewire", "MySQL", "Tailwind CSS"],
        defaultLanguage: "PHP",
        availableLanguages: ["PHP"],
        pros: "Muy productivo para CRUD y paneles.",
        cons: "Hosting gratuito más limitado.",
      },
      {
        id: "stack-4",
        level: "advanced",
        title: "ASP.NET Core + Angular",
        badge: "ENTERPRISE",
        summary: "Backend tipado y frontend robusto.",
        beginnerTip: "Una fábrica con normas estrictas.",
        tags: [".NET", "Angular", "PostgreSQL", "Docker"],
        defaultLanguage: "C#",
        availableLanguages: ["C#", "TypeScript"],
        pros: "Escala y se mantiene muy bien.",
        cons: "Curva de aprendizaje alta para un MVP.",
      },
    ],
  },

  database: {
    companionMood: "thinking",
    companionComment:
      "Reservas y pagos son relaciones: una base relacional encaja perfecto.",
    options: [
      {
        id: "db-1",
        level: "simple",
        dbType: "baas",
        title: "Supabase (PostgreSQL gestionado)",
        tag: "Todo incluido",
        summary: "Base Postgres con login y reglas de acceso por fila.",
        beginnerTip:
          "Una base de datos que trae su propio guardia de seguridad.",
        pros: "Auth, tiempo real y RLS sin servidor propio.",
        cons: "500 MB en el plan gratuito.",
        techs: ["Supabase", "PostgreSQL"],
      },
      {
        id: "db-2",
        level: "medium",
        dbType: "relational",
        title: "PostgreSQL en Neon",
        tag: "Serverless",
        summary: "Postgres que se duerme cuando no se usa.",
        beginnerTip: "Una base que se apaga sola para no gastar.",
        pros: "Ramas de base de datos para pruebas.",
        cons: "Arranque en frío de algunos segundos.",
        techs: ["Neon", "PostgreSQL", "Prisma"],
      },
      {
        id: "db-3",
        level: "advanced",
        dbType: "document",
        title: "MongoDB Atlas",
        tag: "Flexible",
        summary: "Documentos JSON para datos que cambian de forma.",
        beginnerTip: "Fichas sueltas en lugar de una tabla rígida.",
        pros: "Esquema flexible.",
        cons: "Las relaciones reserva-pago se complican.",
        techs: ["MongoDB", "Mongoose"],
      },
    ],
  },

  architecture: {
    companionMood: "thinking",
    companionComment:
      "Un monolito bien ordenado alcanza de sobra para una pesquería.",
    options: [
      {
        id: "arch-1",
        level: "simple",
        title: "Monolito con Server Actions",
        tag: "Rápido / Directo",
        summary: "Las páginas llaman a Server Actions que hablan con Supabase.",
        beginnerTip: "El mostrador y la caja en el mismo local.",
        pros: "Mínimo código y un solo despliegue.",
        cons: "La lógica puede mezclarse con la UI.",
        techs: ["Next.js", "Server Actions", "Supabase"],
      },
      {
        id: "arch-2",
        level: "medium",
        title: "Monolito modular por dominios",
        tag: "Pragmático / Modular",
        summary:
          "Módulos de reservas, pagos y agenda con sus propios servicios.",
        beginnerTip: "Un edificio con departamentos separados.",
        pros: "Cada módulo crece sin pisar a los demás.",
        cons: "Requiere disciplina para respetar los límites.",
        techs: ["Next.js", "Zod", "Supabase"],
      },
      {
        id: "arch-3",
        level: "advanced",
        title: "Hexagonal con puertos de pago",
        tag: "Aislamiento Total",
        summary: "El dominio no conoce Supabase ni la pasarela de pago.",
        beginnerTip: "Enchufes estándar: cambias el aparato sin recablear.",
        pros: "Cambiar de pasarela no toca la lógica.",
        cons: "Mucha ceremonia para un MVP.",
        techs: ["TypeScript", "Vitest", "Supabase"],
      },
    ],
  },

  methodology: {
    companionMood: "working",
    companionComment: "Solo o con un amigo: Kanban y entregas semanales.",
    options: [
      {
        id: "meth-1",
        level: "simple",
        title: "Kanban personal",
        tag: "Cero fricción",
        summary: "Tablero con límite de 2 tareas en curso.",
        beginnerTip:
          "Una lista de pendientes que no te deja hacer todo a la vez.",
        pros: "Sin reuniones.",
        cons: "Fácil perder el foco sin fechas.",
        techs: ["GitHub Projects"],
      },
      {
        id: "meth-2",
        level: "medium",
        title: "Micro-sprints de 1 semana",
        tag: "Iterativo",
        summary: "Cada semana una entrega usable.",
        beginnerTip: "Metas cortas que se pueden mostrar.",
        pros: "Avance visible cada viernes.",
        cons: "Planificar cada lunes lleva tiempo.",
        techs: ["GitHub Projects", "Notion"],
      },
      {
        id: "meth-3",
        level: "advanced",
        title: "Scrum formal",
        tag: "Estructurado",
        summary: "Sprints de 2 semanas con ceremonias completas.",
        beginnerTip: "Reglas claras para equipos más grandes.",
        pros: "Ideal para defender en la universidad.",
        cons: "Pesado para una sola persona.",
        techs: ["Jira"],
      },
    ],
  },

  diagrams: {
    companionMood: "curious",
    companionComment: "Con 3 diagramas bien elegidos explicas todo el sistema.",
    options: [
      {
        id: "diag-1",
        level: "simple",
        diagramType: "use-case",
        category: "UML",
        audience: "Ambos",
        title: "Casos de uso",
        tag: "Actores",
        summary: "Cliente y dueño frente a reservar, pagar y gestionar.",
        beginnerTip: "Quién hace qué en el sistema.",
        pros: "Se entiende en un vistazo.",
        cons: "No muestra el orden de los pasos.",
        techs: ["Mermaid"],
        sampleMermaid:
          "flowchart LR\n  C([Cliente]) --> R(Reservar)\n  C --> P(Pagar con QR)\n  D([Dueño]) --> A(Gestionar agenda)",
      },
      {
        id: "diag-2",
        level: "medium",
        diagramType: "erd",
        category: "Datos",
        audience: "Ambos",
        title: "Modelo entidad-relación",
        tag: "Base de datos",
        summary: "Clientes, turnos, reservas y pagos.",
        beginnerTip: "El mapa de las tablas y cómo se conectan.",
        pros: "Evita tablas duplicadas.",
        cons: "Hay que mantenerlo al día.",
        techs: ["Mermaid", "PostgreSQL"],
        sampleMermaid:
          "erDiagram\n  CLIENTE ||--o{ RESERVA : hace\n  TURNO ||--o{ RESERVA : contiene\n  RESERVA ||--|| PAGO : tiene",
      },
      {
        id: "diag-3",
        level: "medium",
        diagramType: "sequence",
        category: "UML",
        audience: "Industria",
        title: "Secuencia del pago QR",
        tag: "Pagos",
        summary: "Cómo viaja la confirmación del pago.",
        beginnerTip: "La conversación entre la app, el banco y la base.",
        pros: "Aclara los webhooks.",
        cons: "Solo cubre un flujo.",
        techs: ["Mermaid"],
        sampleMermaid:
          "sequenceDiagram\n  Cliente->>App: Reservar\n  App->>Pasarela: Crear QR\n  Pasarela-->>App: Webhook pago OK\n  App->>DB: Confirmar reserva",
      },
      {
        id: "diag-4",
        level: "advanced",
        diagramType: "deployment",
        category: "Infraestructura",
        audience: "Industria",
        title: "Diagrama de despliegue",
        tag: "Infra",
        summary: "Dónde corre cada pieza.",
        beginnerTip: "En qué computadoras vive tu sistema.",
        pros: "Útil para planificar el deploy.",
        cons: "Cambia si cambias de hosting.",
        techs: ["Mermaid"],
        sampleMermaid:
          "flowchart LR\n  U[Usuario] --> V[Hosting]\n  V --> S[(Supabase)]",
      },
    ],
  },

  morphism: {
    companionMood: "playful",
    companionComment: "Un estilo limpio genera confianza a la hora de pagar.",
    options: [
      {
        id: "morph-1",
        level: "simple",
        styleKey: "minimalism",
        title: "Minimalismo claro",
        tag: "Confianza",
        summary: "Bordes finos, mucho aire y foco en el botón de reservar.",
        beginnerTip: "Como una app de banco: ordenada y seria.",
        pros: "Carga rápido y se lee fácil al sol.",
        cons: "Poca personalidad de marca.",
        techs: ["Tailwind CSS", "Inter"],
      },
      {
        id: "morph-2",
        level: "medium",
        styleKey: "aurora",
        title: "Aurora acuática",
        tag: "Agua",
        summary: "Degradados verde agua y azul que evocan la laguna.",
        beginnerTip: "Colores que recuerdan al agua.",
        pros: "Identidad visual fuerte.",
        cons: "Cuidar el contraste del texto.",
        techs: ["Tailwind CSS", "CSS Gradients"],
      },
      {
        id: "morph-3",
        level: "advanced",
        styleKey: "papercraft",
        title: "Papercraft amable",
        tag: "Cercano",
        summary: "Tarjetas apiladas con sombras suaves.",
        beginnerTip: "Como fichas de papel sobre una mesa.",
        pros: "Muy legible y cálido.",
        cons: "Sombras de más pesan en móviles viejos.",
        techs: ["Tailwind CSS", "shadcn/ui"],
      },
    ],
  },

  layout: {
    companionMood: "thinking",
    companionComment:
      "Reservar en 3 pasos y una agenda clara: eso es lo que importa.",
    options: [
      {
        surface: "public",
        summary: "Mostrar la laguna, precios y un botón grande de reservar.",
        beginnerTip: "Que en 5 segundos se entienda qué ofreces.",
        ranking: [
          {
            layoutId: "hero-media",
            reason: "Una foto de la laguna con el botón de reservar encima.",
          },
          {
            layoutId: "one-page",
            reason: "Todo en una página: precios, horarios y ubicación.",
          },
        ],
      },
      {
        surface: "booking",
        summary: "Elegir fecha, turno y pagar sin perderse.",
        beginnerTip: "Paso a paso, sin sorpresas.",
        ranking: [
          {
            layoutId: "booking-steps",
            reason: "Fecha → turno → pago QR en pasos guiados.",
          },
          {
            layoutId: "calendar",
            reason: "Calendario para ver la disponibilidad de la semana.",
          },
        ],
      },
      {
        surface: "admin",
        summary: "Agenda del día y bloqueo de turnos.",
        beginnerTip: "El cuaderno del dueño, ordenado.",
        ranking: [
          {
            layoutId: "crud-table",
            reason: "Tabla de reservas con filtros por turno y estado.",
          },
          {
            layoutId: "master-detail",
            reason: "Lista de reservas y detalle del cliente al lado.",
          },
        ],
      },
    ],
  },

  // Cartas fijas de Deploy (sin Gemini). Planes con free tier vigente
  deploy: {
    companionMood: "proud",
    companionComment:
      "Elige dónde vivirá Reservalo. Y recuerda: código que no está en GitHub, no existe.",
    options: [
      {
        id: "dep-1",
        level: "simple",
        title: "Vercel + Supabase",
        tag: "Integración nativa",
        summary:
          "Vercel publica Next.js con cada push a GitHub y Supabase guarda reservas y pagos.",
        beginnerTip:
          "Subes el código y en un minuto tu página ya está en internet.",
        pros: "Cero configuración para Next.js y vistas previas por cada rama.",
        cons: "El plan Hobby es solo para uso no comercial.",
        techs: ["Vercel", "Supabase", "GitHub"],
        providers: [
          { name: "Vercel", role: "hosting" },
          { name: "Supabase", role: "database" },
          { name: "GitHub", role: "repo" },
        ],
        steps: [
          "Sube el código a un repositorio de GitHub",
          "Importa el repo en Vercel",
          "Copia las claves de Supabase en las variables de entorno",
          "Haz push a main y se publica solo",
        ],
        cost: "$0 / mes en el plan Hobby",
      },
      {
        id: "dep-2",
        level: "simple",
        title: "Cloudflare Workers + Supabase",
        tag: "Red global",
        summary:
          "Next.js corre en la red de Cloudflare con el adaptador OpenNext, cerca de cada cliente.",
        beginnerTip:
          "Tu web se copia en cientos de ciudades para cargar rápido en todas.",
        pros: "Tráfico sin límite de ancho de banda y uso comercial permitido.",
        cons: "Algunas funciones de Next.js necesitan ajustes con OpenNext.",
        techs: ["Cloudflare Workers", "Supabase", "GitHub"],
        providers: [
          { name: "Cloudflare Workers", role: "hosting" },
          { name: "Supabase", role: "database" },
          { name: "GitHub", role: "repo" },
        ],
        steps: [
          "Agrega el adaptador @opennextjs/cloudflare al proyecto",
          "Conecta el repo de GitHub en Cloudflare",
          "Configura las variables de Supabase",
          "Haz push y Cloudflare despliega en el borde",
        ],
        cost: "$0 / mes hasta 100.000 peticiones al día",
      },
      {
        id: "dep-3",
        level: "medium",
        title: "Netlify + Supabase",
        tag: "Alternativa simple",
        summary:
          "Netlify compila Next.js desde GitHub y sirve el sitio con formularios y funciones.",
        beginnerTip: "Parecido a Vercel: conectas el repo y se publica solo.",
        pros: "Vistas previas por pull request y despliegues atómicos.",
        cons: "El plan gratuito limita minutos de build y ancho de banda.",
        techs: ["Netlify", "Supabase", "GitHub"],
        providers: [
          { name: "Netlify", role: "hosting" },
          { name: "Supabase", role: "database" },
          { name: "GitHub", role: "repo" },
        ],
        steps: [
          "Sube el código a GitHub",
          "Crea un sitio en Netlify desde el repo",
          "Agrega las variables de entorno de Supabase",
          "Revisa la vista previa y publica",
        ],
        cost: "$0 / mes en el plan Free",
      },
      {
        id: "dep-4",
        level: "medium",
        title: "Render + Supabase",
        tag: "Servidor Node",
        summary:
          "Render ejecuta Next.js como servidor Node continuo, ideal para webhooks de pago.",
        beginnerTip:
          "Una computadora en la nube que tiene tu app siempre lista.",
        pros: "Servidor real: tareas largas y webhooks sin límite de tiempo.",
        cons: "En el plan gratis se duerme tras 15 minutos sin visitas.",
        techs: ["Render", "Supabase", "GitHub"],
        providers: [
          { name: "Render", role: "hosting" },
          { name: "Supabase", role: "database" },
          { name: "GitHub", role: "repo" },
        ],
        steps: [
          "Sube el código a GitHub",
          "Crea un Web Service en Render desde el repo",
          "Define build y start: npm run build y npm start",
          "Agrega las variables de Supabase",
        ],
        cost: "$0 / mes con instancia gratuita que se suspende",
      },
      {
        id: "dep-5",
        level: "advanced",
        title: "Koyeb con Docker",
        tag: "Contenedor",
        summary:
          "La app se empaqueta en Docker y Koyeb la ejecuta; GitHub Actions construye la imagen.",
        beginnerTip:
          "Metes la app en una caja que funciona igual en cualquier servidor.",
        pros: "El mismo contenedor sirve para mudarte a otra nube.",
        cons: "Una sola instancia gratuita con poca memoria.",
        techs: ["Docker", "Koyeb", "GitHub Actions"],
        providers: [
          { name: "Koyeb", role: "hosting" },
          { name: "GitHub Actions", role: "ci" },
          { name: "Supabase", role: "database" },
          { name: "GitHub", role: "repo" },
        ],
        steps: [
          "Escribe un Dockerfile con salida standalone de Next.js",
          "Crea un flujo de GitHub Actions que construya la imagen",
          "Despliega la imagen en Koyeb",
          "Configura las variables de Supabase",
        ],
        cost: "$0 / mes con una instancia gratuita",
      },
      {
        id: "dep-6",
        level: "advanced",
        title: "Google Cloud Run",
        tag: "Escala automática",
        summary:
          "El contenedor corre en Cloud Run y escala de cero a muchas instancias según las visitas.",
        beginnerTip: "Si nadie entra no pagas; si llegan muchos, crece solo.",
        pros: "Escala a cero y aguanta picos de reservas en temporada.",
        cons: "Pide tarjeta para activar la cuenta y la configuración es más técnica.",
        techs: ["Google Cloud Run", "Docker", "GitHub Actions"],
        providers: [
          { name: "Google Cloud Run", role: "hosting" },
          { name: "GitHub Actions", role: "ci" },
          { name: "Supabase", role: "database" },
          { name: "GitHub", role: "repo" },
        ],
        steps: [
          "Crea el Dockerfile del proyecto",
          "Configura GitHub Actions con una cuenta de servicio",
          "Publica la imagen y despliega en Cloud Run",
          "Agrega las variables de Supabase como secretos",
        ],
        cost: "$0 / mes dentro de la capa gratuita mensual",
      },
    ],
  },
};

/** Primera carta cuyo id coincide, sin la marca de selección del mazo. */
const pick = (data, key, id) => data[key].find((o) => o.id === id) || null;
const pickMany = (data, key, ids) =>
  data[key].filter((o) => ids.includes(o.id));

/**
 * Proyecto de prueba: decisiones hasta el Deploy y la estación 13 (Ecosistema
 * de IA) lista para armar el kit (queda sin decidir).
 * @returns {{ blueprint: object, generatedOptions: object, targetStep: number }}
 */
export function buildTestProject() {
  const systemType = buildSystemTypeDecision("booking");
  const base = createInitialBlueprint({
    idea: IDEA,
    context: "startup",
    selectedSystemType: systemType,
  });

  const options = {};
  Object.entries(RAW).forEach(([stationId, raw]) => {
    options[stationId] = normalizeStepResponse(stationId, raw, base).data;
  });
  // Tipo de sistema: catálogo fijo, se resuelve en el cliente
  options["system-type"] = normalizeStepResponse("system-type", {}).data;
  // Ecosistema de IA: galería fija (src/data/aiTools.js), sin cartas de Gemini
  options["ai-ecosystem"] = normalizeStepResponse("ai-ecosystem", {}).data;

  const stack = pick(options.stack, "stacks", "stack-1");

  const blueprint = {
    ...base,
    selectedName: "Reservalo",
    selectedRequirements: pickMany(options.requirements, "options", [
      "req-1",
      "req-2",
      "req-3",
      "req-4",
    ]),
    selectedUserStories: pickMany(options["user-stories"], "options", [
      "story-1",
      "story-2",
      "story-3",
      "story-4",
      "story-5",
    ]),
    selectedStack: { ...stack, selectedLanguage: "TypeScript" },
    selectedDatabase: pick(options.database, "options", "db-1"),
    selectedArchitecture: pick(options.architecture, "options", "arch-2"),
    selectedMethodology: pick(options.methodology, "options", "meth-2"),
    selectedDiagrams: pickMany(options.diagrams, "options", [
      "diag-1",
      "diag-2",
      "diag-3",
    ]),
    selectedStyle: pick(options.morphism, "options", "morph-2"),
    selectedLayout: buildLayoutDecision({
      public: "hero-media",
      booking: "booking-steps",
      admin: "crud-table",
    }),
    selectedDeploy: pick(options.deploy, "options", "dep-1"),
  };

  return {
    blueprint,
    generatedOptions: options,
    targetStep: getStationById("ai-ecosystem").stepNumber,
  };
}
