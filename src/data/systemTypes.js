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
    words: ["pagina", "web", "sitio", "landing", "website", "presencia"],
  },
  {
    id: "sell",
    title: "Vender online",
    hint: "Catálogo, pedidos y pagos",
    icon: "shopping",
    words: ["tienda", "vender", "venta online", "ecommerce", "e-commerce", "carrito", "comprar"],
  },
  {
    id: "management",
    title: "Sistema de gestión",
    hint: "Uso interno del negocio",
    icon: "briefcase",
    words: [
      "sistema", "gestion", "gestionar", "control", "administrar", "administracion",
      "inventario", "stock", "caja", "facturacion", "punto de venta", "registro", "erp", "crm",
    ],
  },
  {
    id: "booking",
    title: "Reservas y turnos",
    hint: "Agenda, citas y eventos",
    icon: "calendar",
    words: ["reserva", "reservar", "turno", "cita", "agenda", "agendar"],
  },
  {
    id: "platform",
    title: "Plataforma con usuarios",
    hint: "Cuentas, dashboard y comunidad",
    icon: "users",
    words: ["plataforma", "usuarios", "comunidad", "red social", "saas", "suscripcion", "cursos", "dashboard", "foro"],
  },
  {
    id: "mobile",
    title: "App móvil",
    hint: "Android / iOS",
    icon: "smartphone",
    words: ["app movil", "aplicacion movil", "android", "ios", "celular", "movil"],
  },
  {
    id: "backend",
    title: "Backend y automatización",
    hint: "APIs, bots y tareas",
    icon: "server",
    words: ["api", "backend", "bot", "automatizar", "automatizacion", "microservicio"],
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
    words: ["landing", "una sola pagina", "one page", "onepage", "presentacion", "evento", "lanzamiento"],
  },
  {
    id: "multipage",
    family: "web",
    title: "Sitio web con varias páginas",
    summary: "Rutas separadas como Inicio, Menú, Nosotros y Contacto, con menú de navegación.",
    example: "Web con secciones de sabores, sucursales y contacto",
    surfaces: ["public"],
    level: "simple",
    words: ["secciones", "paginas", "rutas", "pestana", "sucursal", "institucional", "corporativ", "nosotros"],
  },
  {
    id: "cms-site",
    family: "web",
    title: "Sitio autoadministrable",
    summary: "Tu web + un panel para cambiar textos, fotos y precios sin tocar código.",
    example: "El dueño actualiza los sabores del día desde el panel",
    surfaces: ["public", "admin"],
    level: "medium",
    words: ["autoadministrable", "editar", "actualizar", "cambiar", "modificar", "precio", "panel", "admin", "cms", "contenido"],
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
    words: ["blog", "noticia", "articulo", "revista", "publicacion", "receta"],
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
    words: ["whatsapp", "pedido", "delivery", "catalogo", "menu", "carta"],
  },
  {
    id: "ecommerce",
    family: "sell",
    title: "Tienda online",
    summary: "Catálogo, carrito, pagos online y gestión de pedidos y stock.",
    example: "Venta de potes de helado con pago con tarjeta",
    surfaces: ["store", "admin"],
    level: "medium",
    words: ["tienda", "carrito", "pago", "checkout", "ecommerce", "e-commerce", "mercado pago", "stripe"],
  },
  {
    id: "marketplace",
    family: "sell",
    title: "Marketplace",
    summary: "Muchos vendedores publican, los compradores comparan y la plataforma cobra comisión.",
    example: "Las heladerías de la ciudad venden en un solo sitio",
    surfaces: ["store", "app", "admin"],
    level: "advanced",
    words: ["marketplace", "vendedores", "comision", "multivendedor", "varios negocios"],
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
    words: ["caja", "cobrar", "punto de venta", "pos", "ticket", "mostrador", "facturacion", "ventas"],
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
    words: ["gestion", "integral", "erp", "negocio", "empleado", "sucursal", "reporte", "administrar"],
  },
  {
    id: "crm",
    family: "management",
    title: "CRM de clientes",
    summary: "Registro de clientes, historial de compras, seguimiento y fidelización.",
    example: "Club de clientes con puntos por cada compra",
    surfaces: ["admin"],
    level: "medium",
    words: ["crm", "cliente", "fidelizacion", "puntos", "seguimiento", "prospecto"],
  },
  {
    id: "records",
    family: "management",
    title: "Sistema de registros (CRUD)",
    summary: "Altas, bajas y cambios de datos con búsqueda y reportes. El clásico proyecto universitario.",
    example: "Registro de alumnos, pacientes o expedientes",
    surfaces: ["admin"],
    level: "simple",
    words: ["registro", "alumno", "paciente", "expediente", "matricula", "notas", "biblioteca", "crud"],
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
    words: ["reserva", "turno", "cita", "agenda", "horario", "consulta"],
  },
  {
    id: "events",
    family: "booking",
    title: "Eventos y entradas",
    summary: "Publicas eventos, la gente se inscribe o compra entradas y controlas el aforo.",
    example: "Inscripciones a un taller de helados artesanales",
    surfaces: ["public", "booking", "admin"],
    level: "medium",
    words: ["evento", "entrada", "ticket", "inscripcion", "aforo", "taller"],
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
    words: ["saas", "suscripcion", "cuenta", "usuarios", "web app", "aplicacion web", "plataforma", "login"],
  },
  {
    id: "lms",
    family: "platform",
    title: "Plataforma de cursos",
    summary: "Cursos con lecciones, progreso del alumno, evaluaciones y certificados.",
    example: "Curso online de heladería artesanal",
    surfaces: ["public", "app", "admin"],
    level: "advanced",
    words: ["curso", "clases", "leccion", "aula virtual", "educativ", "lms", "capacitacion"],
  },
  {
    id: "community",
    family: "platform",
    title: "Red social o comunidad",
    summary: "Perfiles, publicaciones, comentarios, seguidores y moderación.",
    example: "Comunidad que reseña sabores de helado",
    surfaces: ["app", "admin"],
    level: "advanced",
    words: ["red social", "comunidad", "foro", "perfil", "seguidores", "resena", "comentario"],
  },
  {
    id: "dashboard",
    family: "platform",
    title: "Dashboard de datos",
    summary: "Gráficos, indicadores y reportes a partir de datos existentes.",
    example: "Ventas por sabor y por mes en gráficos",
    surfaces: ["app"],
    level: "medium",
    words: ["dashboard", "grafico", "metrica", "indicador", "estadistica", "kpi", "analitica"],
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
    words: ["app movil", "aplicacion movil", "android", "ios", "celular", "play store"],
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
    words: ["api", "backend", "rest", "endpoint", "microservicio", "servidor"],
  },
  {
    id: "bot",
    family: "backend",
    title: "Bot o automatización",
    summary: "Un bot de WhatsApp o Telegram, o tareas que se ejecutan solas.",
    example: "Bot que toma pedidos por WhatsApp",
    surfaces: ["api"],
    level: "medium",
    words: ["bot", "chatbot", "automatizar", "automatizacion", "telegram", "script"],
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

/** minúsculas y sin tildes, para comparar pistas. */
const normalize = (text) =>
  String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");

const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Pistas encontradas en el texto (prefijo de palabra: "pedido" → "pedidos"). */
function findWords(text, words) {
  return words.filter((word) =>
    new RegExp(`(^|[^a-z0-9])${escapeRegExp(word)}`).test(text),
  );
}

/**
 * Detecta la familia y los tipos más probables a partir de la idea.
 * @returns {{ familyId: string|null, recommended: string[], crossId: string|null, matched: string[] }}
 */
export function detectSystemType(idea, context = "startup") {
  const text = normalize(idea);
  const boost = CONTEXT_BOOST[context] || {};

  const familyHits = Object.fromEntries(
    SYSTEM_FAMILIES.map((f) => [f.id, findWords(text, f.words)]),
  );
  // "app" a secas (sin "web") suele ser una app de celular
  if (/(^|[^a-z])app([^a-z]|$)/.test(text) && !/\bweb\b/.test(text)) {
    familyHits.mobile = [...familyHits.mobile, "app"];
  }

  const typeScores = SYSTEM_TYPES.map((type) => {
    const hits = findWords(text, type.words);
    return {
      id: type.id,
      family: type.family,
      hits,
      score: hits.length * 2 + (boost[type.id] || 0),
    };
  });

  const familyScores = SYSTEM_FAMILIES.map((f) => {
    const typeHits = typeScores
      .filter((t) => t.family === f.id)
      .reduce((sum, t) => sum + t.hits.length, 0);
    return { id: f.id, score: familyHits[f.id].length * 2 + typeHits };
  }).sort((a, b) => b.score - a.score);

  const best = familyScores[0];
  const familyId = best && best.score > 0 ? best.id : null;
  if (!familyId) {
    return { familyId: null, recommended: [], crossId: null, matched: [] };
  }

  // Primero los tipos con pistas propias; después, el orden de serie de la
  // familia (el propósito solo reordena, nunca recomienda algo sin relación)
  const ranked = typeScores
    .filter((t) => t.family === familyId)
    .sort((a, b) => b.score - a.score);
  const withHits = ranked.filter((t) => t.hits.length > 0).map((t) => t.id);
  const defaults = [...(FAMILY_DEFAULTS[familyId] || [])].sort(
    (a, b) => (boost[b] || 0) - (boost[a] || 0),
  );
  const recommended = [...new Set([...withHits, ...defaults])].slice(0, 3);

  // Sugerencia de otra familia: la que tenga pistas propias, o la de serie
  const cross = typeScores
    .filter((t) => t.family !== familyId && t.hits.length > 0)
    .sort((a, b) => b.score - a.score)[0];
  const crossId = cross?.id || CROSS_SUGGESTION[familyId] || null;

  const matched = [
    ...new Set([
      ...familyHits[familyId],
      ...ranked.flatMap((t) => t.hits),
    ]),
  ].slice(0, 3);

  return { familyId, recommended, crossId, matched };
}

/** Decisión que se guarda en el blueprint. */
export function buildSystemTypeDecision(typeId, complementIds = []) {
  const type = getSystemType(typeId);
  if (!type) return null;
  const complements = SYSTEM_COMPLEMENTS.filter(
    (c) => complementIds.includes(c.id) && !type.surfaces.includes(c.surface),
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
