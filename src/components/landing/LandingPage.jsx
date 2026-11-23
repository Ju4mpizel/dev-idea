"use client";

import { useState } from "react";
import { siGoogle } from "simple-icons";
import { Map, Layers, Sparkles } from "lucide-react";
import DevIdeaLogo from "@/components/brand/DevIdeaLogo";
import { StrobiAvatar } from "@/components/companion/StrobiAvatar";
import { CompanionBubble } from "@/components/companion/CompanionBubble";
import { useIntro, introClass, introDelay } from "@/hooks/useIntro";
import { signInWithGoogle } from "@/services/projectService";
import { GoogleSignInButton } from "./GoogleSignInButton";

const FEATURES = [
  {
    icon: Map,
    title: "15 estaciones guiadas",
    desc: "De la idea al deploy, una decisión a la vez.",
  },
  {
    icon: Layers,
    title: "Tu plano técnico",
    desc: "Stack, base de datos, arquitectura, diagramas y más.",
  },
  {
    icon: Sparkles,
    title: "Sin experiencia previa",
    desc: "Cada opción explicada en simple, con su nivel.",
  },
];

/**
 * Portada para visitantes sin sesión: Dev-i da la bienvenida y el único paso
 * es iniciar sesión con Google (requisito para generar con IA).
 */
export function LandingPage() {
  const intro = useIntro();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState(null);

  const handleSignIn = async () => {
    setIsSigningIn(true);
    setError(null);
    try {
      // Redirige a Google; al volver, la puerta de sesión abre la Estación 0
      await signInWithGoogle();
    } catch (err) {
      console.error("[Login]", err);
      setError("No se pudo abrir el inicio de sesión. Intenta de nuevo.");
      setIsSigningIn(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full flex flex-col bg-neutral-950 text-neutral-100 relative overflow-x-hidden font-sans">
      <div
        className={`dot-grid fixed inset-0 pointer-events-none ${introClass(intro, "intro-fade")}`}
        style={introDelay(intro, 150)}
      />
      <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[600px] lg:w-[800px] h-[320px] bg-neutral-800/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="relative z-10 flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-16 flex flex-col items-center text-center gap-7 sm:gap-9">
        {/* Logo que se dibuja */}
        <h1 className="sr-only">Dev.Idea</h1>
        <DevIdeaLogo
          height={52}
          className="text-white w-auto max-w-full sm:h-[72px]"
          intro={intro}
        />

        {/* Dev-i da la bienvenida */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          <div
            className={introClass(intro, "intro-pop")}
            style={introDelay(intro, 650)}
          >
            <StrobiAvatar size={120} mood="happy" />
          </div>
          <div
            className={`w-full sm:w-[420px] ${introClass(intro, "intro-slide-left")}`}
            style={introDelay(intro, 900)}
          >
            <CompanionBubble message="¡Hola! Soy Dev-i 👋 Te acompaño a convertir tu idea en un plano técnico, estación por estación." />
          </div>
        </div>

        {/* Qué es */}
        <p
          className={`max-w-xl text-sm sm:text-base text-neutral-400 leading-relaxed ${introClass(intro, "intro-rise")}`}
          style={introDelay(intro, 1050)}
        >
          Dev.Idea es un lienzo para decidir cómo construir tu software:
          describes tu idea y la IA te propone opciones claras en cada etapa,
          para que llegues a programar con un plan sólido.
        </p>

        <ul className="w-full grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
          {FEATURES.map(({ icon: Icon, title, desc }, i) => (
            <li
              key={title}
              className={`p-3.5 sm:p-4 rounded-2xl border border-neutral-800/80 bg-neutral-900/50 backdrop-blur-md text-left flex sm:flex-col gap-3 sm:gap-2 ${introClass(intro, "intro-rise")}`}
              style={introDelay(intro, 1150 + i * 90)}
            >
              <span className="w-8 h-8 shrink-0 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center">
                <Icon className="w-4 h-4 text-neutral-200" aria-hidden="true" />
              </span>
              <span>
                <span className="block text-xs sm:text-sm font-semibold text-neutral-100">
                  {title}
                </span>
                <span className="block text-[11px] sm:text-xs text-neutral-500 mt-0.5">
                  {desc}
                </span>
              </span>
            </li>
          ))}
        </ul>

        {/* Único paso: iniciar sesión */}
        <div
          className={`flex flex-col items-center gap-2.5 ${introClass(intro, "intro-rise")}`}
          style={introDelay(intro, 1450)}
        >
          <GoogleSignInButton
            onError={setError}
            // Respaldo: login por redirección (sin client ID o si Google no carga)
            fallback={
              <button
                type="button"
                onClick={handleSignIn}
                disabled={isSigningIn}
                className="flex items-center justify-center gap-2.5 px-5 sm:px-6 py-3 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-sm font-semibold shadow-[0_0_30px_rgba(255,255,255,0.12)] transition-all active:scale-95 cursor-pointer disabled:opacity-60 disabled:cursor-wait"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4 shrink-0"
                  aria-hidden="true"
                  fill="currentColor"
                >
                  <path d={siGoogle.path} />
                </svg>
                {isSigningIn
                  ? "Abriendo Google..."
                  : "Iniciar sesión con Google para comenzar"}
              </button>
            }
          />
          <p className="text-[10px] sm:text-[11px] font-mono text-neutral-500">
            Gratis · 2 ideas cada 8 horas · Tus mapas se guardan en tu cuenta
          </p>
          {error && (
            <p role="alert" className="text-xs text-red-400">
              {error}
            </p>
          )}
        </div>
      </div>

      <footer
        className={`relative z-10 w-full shrink-0 border-t border-neutral-900/80 py-3 sm:py-4 text-center text-[10px] sm:text-xs text-neutral-600 font-mono px-4 ${introClass(intro, "intro-fade")}`}
        style={introDelay(intro, 1600)}
      >
        Dev.Idea © 2026 · Lienzo de Arquitectura y Decisiones Técnicas
      </footer>
    </main>
  );
}
