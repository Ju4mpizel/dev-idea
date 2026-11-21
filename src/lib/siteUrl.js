/**
 * URL pública del sitio, para metadatos (openGraph, canonical, sitemap).
 * Orden: NEXT_PUBLIC_SITE_URL (si la defines) → dominio de producción que
 * Vercel expone en cada build (VERCEL_PROJECT_PRODUCTION_URL) → localhost.
 */
export function getSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const SITE_NAME = "Dev.Idea";

export const SITE_DESCRIPTION =
  "Planifica tu software paso a paso: requisitos, stack, base de datos, arquitectura, diagramas, diseño y deploy, eligiendo entre cartas generadas con IA. Termina con un AGENTS.md listo para tu agente de IA.";
