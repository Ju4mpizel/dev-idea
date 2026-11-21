"use client"; // Los límites de error deben ser Client Components

import { useEffect } from "react";
import Link from "next/link";
import DevIdeaLogo from "@/components/brand/DevIdeaLogo";

/**
 * Error inesperado al dibujar la página. El mapa no se pierde: vive en el
 * navegador (y en la nube con sesión), así que reintentar suele bastar.
 */
export default function Error({ error, retry }) {
  useEffect(() => {
    console.error("[Dev.Idea] Error en la página:", error);
  }, [error]);

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center gap-6 px-4 text-center">
      <DevIdeaLogo height={30} className="text-white" />
      <div className="flex flex-col items-center gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-red-400">
          Algo salió mal
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
          Dev-i tropezó con un cable
        </h1>
        <p className="max-w-sm text-sm text-neutral-400 leading-relaxed">
          Tu mapa está a salvo: se guarda en tu navegador y en tu cuenta.
          Intenta de nuevo y, si se repite, recarga la página.
        </p>
        {error?.digest && (
          <code className="text-[11px] text-neutral-500">Código: {error.digest}</code>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-2">
        <button
          type="button"
          onClick={() => retry()}
          className="px-5 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-sm font-medium transition-colors cursor-pointer"
        >
          Intentar de nuevo
        </button>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-900 text-sm transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
