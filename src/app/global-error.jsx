"use client"; // Los límites de error deben ser Client Components

/**
 * Error en el layout raíz: reemplaza todo el documento, así que trae su propio
 * <html>, <body> y estilos en línea (aquí no cargan los estilos globales).
 */
export default function GlobalError({ error, retry }) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
          padding: 16,
          textAlign: "center",
          background: "#0a0a0a",
          color: "#f5f5f5",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
        }}
      >
        <title>Error · Dev.Idea</title>
        <h1 style={{ fontSize: 24, margin: 0 }}>Dev.Idea no pudo cargar</h1>
        <p style={{ maxWidth: 360, color: "#a3a3a3", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
          Tu mapa está a salvo en tu navegador y en tu cuenta. Intenta de nuevo.
        </p>
        {error?.digest && (
          <code style={{ fontSize: 11, color: "#737373" }}>Código: {error.digest}</code>
        )}
        <button
          type="button"
          onClick={() => retry()}
          style={{
            padding: "10px 20px",
            borderRadius: 12,
            border: "none",
            background: "#ffffff",
            color: "#0a0a0a",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
          }}
        >
          Intentar de nuevo
        </button>
      </body>
    </html>
  );
}
