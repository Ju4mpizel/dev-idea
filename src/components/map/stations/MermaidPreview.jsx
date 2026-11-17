"use client";

import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Eye, X } from "lucide-react";

/** Sustituye los "\n" literales que a veces devuelve el modelo. */
const cleanSource = (source) => String(source || "").replace(/\\n/g, "\n").trim();

let mermaidPromise = null;
/** Mermaid pesa: se descarga solo la primera vez que se abre un diagrama. */
function loadMermaid() {
  if (!mermaidPromise) {
    mermaidPromise = import("mermaid").then(({ default: mermaid }) => {
      mermaid.initialize({
        startOnLoad: false,
        theme: "dark",
        securityLevel: "strict",
        fontFamily: "ui-sans-serif, system-ui, sans-serif",
      });
      return mermaid;
    });
  }
  return mermaidPromise;
}

function MermaidSvg({ source }) {
  const id = useId().replace(/[^a-zA-Z0-9]/g, "");
  const [result, setResult] = useState({ svg: null, error: null });

  useEffect(() => {
    let cancelled = false;
    loadMermaid()
      .then((mermaid) => mermaid.render(`mmd-${id}`, cleanSource(source)))
      .then(({ svg }) => {
        if (!cancelled) setResult({ svg, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setResult({ svg: null, error: err?.message || "Sintaxis inválida" });
      });
    return () => {
      cancelled = true;
    };
  }, [id, source]);

  if (result.error) {
    return (
      <p className="text-[11px] text-amber-300/90 font-mono">
        No se pudo dibujar el ejemplo (la IA generó sintaxis inválida). Revisa el
        código abajo.
      </p>
    );
  }
  if (!result.svg) {
    return (
      <div className="h-40 rounded-xl bg-neutral-900 animate-pulse flex items-center justify-center text-[11px] font-mono text-neutral-500">
        Dibujando diagrama...
      </div>
    );
  }
  return (
    <div
      className="w-full overflow-auto rounded-xl bg-neutral-900/60 border border-neutral-800 p-3 [&_svg]:mx-auto [&_svg]:max-w-full [&_svg]:h-auto"
      // SVG generado por Mermaid con securityLevel "strict" (sin scripts)
      dangerouslySetInnerHTML={{ __html: result.svg }}
    />
  );
}

/** Botón + modal que dibuja el ejemplo Mermaid de un diagrama. */
export function MermaidPreviewButton({ title, source }) {
  const [open, setOpen] = useState(false);
  if (!source) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          stop(e);
          setOpen(true);
        }}
        onPointerDown={stop}
        className="w-full py-1.5 px-3 rounded-xl border border-neutral-800 bg-neutral-900/70 hover:bg-neutral-800 text-[11px] font-mono text-neutral-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
        <span>Ver ejemplo dibujado</span>
      </button>

      {typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                key="mermaid-preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={stop}
                  className="w-full max-w-2xl p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3 shadow-2xl max-h-[90dvh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Code2 className="w-4 h-4 text-sky-400 shrink-0" />
                      <h4 className="text-sm font-bold text-white">{title}</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      aria-label="Cerrar"
                      className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <MermaidSvg source={source} />

                  <details className="group">
                    <summary className="text-[11px] font-mono text-neutral-400 cursor-pointer hover:text-neutral-200">
                      Ver código Mermaid (cópialo en mermaid.live o en tu README)
                    </summary>
                    <pre className="mt-2 p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 font-mono text-[11px] text-sky-300 whitespace-pre overflow-x-auto">
                      {cleanSource(source)}
                    </pre>
                  </details>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
