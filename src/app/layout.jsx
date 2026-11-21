import "./globals.css";
import { SITE_DESCRIPTION, SITE_NAME, getSiteUrl } from "@/lib/siteUrl";

const TITLE = "Dev.Idea — Planifica tu software paso a paso";

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: TITLE,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "planificación de software",
    "arquitectura de software",
    "requisitos funcionales",
    "historias de usuario",
    "stack tecnológico",
    "diagramas UML",
    "AGENTS.md",
    "vibe coding",
    "Gemini",
  ],
  creator: SITE_NAME,
  alternates: { canonical: "/" },
  // La imagen la genera src/app/opengraph-image.jsx (Next la enlaza sola)
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: TITLE,
    description: SITE_DESCRIPTION,
    url: "/",
    locale: "es_LA",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

export const viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className="bg-neutral-950 text-neutral-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
