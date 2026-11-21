import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

/**
 * Imagen que aparece al compartir el enlace (WhatsApp, LinkedIn, X…).
 * Se genera en el build con el logo claro y los datos clave de Dev.Idea.
 */
export const alt = "Dev.Idea — Planifica tu software paso a paso";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PILLS = ["15 estaciones", "3 modos", "Cartas con IA", "AGENTS.md"];

export default async function Image() {
  const logo = await readFile(
    join(process.cwd(), "public/assets/readme/dev-idea-lockup-dark.svg"),
    "utf8",
  );
  const logoSrc = `data:image/svg+xml;base64,${Buffer.from(logo).toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background:
            "radial-gradient(circle at 85% 15%, #2a2150 0%, #0a0a0a 55%)",
          color: "#f5f5f5",
        }}
      >
        {/* ImageResponse solo admite <img> (next/image no aplica aquí) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={452} height={100} alt="" />

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>
            Planifica tu software paso a paso
          </div>
          <div style={{ fontSize: 28, color: "#a3a3a3", lineHeight: 1.4, maxWidth: 940 }}>
            De una idea a requisitos, stack, base de datos, arquitectura,
            diagramas, diseño y deploy, eligiendo entre cartas.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14 }}>
          {PILLS.map((pill) => (
            <div
              key={pill}
              style={{
                display: "flex",
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid #3f3f46",
                background: "#18181b",
                fontSize: 24,
                color: "#e4e4e7",
              }}
            >
              {pill}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
