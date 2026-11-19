/**
 * Catálogo de LAYOUTS por superficie (estación "Layout").
 *
 * Cada superficie del tipo de sistema (sitio público, panel admin, app...) tiene
 * sus layouts conocidos, cada uno con su wireframe (LayoutWireframe.jsx).
 * Gemini no inventa layouts: los ordena y explica para el proyecto.
 */
import { LAYOUT_IDS_BY_SURFACE } from "@/lib/stepSchemas";
import {
  SURFACES,
  detectSystemType,
  getSystemType,
} from "@/data/systemTypes";

export const LAYOUTS = {
  // ---------- Sitio público ----------
  "one-page": {
    title: "One-page lineal",
    summary: "Todo en una página que se recorre con scroll: portada, secciones y contacto.",
  },
  zigzag: {
    title: "Zig-zag (Z)",
    summary: "Imagen y texto se alternan de lado: guía la vista hacia el botón principal.",
  },
  "f-pattern": {
    title: "Lectura en F",
    summary: "Titulares arriba y una columna a la izquierda: ideal para mucho texto.",
  },
  "hero-media": {
    title: "Hero con imagen o video",
    summary: "Una imagen o video grande protagoniza la portada, con poco texto al lado.",
  },
  "split-screen": {
    title: "Pantalla dividida",
    summary: "Dos mitades con el mismo peso: dos opciones, o imagen frente a texto.",
  },
  asymmetric: {
    title: "Asimétrico / editorial",
    summary: "Bloques de distintos tamaños para una web con personalidad y dinamismo.",
  },
  // ---------- Contenido ----------
  magazine: {
    title: "Magazine",
    summary: "Una noticia destacada y el resto en filas, como la portada de una revista.",
  },
  masonry: {
    title: "Galería masonry",
    summary: "Tarjetas de distintas alturas encajadas como ladrillos (estilo Pinterest).",
  },
  "article-sidebar": {
    title: "Artículo + barra lateral",
    summary: "El texto al centro y, a un lado, índice, categorías o artículos relacionados.",
  },
  // ---------- Tienda ----------
  "product-grid": {
    title: "Cuadrícula + filtros",
    summary: "Filtros a la izquierda y productos en cuadrícula: el catálogo clásico.",
  },
  "product-detail": {
    title: "Ficha de producto",
    summary: "Galería grande, precio, opciones y un botón de comprar bien visible.",
  },
  "checkout-steps": {
    title: "Checkout por pasos",
    summary: "Carrito → datos → pago, con el resumen del pedido siempre a la vista.",
  },
  // ---------- App de usuario ----------
  "sidebar-content": {
    title: "Sidebar + contenido",
    summary: "Menú lateral fijo y el contenido a la derecha: el clásico de las apps.",
  },
  "topnav-views": {
    title: "Barra superior + vistas",
    summary: "Menú horizontal arriba y cada sección en su propia vista. Simple y limpio.",
  },
  bento: {
    title: "Bento / dashboard",
    summary: "Tarjetas de distintos tamaños con métricas, gráficos y accesos rápidos.",
  },
  "cards-grid": {
    title: "Cards / bloques",
    summary: "Elementos iguales en cuadrícula (proyectos, cursos, perfiles…).",
  },
  // ---------- Gestión / admin ----------
  "crud-table": {
    title: "Tabla CRUD",
    summary: "Tabla con buscador, filtros y acciones de crear, editar y borrar.",
  },
  "master-detail": {
    title: "Maestro-detalle",
    summary: "Lista a la izquierda y, al elegir un registro, su ficha a la derecha.",
  },
  "wizard-form": {
    title: "Formulario por pasos",
    summary: "Formularios largos divididos en pasos con barra de progreso.",
  },
  "pos-split": {
    title: "POS dividido",
    summary: "Productos a la izquierda y el ticket con el total a la derecha, para cobrar rápido.",
  },
  // ---------- Reservas ----------
  calendar: {
    title: "Calendario / agenda",
    summary: "Vista de mes o semana con los turnos ocupados y libres.",
  },
  "booking-steps": {
    title: "Reserva por pasos",
    summary: "Servicio → fecha y hora → confirmar: reservar en menos de un minuto.",
  },
  // ---------- App móvil ----------
  "bottom-tabs": {
    title: "Pestañas inferiores",
    summary: "Las secciones principales en una barra abajo, al alcance del pulgar.",
  },
  "list-detail": {
    title: "Lista → detalle",
    summary: "Una lista que al tocar un elemento abre su pantalla de detalle.",
  },
  "stack-nav": {
    title: "Navegación en pila",
    summary: "Pantallas que se apilan con un botón de volver, paso a paso.",
  },
};

/** Superficies que tienen pantallas (la API no tiene layout). */
const SURFACES_WITH_LAYOUT = Object.keys(LAYOUT_IDS_BY_SURFACE);

export const getLayout = (id) =>
  LAYOUTS[id] ? { id, ...LAYOUTS[id] } : null;

export const getSurfaceLayouts = (surface) =>
  (LAYOUT_IDS_BY_SURFACE[surface] || []).map(getLayout).filter(Boolean);

export const surfaceLabel = (surface) => SURFACES[surface] || surface;

/**
 * Superficies con pantallas del proyecto. Sale del tipo de sistema; si un
 * proyecto antiguo no lo tiene, se deduce de la idea.
 *
 * Devuelve [] si el usuario eligió un sistema SIN pantallas (API, bot): ahí
 * no hay layout que elegir.
 */
export function layoutSurfacesFor(blueprint = {}) {
  let surfaces = blueprint.selectedSystemType?.surfaces;
  const isExplicit = Array.isArray(surfaces) && surfaces.length > 0;
  if (!isExplicit) {
    const detected = detectSystemType(blueprint.idea, blueprint.context);
    surfaces = getSystemType(detected.recommended[0])?.surfaces || ["public"];
  }
  const withLayout = surfaces.filter((s) => SURFACES_WITH_LAYOUT.includes(s));
  if (withLayout.length) return withLayout;
  return isExplicit ? [] : ["public"];
}

/** Decisión de Layout para un sistema sin pantallas (API, bot). */
export const NO_LAYOUT_DECISION = Object.freeze({
  id: "none",
  title: "Sin interfaz propia",
  summary: "El sistema no tiene pantallas: lo usan otras apps o se maneja por chat.",
  selections: [],
});

/** Decisión que se guarda en el blueprint: un layout por superficie. */
export function buildLayoutDecision(selections) {
  const list = Object.entries(selections)
    .map(([surface, layoutId]) => ({
      surface,
      surfaceTitle: surfaceLabel(surface),
      layoutId,
      layoutTitle: getLayout(layoutId)?.title || layoutId,
    }))
    .filter((s) => s.layoutTitle);
  return {
    id: list.map((s) => s.layoutId).join("+"),
    title: list.map((s) => `${s.surfaceTitle}: ${s.layoutTitle}`).join(" · "),
    summary: list
      .map((s) => `${s.surfaceTitle} → ${getLayout(s.layoutId)?.summary || ""}`)
      .join(" "),
    selections: list,
  };
}
