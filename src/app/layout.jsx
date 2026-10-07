import "./globals.css";

export const metadata = {
  title: "Dev.Idea — Lienzo de Arquitectura de Software",
  description:
    "Herramienta de toma de decisiones técnicas y arquitectura asistida por IA.",
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
