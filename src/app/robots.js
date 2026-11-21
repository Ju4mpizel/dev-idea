import { getSiteUrl } from "@/lib/siteUrl";

/** robots.txt: se indexa el sitio, nunca las rutas de la API. */
export default function robots() {
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: `${getSiteUrl()}/sitemap.xml`,
  };
}
