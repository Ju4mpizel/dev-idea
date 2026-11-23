"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Login con Google desde NUESTRA página (Google Identity Services): Google
 * entrega un token de identidad y se lo pasamos a Supabase con
 * `signInWithIdToken`. Así la pantalla de Google muestra nuestro dominio y no
 * el de Supabase. Si falta el client ID o el script no carga, se muestra
 * `fallback` (el login por redirección de siempre).
 *
 * Requiere en Google Cloud el origen de la app en "Orígenes autorizados de
 * JavaScript" y ese mismo client ID en el proveedor Google de Supabase.
 */
const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GSI_SRC = "https://accounts.google.com/gsi/client";

let gsiPromise = null;
function loadGsi() {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!gsiPromise) {
    gsiPromise = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = GSI_SRC;
      script.async = true;
      script.onload = resolve;
      script.onerror = () => {
        gsiPromise = null;
        reject(new Error("No se pudo cargar Google Identity Services"));
      };
      document.head.appendChild(script);
    });
  }
  return gsiPromise;
}

/**
 * Nonce de un solo uso contra la reutilización de tokens: Google recibe su
 * SHA-256 (lo incrusta en el token) y Supabase el original para comprobarlo.
 */
async function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  const raw = btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(raw),
  );
  const hashed = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return { raw, hashed };
}

export function GoogleSignInButton({ fallback = null, onError }) {
  const containerRef = useRef(null);
  // loading | ready | signing | failed
  const [status, setStatus] = useState("loading");
  // Cada intento usa un nonce nuevo (tras un error se vuelve a montar el botón)
  const [attempt, setAttempt] = useState(0);
  // El callback de Google vive fuera de React: lee el onError más reciente
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  useEffect(() => {
    if (!CLIENT_ID) return undefined;
    let cancelled = false;

    (async () => {
      try {
        await loadGsi();
        const nonce = await createNonce();
        if (cancelled || !containerRef.current) return;

        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          nonce: nonce.hashed,
          ux_mode: "popup",
          callback: async ({ credential }) => {
            setStatus("signing");
            const { error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: credential,
              nonce: nonce.raw,
            });
            // Con éxito, onAuthStateChange abre la app (la portada se desmonta)
            if (error) {
              console.error("[Login Google]", error);
              onErrorRef.current?.(
                "No se pudo iniciar sesión con Google. Intenta de nuevo.",
              );
              setStatus("loading");
              setAttempt((n) => n + 1);
            }
          },
        });

        containerRef.current.innerHTML = "";
        window.google.accounts.id.renderButton(containerRef.current, {
          type: "standard",
          theme: "filled_black",
          size: "large",
          shape: "pill",
          text: "continue_with",
          logo_alignment: "left",
          locale: "es",
          width: 300,
        });
        setStatus("ready");
      } catch (err) {
        console.error("[Login Google]", err);
        if (!cancelled) setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  if (!CLIENT_ID || status === "failed") return fallback;

  return (
    <div className="relative flex flex-col items-center gap-2 min-h-[44px]">
      {/* Mientras carga el script: un hueco del mismo tamaño que el botón */}
      {status === "loading" && (
        <div
          aria-hidden="true"
          className="absolute top-0 w-[300px] max-w-full h-[44px] rounded-full bg-neutral-800/70 animate-pulse"
        />
      )}
      <div
        ref={containerRef}
        aria-busy={status !== "ready"}
        className={`transition-opacity ${status === "ready" ? "opacity-100" : "opacity-0"} ${
          status === "signing" ? "pointer-events-none" : ""
        }`}
      />
      {status === "signing" && (
        <p className="text-[11px] font-mono text-neutral-400">Entrando...</p>
      )}
    </div>
  );
}
