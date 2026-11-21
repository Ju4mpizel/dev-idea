import Link from "next/link";
import DevIdeaLogo from "@/components/brand/DevIdeaLogo";

export const metadata = {
  title: "Página no encontrada",
};

/** 404: cualquier ruta que no existe vuelve al lienzo. */
export default function NotFound() {
  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-4 text-center">
      <DevIdeaLogo height={30} className="text-white" />
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500">
          Error 404
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Esta estación no existe
        </h1>
        <p className="max-w-sm text-sm text-neutral-400 leading-relaxed">
          La página que buscas no está en el mapa. Vuelve al inicio y sigue
          planificando tu proyecto.
        </p>
      </div>
      <Link
        href="/"
        className="px-5 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-sm font-medium transition-colors"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
