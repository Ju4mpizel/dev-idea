"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DevIdeaLogo from "@/components/brand/DevIdeaLogo";
import { CompanionAvatar } from "@/components/companion/CompanionAvatar";
import { DecisionCanvas } from "@/components/map/DecisionCanvas";
import { StationBreadcrumb } from "@/components/navigation/StationBreadcrumb";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { supabase } from "@/lib/supabaseClient";
import { signInWithGoogle, signOut } from "@/services/projectService";
import { LogIn, LogOut, Cloud, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const currentStep = useDecisionStore((state) => state.currentStep);
  const isRouteMapOpen = useDecisionStore((state) => state.isRouteMapOpen);
  const currentUser = useDecisionStore((state) => state.currentUser);
  const setCurrentUser = useDecisionStore((state) => state.setCurrentUser);
  const cloudProjectId = useDecisionStore((state) => state.cloudProjectId);
  const setCloudProjectId = useDecisionStore(
    (state) => state.setCloudProjectId,
  );
  const setCompanion = useDecisionStore((state) => state.setCompanion);

  const [toastMessage, setToastMessage] = useState(null);

  // Escuchar sesión de Supabase
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [setCurrentUser]);

  const handleSignOut = async () => {
    try {
      await signOut();
      setCloudProjectId(null);
      setCompanion(
        "idle",
        "Sesión cerrada. Ahora estamos en modo memoria local.",
      );
      setToastMessage("Has cerrado sesión. Modo local activado.");
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error(err);
    }
  };

  const shouldOffset = isRouteMapOpen && currentStep > 0;

  return (
    <main className="min-h-screen flex flex-col bg-neutral-950 text-neutral-100 relative overflow-x-hidden font-sans selection:bg-neutral-800 selection:text-white">
      {/* Resplandor ambiental de fondo */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-neutral-800/15 blur-[160px] pointer-events-none rounded-full" />

      {/* Toast Notificación Flotante */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-neutral-200 text-xs font-mono shadow-2xl backdrop-blur-xl"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header oficial */}
      <header className="w-full border-b border-neutral-900 bg-neutral-950/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <DevIdeaLogo height={28} className="text-white" />
          </div>

          <div className="flex items-center gap-3">
            <AnimatePresence>
              {cloudProjectId && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400"
                >
                  <Cloud className="w-3 h-3" />
                  <span>Nube activa</span>
                </motion.span>
              )}
            </AnimatePresence>

            <span className="hidden md:inline text-[11px] px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
              Inferencia Gemini 3.8 Flash
            </span>

            {/* Transición animada de estado de autenticación */}
            <AnimatePresence mode="wait">
              {currentUser ? (
                <motion.div
                  key="user-logged"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-2 p-1 pl-2 rounded-xl bg-neutral-900 border border-neutral-800"
                >
                  {currentUser.user_metadata?.avatar_url ||
                  currentUser.user_metadata?.picture ? (
                    <img
                      src={
                        currentUser.user_metadata?.avatar_url ||
                        currentUser.user_metadata?.picture
                      }
                      alt="Avatar"
                      referrerPolicy="no-referrer"
                      crossOrigin="anonymous"
                      className="w-5 h-5 rounded-full border border-neutral-700 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center text-[10px] font-mono text-neutral-300">
                      {(currentUser.user_metadata?.full_name ||
                        currentUser.email ||
                        "U")[0].toUpperCase()}
                    </div>
                  )}

                  <span className="text-xs font-mono text-neutral-300 max-w-[110px] truncate hidden sm:inline">
                    {currentUser.user_metadata?.full_name ||
                      currentUser.user_metadata?.name ||
                      currentUser.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    title="Cerrar sesión"
                    className="p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.button
                  key="btn-login"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  type="button"
                  onClick={signInWithGoogle}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-medium transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Iniciar con Google</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Tarjeta de mapa lateral */}
      <StationBreadcrumb />

      {/* Contenedor Principal */}
      <motion.div
        animate={{
          x: shouldOffset ? -160 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 max-w-4xl w-full mx-auto px-6 py-8 flex flex-col items-center"
      >
        <section className="mb-4 flex flex-col items-center">
          <CompanionAvatar size={150} />
        </section>

        <section className="w-full flex justify-center">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <DecisionCanvas />
          </motion.div>
        </section>
      </motion.div>

      <footer className="w-full border-t border-neutral-900 py-6 text-center text-xs text-neutral-600 font-mono">
        Dev.Idea © 2026 · Lienzo de Arquitectura y Decisiones Técnicas
      </footer>
    </main>
  );
}
