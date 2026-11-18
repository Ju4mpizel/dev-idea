"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DevIdeaLogo from "@/components/brand/DevIdeaLogo";
import { CompanionAvatar } from "@/components/companion/CompanionAvatar";
import { StationInfoPanel } from "@/components/companion/StationInfoPanel";
import { ProjectPlanPanel } from "@/components/companion/ProjectPlanPanel";
import { StationCategoriesPanel } from "@/components/navigation/StationCategoriesPanel";
import { CloudSyncBadge } from "@/components/navigation/CloudSyncBadge";
import { LoadingSides } from "@/components/ui/LoadingSides";
import { useCloudAutosave } from "@/hooks/useCloudAutosave";
import { DecisionCanvas } from "@/components/map/DecisionCanvas";
import { StationBreadcrumb } from "@/components/navigation/StationBreadcrumb";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { useIntro, introClass, introDelay } from "@/hooks/useIntro";
import { getStation } from "@/config/stations.config";
import { supabase } from "@/lib/supabaseClient";
import { signInWithGoogle, signOut } from "@/services/projectService";
import { LogIn, LogOut, CheckCircle2 } from "lucide-react";

// Espacio que el contenido cede a cada panel lateral (ancho del panel + margen)
const INFO_PANEL_SPACE = 360;
const MAP_PANEL_SPACE = 340;

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
  const infoStationId = useDecisionStore((state) => state.infoStationId);
  const closeStationInfo = useDecisionStore((state) => state.closeStationInfo);
  const isCategoriesOpen = useDecisionStore((state) => state.isCategoriesOpen);
  const isPlanPanelOpen = useDecisionStore((state) => state.isPlanOpen);
  const closePlan = useDecisionStore((state) => state.closePlan);

  const [toastMessage, setToastMessage] = useState(null);

  // Entrada de la página: navbar, logo dibujándose, Strobi con "pop"...
  const intro = useIntro();

  // Con sesión iniciada, cada cambio del mapa se guarda solo en Supabase
  useCloudAutosave();

  // Escape cierra la explicación de Strobi o "Mi plano"
  useEffect(() => {
    if (!infoStationId && !isPlanPanelOpen) return undefined;
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      closeStationInfo();
      closePlan();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [infoStationId, isPlanPanelOpen, closeStationInfo, closePlan]);

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

  // Paneles laterales (Strobi / mapa a la derecha, categorías a la izquierda):
  // al abrirse, el contenido se desliza y les deja sitio (animación de empuje).
  // La cabecera mantiene su altura, así el empuje es solo horizontal.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isWide = useMediaQuery("(min-width: 1280px)");
  const isInfoOpen = Boolean(infoStationId) && currentStep > 0;
  const isPlanOpen = isPlanPanelOpen && currentStep > 0;
  // Strobi sale de la cabecera para ir a un panel ("¿Qué es?" o "Mi plano")
  const isStrobiAway = isInfoOpen || isPlanOpen;
  const sidePanelSpace =
    isStrobiAway && isWide
      ? INFO_PANEL_SPACE
      : isRouteMapOpen && currentStep > 0 && isDesktop
        ? MAP_PANEL_SPACE
        : 0;
  // Strobi de la cabecera oculto o tapado por un panel: se congela
  const isStrobiCovered =
    isStrobiAway ||
    (isRouteMapOpen && currentStep > 0 && !isDesktop) ||
    (isCategoriesOpen && currentStep > 0 && !isWide);
  const leftPanelSpace =
    isCategoriesOpen && currentStep > 0 && isWide ? INFO_PANEL_SPACE : 0;
  const currentStation = getStation(currentStep);
  const isLoading = useDecisionStore((state) => state.isLoading);

  // Al cambiar de estación, volvemos arriba para no aterrizar a media página
  useEffect(() => {
    if (window.scrollY > 0) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  return (
    <main className="min-h-[100dvh] w-full flex flex-col bg-neutral-950 text-neutral-100 relative overflow-x-hidden font-sans selection:bg-neutral-800 selection:text-white">
      {/* Fondo de puntos: solo bajo la navbar */}
      <div
        className={`dot-grid fixed inset-x-0 top-14 bottom-0 pointer-events-none ${introClass(intro, "intro-fade")}`}
        style={introDelay(intro, 150)}
      />

      {/* Tuercas gigantes a los lados (detrás del contenido) mientras se genera */}
      <LoadingSides active={isLoading && currentStep > 0} />

      {/* Resplandor ambiental */}
      <div className="hidden sm:block absolute top-0 left-1/2 -translate-x-1/2 w-[600px] lg:w-[800px] h-[300px] bg-neutral-800/15 blur-[120px] pointer-events-none rounded-full" />

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
      <header
        className={`w-full shrink-0 border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-30 ${introClass(intro, "intro-drop")}`}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <DevIdeaLogo
              height={24}
              className="text-white sm:h-[26px]"
              intro={intro}
            />
          </div>

          <div
            className={`flex items-center gap-2 sm:gap-3 ${introClass(intro, "intro-slide-right")}`}
            style={introDelay(intro, 420)}
          >
            {currentStep === 0 && cloudProjectId && <CloudSyncBadge />}

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

      {/* Explicación "¿Qué es...?" con Strobi al lado de la estación */}
      <StationInfoPanel />

      {/* 💡 Mi plano: lo decidido hasta ahora, con Strobi */}
      <ProjectPlanPanel />

      {/* Tabla de categorías de la estación, a la izquierda */}
      {currentStep > 0 && <StationCategoriesPanel />}

      {/* Contenedor Central Fluido */}
      <motion.div
        initial={false}
        animate={{ paddingRight: sidePanelSpace, paddingLeft: leftPanelSpace }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 flex-1 w-full flex flex-col"
      >
      <div className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:py-5 flex flex-col items-center justify-start gap-3 sm:gap-5">
        {/* Cabecera: Strobi y el nombre de la estación comparten la MISMA celda
            de la grilla, así su altura no cambia al abrir "¿Qué es?" y las
            cartas no pegan un tirón. Mientras Strobi explica a un lado, en su
            hueco queda el nombre de la estación en gris. */}
        <section className="shrink-0 w-full grid place-items-center [&>*]:col-start-1 [&>*]:row-start-1">
          <motion.div
            initial={false}
            animate={
              isStrobiAway
                ? { opacity: 0, y: -60, scale: 0.9 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className={`w-full flex justify-center will-change-transform ${isStrobiAway ? "pointer-events-none" : ""}`}
            aria-hidden={isStrobiAway || undefined}
          >
            {/* En las estaciones Strobi es más compacto para dejar sitio al mazo */}
            <CompanionAvatar
              // Clase fija: si cambiara al volver a la estación 0, el pop se repetiría
              intro={intro}
              size={currentStep > 0 ? 76 : 105}
              compact={currentStep > 0}
              paused={isStrobiCovered}
            />
          </motion.div>

          <AnimatePresence>
            {isStrobiAway && currentStation && (
              <motion.div
                key={`station-name-${currentStation.id}`}
                initial={{ opacity: 0, y: 12, scale: 1.08 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none select-none text-center will-change-transform"
              >
                <span className="block text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">
                  Estación {currentStation.stepNumber}
                </span>
                <span className="block text-4xl sm:text-6xl font-black uppercase text-neutral-800/90 leading-none">
                  {currentStation.navLabel}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* Lienzo de Decisiones Fluido */}
        {/* Al cambiar de estación, la actual cae hacia abajo y la siguiente
            (o su esqueleto de carga) baja desde arriba. El paso va como prop
            para que la estación que sale conserve su contenido al animarse. */}
        <section className="w-full flex justify-center pb-6">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, y: -28 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 90, scale: 0.97 }}
              transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
              className="w-full flex justify-center will-change-transform"
            >
              <DecisionCanvas step={currentStep} />
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
      </motion.div>

      {/* Footer Fluido */}
      <footer
        className={`w-full shrink-0 border-t border-neutral-900/80 py-3 sm:py-4 text-center text-[10px] sm:text-xs text-neutral-600 font-mono px-4 mt-auto ${introClass(intro, "intro-fade")}`}
        style={introDelay(intro, 1400)}
      >
        Dev.Idea © 2026 · Lienzo de Arquitectura y Decisiones Técnicas
      </footer>
    </main>
  );
}
