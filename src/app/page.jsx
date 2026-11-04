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

  const isDesktop =
    typeof window !== "undefined" ? window.innerWidth >= 1024 : true;
  const shouldOffset = isRouteMapOpen && currentStep > 0 && isDesktop;

  return (
    <main className="min-h-[100dvh] w-full flex flex-col bg-neutral-950 text-neutral-100 relative overflow-x-hidden font-sans selection:bg-neutral-800 selection:text-white">
      {/* Resplandor ambiental */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[90vw] sm:w-[600px] lg:w-[800px] h-[200px] sm:h-[300px] bg-neutral-800/15 blur-[120px] pointer-events-none rounded-full" />

      {/* Toast Flotante */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed top-14 sm:top-18 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl bg-neutral-900/90 border border-neutral-800 text-neutral-200 text-[11px] sm:text-xs font-mono shadow-2xl backdrop-blur-xl w-[90%] max-w-sm justify-center"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="truncate">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Fijo */}
      <header className="w-full shrink-0 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <DevIdeaLogo height={24} className="text-white sm:h-[26px]" />
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <AnimatePresence>
              {cloudProjectId && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1.5 text-[10px] font-mono px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-emerald-400"
                >
                  <Cloud className="w-3 h-3 shrink-0" />
                  <span className="hidden xs:inline">Nube activa</span>
                </motion.span>
              )}
            </AnimatePresence>

            <span className="hidden lg:inline text-[11px] px-2.5 py-1 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono">
              Inferencia Gemini 3.8 Flash
            </span>

            {/* Auth Button / User Profile */}
            <AnimatePresence mode="wait">
              {currentUser ? (
                <motion.div
                  key="user-logged"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center gap-1.5 sm:gap-2 p-1 pl-1.5 sm:pl-2 rounded-xl bg-neutral-900 border border-neutral-800"
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

                  <span className="text-xs font-mono text-neutral-300 max-w-[85px] sm:max-w-[120px] truncate hidden xs:inline">
                    {currentUser.user_metadata?.full_name ||
                      currentUser.user_metadata?.name ||
                      currentUser.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleSignOut}
                    title="Cerrar sesión"
                    className="p-1 sm:p-1.5 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-red-400 transition-colors cursor-pointer"
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
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-medium transition-all shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <LogIn className="w-3.5 h-3.5 shrink-0" />
                  <span className="hidden xs:inline">Iniciar con Google</span>
                  <span className="xs:hidden">Entrar</span>
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mapa lateral modal/panel */}
      <StationBreadcrumb />

      {/* Contenedor Central Fluido */}
      <motion.div
        animate={{
          x: shouldOffset ? -140 : 0,
        }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col items-center justify-start gap-4 sm:gap-6"
      >
        {/* Mascota Strobi con altura contenida y escala fluida */}
        <section className="shrink-0 flex flex-col items-center">
          <div className="scale-80 sm:scale-90 lg:scale-100 origin-center">
            <CompanionAvatar size={105} />
          </div>
        </section>

        {/* Lienzo de Decisiones Fluido */}
        <section className="w-full flex justify-center pb-6">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-full flex justify-center"
          >
            <DecisionCanvas />
          </motion.div>
        </section>
      </motion.div>

      {/* Footer Fluido */}
      <footer className="w-full shrink-0 border-t border-neutral-900/80 py-3 sm:py-4 text-center text-[10px] sm:text-xs text-neutral-600 font-mono px-4 mt-auto">
        Dev.Idea © 2026 · Lienzo de Arquitectura y Decisiones Técnicas
      </footer>
    </main>
  );
}
