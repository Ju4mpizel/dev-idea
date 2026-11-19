/**
 * Catálogo de TIPOS DE SISTEMA (estación "Tipo de sistema").
 *
 * No lo genera Gemini: es un catálogo fijo para que cualquiera identifique su
 * producto con un toque. La estación detecta la familia a partir de la idea
 * (sin pedir de nuevo lo que ya se escribió) y recomienda los tipos más
 * probables. Cada tipo declara sus SUPERFICIES (partes con estructura propia),
 * que luego usan el stack, la base de datos, la arquitectura y el layout.
 */

/** Partes de un producto con estructura propia. */
export const SURFACES = {
  public: "Sitio público",
  content: "Contenido / blog",
  store: "Tienda / catálogo",
  app: "App de usuario / dashboard",
  admin: "Panel de gestión / admin",
  booking: "Reservas / agenda",
  mobile: "App móvil",
  api: "API / servicio",
};

export const SYSTEM_FAMILIES = [
  {
    id: "web",
    title: "Página web",
    hint: "Presencia e información",
    icon: "globe",
    words: ["pagina", "pagina web", "web", "sitio", "sitio web", "landing", "website", "presencia online"],
  },
  {
    id: "sell",
    title: "Vender online",
    hint: "Catálogo, pedidos y pagos",
    icon: "shopping",
    words: ["tienda", "tienda online", "vender", "venta online", "ventas online", "ecommerce", "e-commerce", "carrito", "comprar online"],
  },
  {
    id: "management",
    title: "Sistema de gestión",
    hint: "Uso interno del negocio",
    icon: "briefcase",
    words: [
      "sistema", "gestion", "gestionar", "control de", "administrar", "administracion",
      "inventario", "stock", "caja", "facturacion", "punto de venta", "registros", "erp", "crm",
      "soporte", "mesa de ayuda", "helpdesk",
    ],
  },
  {
    id: "booking",
    title: "Reservas y turnos",
    hint: "Agenda, citas y eventos",
    icon: "calendar",
    words: ["reserva", "reservar", "turno", "cita", "agenda", "agendar", "agendamiento"],
  },
  {
    id: "platform",
    title: "Plataforma con usuarios",
    hint: "Cuentas, dashboard y comunidad",
    icon: "users",
    words: ["plataforma", "usuarios", "comunidad", "red social", "saas", "suscripcion", "cursos", "dashboard", "foro", "web app", "aplicacion web"],
  },
  {
    id: "mobile",
    title: "App móvil",
    hint: "Android / iOS",
    icon: "smartphone",
    words: ["app movil", "aplicacion movil", "app para celular", "app nativa", "android", "ios", "play store", "app store"],
  },
  {
    id: "backend",
    title: "Backend y automatización",
    hint: "APIs, bots y tareas",
    icon: "server",
    words: ["api", "backend", "bot", "chatbot", "automatizar", "automatizacion", "microservicio"],
  },
];

/**
 * Tipos concretos. `words`: pistas en la idea que apuntan a ESTE tipo.
 * `level`: simple / medium / advanced (esfuerzo aproximado).
 */
export const SYSTEM_TYPES = [
  // ---------- Página web ----------
  {
    id: "landing",
    family: "web",
    title: "Landing page",
    summary: "Una sola página con scroll: presentas tu negocio o producto y un botón de contacto.",
    example: "Heladería con sabores destacados y botón a WhatsApp",
    surfaces: ["public"],
    level: "simple",
    words: ["landing", "landing page", "una sola pagina", "one page", "onepage", "pagina de presentacion", "lanzamiento"],
  },
  {
    id: "multipage",
    family: "web",
    title: "Sitio web con varias páginas",
    summary: "Rutas separadas como Inicio, Menú, Nosotros y Contacto, con menú de navegación.",
    example: "Web con secciones de sabores, sucursales y contacto",
    surfaces: ["public"],
    level: "simple",
    words: ["varias paginas", "paginas", "secciones", "institucional", "corporativ*", "nosotros", "menu de navegacion"],
  },
  {
    id: "cms-site",
    family: "web",
    title: "Sitio autoadministrable",
    summary: "Tu web + un panel para cambiar textos, fotos y precios sin tocar código.",
    example: "El dueño actualiza los sabores del día desde el panel",
    surfaces: ["public", "admin"],
    level: "medium",
    words: ["autoadministrable", "autogestionable", "cms", "wordpress", "panel para editar", "panel de administracion", "panel admin", "editar el contenido", "actualizar el contenido", "actualizar los precios", "cambiar los precios"],
  },
  {
    id: "portfolio",
    family: "web",
    title: "Portafolio / CV",
    summary: "Muestra tus proyectos, tu experiencia y cómo contactarte.",
    example: "Portafolio de un diseñador o desarrollador",
    surfaces: ["public"],
    level: "simple",
    words: ["portafolio", "portfolio", "cv", "curriculum", "hoja de vida"],
  },
  {
    id: "blog",
    family: "web",
    title: "Blog o portal de noticias",
    summary: "Publicaciones por categorías, buscador y un panel para escribir.",
    example: "Blog de recetas de helados artesanales",
    surfaces: ["public", "content", "admin"],
    level: "medium",
    words: ["blog", "noticia", "articulo", "revista", "portal de noticias", "recetas"],
  },

  // ---------- Vender online ----------
  {
    id: "catalog-orders",
    family: "sell",
    title: "Catálogo + pedidos por WhatsApp",
    summary: "Muestras tus productos y el pedido llega a tu WhatsApp. Sin pagos online.",
    example: "Elegir sabores y tamaño, y enviar el pedido por WhatsApp",
    surfaces: ["public", "store", "admin"],
    level: "simple",
    words: ["pedido", "pedidos por whatsapp", "delivery", "catalogo", "menu digital", "carta digital", "tomar pedidos"],
  },
  {
    id: "ecommerce",
    family: "sell",
    title: "Tienda online",
    summary: "Catálogo, carrito, pagos online y gestión de pedidos y stock.",
    example: "Venta de potes de helado con pago con tarjeta",
    surfaces: ["store", "admin"],
    level: "medium",
    words: ["tienda online", "tienda virtual", "carrito", "pago online", "pagos online", "checkout", "ecommerce", "e-commerce", "mercado pago", "stripe", "pasarela de pago"],
  },
  {
    id: "marketplace",
    family: "sell",
    title: "Marketplace",
    summary: "Muchos vendedores publican, los compradores comparan y la plataforma cobra comisión.",
    example: "Las heladerías de la ciudad venden en un solo sitio",
    surfaces: ["store", "app", "admin"],
    level: "advanced",
    words: ["marketplace", "vendedores", "comision", "multivendedor", "varios negocios", "varias tiendas"],
  },

  // ---------- Sistema de gestión ----------
  {
    id: "pos",
    family: "management",
    title: "Punto de venta (POS)",
    summary: "Cobrar rápido en el mostrador: productos, ticket, caja diaria y cierre.",
    example: "Cobrar cucuruchos y cerrar la caja al final del día",
    surfaces: ["admin"],
    level: "medium",
    words: ["caja", "caja registradora", "cobrar", "punto de venta", "pos", "mostrador", "facturacion", "boleta", "comprobante", "registrar ventas", "control de ventas", "cierre de caja"],
  },
  {
    id: "inventory",
    family: "management",
    title: "Inventario y stock",
    summary: "Entradas y salidas de productos e insumos, con alertas de stock bajo.",
    example: "Controlar litros de cada sabor e insumos",
    surfaces: ["admin"],
    level: "medium",
    words: ["inventario", "stock", "almacen", "insumo", "existencias", "bodega"],
  },
  {
    id: "erp-lite",
    family: "management",
    title: "Gestión integral del negocio",
    summary: "Ventas, stock, clientes, empleados y reportes en un mismo sistema.",
    example: "Ventas, stock y reportes de todas las sucursales",
    surfaces: ["admin", "app"],
    level: "advanced",
    words: ["gestion integral", "erp", "empleado", "planilla", "sucursal", "reporte", "administrar mi negocio", "administrar el negocio", "gestionar mi negocio", "gestion del negocio"],
  },
  {
    id: "crm",
    family: "management",
    title: "CRM de clientes",
    summary: "Registro de clientes, historial de compras, seguimiento y fidelización.",
    example: "Club de clientes con puntos por cada compra",
    surfaces: ["admin"],
    level: "medium",
    words: ["crm", "fidelizacion", "club de clientes", "puntos por compra", "seguimiento de clientes", "cartera de clientes", "gestion de clientes", "prospecto", "leads"],
  },
  {
    id: "records",
    family: "management",
    title: "Sistema de registros (CRUD)",
    summary: "Altas, bajas y cambios de datos con búsqueda y reportes. El clásico proyecto universitario.",
    example: "Registro de alumnos, pacientes o expedientes",
    surfaces: ["admin"],
    level: "simple",
    words: ["registros", "registro de", "alumno", "paciente", "expediente", "matricula", "biblioteca", "crud", "historia clinica"],
  },

  {
    id: "helpdesk",
    family: "management",
    title: "Mesa de ayuda (tickets de soporte)",
    summary: "Los clientes o el equipo abren tickets; se asignan, se responden y se cierran con historial.",
    example: "Reclamos de clientes con estado: abierto, en curso, resuelto",
    surfaces: ["public", "admin"],
    level: "medium",
    words: ["sistema de tickets", "tickets de soporte", "ticket de soporte", "soporte tecnico", "mesa de ayuda", "helpdesk", "help desk", "incidencia", "reclamo", "sistema de soporte"],
  },

  // ---------- Reservas y turnos ----------
  {
    id: "booking",
    family: "booking",
    title: "Reservas y turnos",
    summary: "Los clientes eligen servicio, fecha y hora; tú gestionas la agenda.",
    example: "Reservar una torta helada para retirar el sábado",
    surfaces: ["public", "booking", "admin"],
    level: "medium",
    words: ["reserva", "reservar", "turno", "cita", "agenda", "agendar", "consultorio", "barberia", "peluqueria"],
  },
  {
    id: "events",
    family: "booking",
    title: "Eventos y entradas",
    summary: "Publicas eventos, la gente se inscribe o compra entradas y controlas el aforo.",
    example: "Inscripciones a un taller de helados artesanales",
    surfaces: ["public", "booking", "admin"],
    level: "medium",
    words: ["evento", "venta de entradas", "entradas para", "boleto", "boleteria", "inscripcion", "aforo", "taller", "concierto", "tickets para", "tickets de evento"],
  },

  // ---------- Plataforma con usuarios ----------
  {
    id: "saas",
    family: "platform",
    title: "Web app / SaaS",
    summary: "Usuarios con cuenta, dashboard propio y, a veces, planes de pago.",
    example: "Heladerías gestionan sus pedidos pagando una suscripción",
    surfaces: ["public", "app", "admin"],
    level: "advanced",
    words: ["saas", "suscripcion", "web app", "aplicacion web", "multiusuario", "planes de pago"],
  },
  {
    id: "lms",
    family: "platform",
    title: "Plataforma de cursos",
    summary: "Cursos con lecciones, progreso del alumno, evaluaciones y certificados.",
    example: "Curso online de heladería artesanal",
    surfaces: ["public", "app", "admin"],
    level: "advanced",
    words: ["curso", "cursos online", "clases online", "leccion", "aula virtual", "educativ*", "lms", "capacitacion"],
  },
  {
    id: "community",
    family: "platform",
    title: "Red social o comunidad",
    summary: "Perfiles, publicaciones, comentarios, seguidores y moderación.",
    example: "Comunidad que reseña sabores de helado",
    surfaces: ["app", "admin"],
    level: "advanced",
    words: ["red social", "comunidad", "foro", "seguidores", "resena", "perfiles de usuario"],
  },
  {
    id: "dashboard",
    family: "platform",
    title: "Dashboard de datos",
    summary: "Gráficos, indicadores y reportes a partir de datos existentes.",
    example: "Ventas por sabor y por mes en gráficos",
    surfaces: ["app"],
    level: "medium",
    words: ["dashboard", "grafico", "metrica", "indicador", "estadistica", "kpi", "analitica", "panel de datos"],
  },

  // ---------- App móvil ----------
  {
    id: "mobile-app",
    family: "mobile",
    title: "App móvil",
    summary: "App para Android / iOS con su backend y un panel para administrarla.",
    example: "App para pedir helados y sumar puntos",
    surfaces: ["mobile", "api", "admin"],
    level: "advanced",
    words: ["app movil", "aplicacion movil", "app para celular", "app nativa", "android", "ios", "play store", "app store"],
  },

  // ---------- Backend y automatización ----------
  {
    id: "api",
    family: "backend",
    title: "API / backend",
    summary: "Un servicio sin interfaz que consumen otras apps (web, móvil, terceros).",
    example: "API de pedidos que usan la web y la app",
    surfaces: ["api"],
    level: "medium",
    words: ["api", "api rest", "backend", "endpoint", "microservicio", "servicio web"],
  },
  {
    id: "bot",
    family: "backend",
    title: "Bot o automatización",
    summary: "Un bot de WhatsApp o Telegram, o tareas que se ejecutan solas.",
    example: "Bot que toma pedidos por WhatsApp",
    surfaces: ["api"],
    level: "medium",
    words: ["bot", "chatbot", "automatizar", "automatizacion", "telegram", "bot de whatsapp", "tarea programada"],
  },
];

/** Partes extra que se pueden sumar a cualquier tipo. */
export const SYSTEM_COMPLEMENTS = [
  {
    id: "admin-panel",
    title: "Panel de admin",
    desc: "Para editar contenido o gestionar datos sin tocar código.",
    surface: "admin",
  },
  {
    id: "online-orders",
    title: "Pedidos online",
    desc: "Los clientes piden desde la web.",
    surface: "store",
  },
  {
    id: "client-login",
    title: "Login de clientes",
    desc: "Cuentas para ver historial, puntos o favoritos.",
    surface: "app",
  },
  {
    id: "mobile-version",
    title: "Versión app móvil",
    desc: "Además de la web, una app para el celular.",
    surface: "mobile",
  },
];

/** Si no hay pistas cruzadas, esta es la sugerencia por familia. */
const CROSS_SUGGESTION = {
  web: "catalog-orders",
  management: "catalog-orders",
  booking: "landing",
};

/** Orden de serie de cada familia cuando la idea no da pistas más finas. */
const FAMILY_DEFAULTS = {
  web: ["landing", "multipage", "cms-site"],
  sell: ["catalog-orders", "ecommerce", "marketplace"],
  management: ["erp-lite", "pos", "inventory"],
  booking: ["booking", "events"],
  platform: ["saas", "dashboard", "lms"],
  mobile: ["mobile-app"],
  backend: ["api", "bot"],
};

/**
 * Tipos que tiene sentido ofrecer JUNTO a uno detectado (alternativas o el
 * siguiente escalón). Con una idea clara solo se muestran estos: nada de un
 * POS para "landing para heladería".
 */
const RELATED = {
  landing: ["multipage", "cms-site", "catalog-orders"],
  multipage: ["landing", "cms-site", "blog"],
  "cms-site": ["multipage", "blog", "catalog-orders"],
  portfolio: ["landing", "multipage", "blog"],
  blog: ["cms-site", "multipage"],
  "catalog-orders": ["ecommerce", "landing", "cms-site"],
  ecommerce: ["catalog-orders", "marketplace", "inventory"],
  marketplace: ["ecommerce", "saas"],
  pos: ["inventory", "erp-lite", "crm"],
  inventory: ["pos", "erp-lite"],
  "erp-lite": ["pos", "inventory", "crm"],
  crm: ["erp-lite", "helpdesk", "saas"],
  records: ["erp-lite", "dashboard"],
  helpdesk: ["crm", "saas"],
  booking: ["events", "landing", "crm"],
  events: ["booking", "landing"],
  saas: ["dashboard", "marketplace"],
  lms: ["saas", "community"],
  community: ["saas", "lms"],
  dashboard: ["saas", "erp-lite"],
  "mobile-app": ["api", "saas"],
  api: ["bot", "mobile-app"],
  bot: ["api"],
};

/**
 * Pistas de familia demasiado genéricas para dar la idea por "clara":
 * "sistema para heladería" puede ser un POS, reservas o tickets.
 */
const WEAK_FAMILY_WORDS = new Set([
  "sistema", "web", "plataforma", "usuarios", "control de", "gestion",
  "gestionar", "administrar", "administracion", "app",
]);

/** Máximo de tipos en la vista enfocada (el resto queda tras "ver todos"). */
const FOCUS_LIMIT = 5;

const CONTEXT_BOOST = {
  academic: { records: 2, "erp-lite": 1, lms: 1 },
  personal: { landing: 1, portfolio: 1, "catalog-orders": 1 },
  startup: { saas: 1, ecommerce: 1 },
};

export const getSystemType = (id) =>
  SYSTEM_TYPES.find((t) => t.id === id) || null;
export const getSystemFamily = (id) =>
  SYSTEM_FAMILIES.find((f) => f.id === id) || null;
export const getTypesOfFamily = (familyId) =>
  SYSTEM_TYPES.filter((t) => t.family === familyId);

/** minúsculas, sin tildes y con espacios simples, para comparar pistas. */
const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, " ");

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * ¿Aparece la pista en el texto? Palabra completa con plural opcional
 * ("pedido" → "pedidos"), así "pos" no salta con "posible", "bot" con "botón"
 * ni "rest" con "restaurante". Con "*" final es un prefijo ("corporativ*").
 */
function hasWord(text, word) {
  const isPrefix = word.endsWith("*");
  const core = escapeRegExp(isPrefix ? word.slice(0, -1) : word);
  const tail = isPrefix ? "" : "(?:s|es)?(?![a-z0-9])";
  return new RegExp(`(?:^|[^a-z0-9])${core}${tail}`).test(text);
}

const findWords = (text, words) => words.filter((word) => hasWord(text, word));

/**
 * Detecta qué producto describe la idea.
 * - Idea clara (pistas de un tipo, o de una familia concreta como "tienda"):
 *   `focused` trae SOLO los tipos que encajan y sus alternativas razonables.
 * - Idea ambigua ("sistema para heladería") o sin pistas: `focused` = null y se
 *   muestra el catálogo completo, con la familia probable abierta.
 * @returns {{ familyId: string|null, recommended: string[], crossId: string|null, matched: string[], focused: string[]|null }}
 */
export function detectSystemType(idea, context = "startup") {
  const text = normalize(idea);
  const boost = CONTEXT_BOOST[context] || {};

  const familyHits = Object.fromEntries(
    SYSTEM_FAMILIES.map((f) => [f.id, findWords(text, f.words)]),
  );
  // "app" a secas (sin "web") suele ser una app de celular (pista débil)
  if (hasWord(text, "app") && !hasWord(text, "web")) {
    familyHits.mobile = [...familyHits.mobile, "app"];
  }

  const typeScores = SYSTEM_TYPES.map((type, order) => {
    const hits = findWords(text, type.words);
    return {
      id: type.id,
      family: type.family,
      order,
      hits,
      score: hits.length ? hits.length * 2 + (boost[type.id] || 0) : 0,
    };
  });

  const familyScores = SYSTEM_FAMILIES.map((f) => {
    const typeHits = typeScores
      .filter((t) => t.family === f.id)
      .reduce((sum, t) => sum + t.hits.length, 0);
    return { id: f.id, score: familyHits[f.id].length + typeHits * 2 };
  }).sort((a, b) => b.score - a.score);

  const hitTypes = typeScores
    .filter((t) => t.hits.length > 0)
    .sort((a, b) => b.score - a.score || a.order - b.order);

  // La familia la decide el tipo más claro; si no hay, la de más pistas
  const familyId =
    hitTypes[0]?.family ||
    (familyScores[0]?.score > 0 ? familyScores[0].id : null);
  if (!familyId) {
    return {
      familyId: null,
      recommended: [],
      crossId: null,
      matched: [],
      focused: null,
    };
  }

  const defaults = [...(FAMILY_DEFAULTS[familyId] || [])].sort(
    (a, b) => (boost[b] || 0) - (boost[a] || 0),
  );
  const familyHitIds = hitTypes
    .filter((t) => t.family === familyId)
    .map((t) => t.id);

  const strongFamilyHits = familyHits[familyId].filter(
    (w) => !WEAK_FAMILY_WORDS.has(w),
  );

  let focused = null;
  let recommended;
  if (hitTypes.length) {
    // Los tipos nombrados en la idea + las alternativas del principal
    const top = hitTypes.slice(0, 3).map((t) => t.id);
    focused = [...new Set([...top, ...(RELATED[top[0]] || [])])].slice(
      0,
      FOCUS_LIMIT,
    );
    recommended = hitTypes.slice(0, 2).map((t) => t.id);
  } else if (strongFamilyHits.length) {
    // "página web para...", "tienda para...": su familia y el escalón siguiente
    focused = [
      ...new Set([...defaults, CROSS_SUGGESTION[familyId]].filter(Boolean)),
    ].slice(0, FOCUS_LIMIT);
    recommended = defaults.slice(0, 1);
  } else {
    recommended = [...new Set([...familyHitIds, ...defaults])].slice(0, 3);
  }

  // Sugerencia de otra familia (solo en la vista completa)
  const cross = hitTypes.find((t) => t.family !== familyId);
  const crossId = focused
    ? null
    : cross?.id || CROSS_SUGGESTION[familyId] || null;

  // Pistas para mostrar, sin repetir ("landing" sobra si está "landing page")
  const allMatched = [
    ...new Set([
      ...hitTypes.slice(0, 2).flatMap((t) => t.hits),
      ...familyHits[familyId],
    ]),
  ].map((w) => w.replace(/\*$/, ""));
  const matched = allMatched
    .filter((w) => !allMatched.some((o) => o !== w && o.includes(w)))
    .slice(0, 3);

  return { familyId, recommended, crossId, matched, focused };
}

/**
 * Complementos con sentido para un tipo: los que aún no trae y, por ejemplo,
 * nada de "pedidos online" o "app móvil" para una API o un bot.
 */
const COMPLEMENT_EXCLUSIONS = {
  api: ["online-orders", "client-login", "mobile-version"],
  bot: ["online-orders", "client-login", "mobile-version"],
  records: ["online-orders"],
  helpdesk: ["online-orders"],
  dashboard: ["online-orders"],
  portfolio: ["online-orders", "client-login"],
};

export function getComplementsFor(type) {
  if (!type) return [];
  const excluded = COMPLEMENT_EXCLUSIONS[type.id] || [];
  return SYSTEM_COMPLEMENTS.filter(
    (c) => !type.surfaces.includes(c.surface) && !excluded.includes(c.id),
  );
}

/** ¿El sistema tiene pantallas propias? (una API o un bot no las tiene) */
export const hasUserInterface = (surfaces = []) =>
  surfaces.some((s) => s !== "api");

/** Decisión que se guarda en el blueprint. */
export function buildSystemTypeDecision(typeId, complementIds = []) {
  const type = getSystemType(typeId);
  if (!type) return null;
  const complements = getComplementsFor(type).filter((c) =>
    complementIds.includes(c.id),
  );
  const surfaces = [
    ...new Set([...type.surfaces, ...complements.map((c) => c.surface)]),
  ];
  return {
    id: type.id,
    family: type.family,
    title: type.title,
    summary: type.summary,
    level: type.level,
    surfaces,
    complements: complements.map((c) => c.id),
  };
}

/** Texto legible de las superficies (para prompts y resúmenes). */
export const describeSurfaces = (surfaces = []) =>
  surfaces.map((s) => SURFACES[s] || s).join(" + ");
