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
import { useIntro, introClass, introDelay, resetIntro } from "@/hooks/useIntro";
import { useAnimatingLayer } from "@/hooks/useAnimatingLayer";
import { getStation, stationNumberInMode } from "@/config/stations.config";
import { supabase } from "@/lib/supabaseClient";
import { signInWithGoogle, signOut } from "@/services/projectService";
import { AuthTransition } from "@/components/auth/AuthTransition";
import {
  clearLoginTransition,
  hasLoginTransition,
  markLoginTransition,
  wait,
} from "@/lib/authTransition";
import { LogOut } from "lucide-react";
import { LandingPage } from "@/components/landing/LandingPage";

// Espacio que el contenido cede a cada panel lateral (ancho del panel + margen)
const INFO_PANEL_SPACE = 360;
const MAP_PANEL_SPACE = 340;

/**
 * Puerta de sesión: sin sesión se muestra la portada (login con Google, que es
 * requisito para generar con IA); con sesión, la app desde la Estación 0 o
 * donde quedó el mapa. Mientras se lee la sesión, una pantalla neutra evita
 * que la portada parpadee.
 */
export default function HomePage() {
  const currentUser = useDecisionStore((state) => state.currentUser);
  const setCurrentUser = useDecisionStore((state) => state.setCurrentUser);
  const [authReady, setAuthReady] = useState(false);
  // Transición de sesión con Dev-i: { kind: "login"|"welcome"|"logout", hold, ... }
  // `hold` = la pantalla ya cubre todo y no se dibuja nada debajo.
  const [transition, setTransition] = useState(null);

  // Iniciar sesión: Dev-i cubre la portada y luego vamos a Google
  const handleSignIn = async () => {
    setTransition({ kind: "login", hold: false, duration: 900 });
    markLoginTransition();
    await wait(700);
    try {
      await signInWithGoogle();
    } catch (err) {
      setTransition(null);
      throw err;
    }
  };

  // Cerrar sesión: Dev-i cubre la app, se cierra la sesión y aparece la portada
  const handleSignOut = async (signOutAndReset) => {
    setTransition({ kind: "logout", hold: false, duration: LOGOUT_MS });
    await wait(500);
    setTransition((t) => (t ? { ...t, hold: true } : t));
    const startedAt = Date.now();
    try {
      await signOutAndReset();
    } catch (err) {
      console.error(err);
    }
    await wait(Math.max(LOGOUT_MS - 500 - (Date.now() - startedAt), 200));
    resetIntro();
    setTransition(null);
  };

  useEffect(() => {
    let isFirstEvent = true;
    let welcomeTimer;

    // INITIAL_SESSION llega enseguida (sesión guardada o null) y luego cada cambio
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user || null;
      setCurrentUser(user);
      setAuthReady(true);

      // ¿Volvemos de Google con sesión? Dev-i da la bienvenida y abre la
      // Estación 0. Si el login se canceló, se ve la portada sin más.
      if (isFirstEvent) {
        isFirstEvent = false;
        if (hasLoginTransition()) {
          clearLoginTransition();
          if (user) {
            setTransition({
              kind: "welcome",
              hold: true,
              name: firstName(user),
              duration: WELCOME_MS,
            });
            welcomeTimer = setTimeout(() => setTransition(null), WELCOME_MS);
          }
        }
      }
    });

    // Valida el token con Supabase: si fue revocado, se cierra la sesión local
    supabase.auth.getUser().then(({ error }) => {
      if (error?.status === 401 || error?.status === 403) {
        supabase.auth.signOut({ scope: "local" }).catch(() => {});
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(welcomeTimer);
    };
  }, [setCurrentUser]);

  let content = null;
  if (transition?.hold) {
    // La transición cubre la pantalla: debajo no se monta nada, así la
    // Estación 0 o la portada entran con su animación al retirarse
    content = <main className="min-h-[100dvh] w-full bg-neutral-950" />;
  } else if (!authReady) {
    content = (
      <main className="min-h-[100dvh] w-full grid place-items-center bg-neutral-950">
        {/* Aparece con retraso: si la sesión llega rápido (o vuelve de Google
            con bienvenida) el logo de carga no alcanza a parpadear */}
        <div className="intro intro-fade" style={{ "--d": "400ms" }}>
          <DevIdeaLogo
            variant="icon"
            height={40}
            className="text-neutral-700 animate-pulse"
            aria-label="Cargando Dev.Idea"
          />
        </div>
      </main>
    );
  } else if (currentUser) {
    content = <AppShell onSignOut={handleSignOut} />;
  } else {
    content = <LandingPage onSignIn={handleSignIn} />;
  }

  return (
    <>
      {content}
      <AuthTransition transition={transition} />
    </>
  );
}

const WELCOME_MS = 1400;
const LOGOUT_MS = 1300;

const firstName = (user) =>
  (user?.user_metadata?.full_name || user?.user_metadata?.name || "")
    .trim()
    .split(/\s+/)[0] || null;

function AppShell({ onSignOut }) {
  const currentStep = useDecisionStore((state) => state.currentStep);
  const mode = useDecisionStore((state) => state.blueprint.mode);
  const isRouteMapOpen = useDecisionStore((state) => state.isRouteMapOpen);
  const currentUser = useDecisionStore((state) => state.currentUser);
  const cloudProjectId = useDecisionStore((state) => state.cloudProjectId);
  const setCloudProjectId = useDecisionStore(
    (state) => state.setCloudProjectId,
  );
  const setIdeaQuota = useDecisionStore((state) => state.setIdeaQuota);
  const infoStationId = useDecisionStore((state) => state.infoStationId);
  const closeStationInfo = useDecisionStore((state) => state.closeStationInfo);
  const isCategoriesOpen = useDecisionStore((state) => state.isCategoriesOpen);
  const isPlanPanelOpen = useDecisionStore((state) => state.isPlanOpen);
  const closePlan = useDecisionStore((state) => state.closePlan);

  // Entrada de la página: navbar, logo dibujándose, Dev-i con "pop"...
  const intro = useIntro();

  // Capa de GPU solo mientras se animan (fija dejaba el texto borroso)
  const strobiLayer = useAnimatingLayer({ startActive: false });
  const stationNameLayer = useAnimatingLayer();
  const canvasLayer = useAnimatingLayer({ startActive: false });

  // Con sesión iniciada, cada cambio del mapa se guarda solo en Supabase
  useCloudAutosave();

  // Escape cierra la explicación de Dev-i o "Mi plano"
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

  // Al cerrar sesión, Dev-i se despide y la puerta vuelve a la portada
  const handleSignOut = () =>
    onSignOut(async () => {
      await signOut();
      setCloudProjectId(null);
      setIdeaQuota(null);
    });

  // Paneles laterales (Dev-i / mapa a la derecha, categorías a la izquierda):
  // al abrirse, el contenido se desliza y les deja sitio (animación de empuje).
  // La cabecera mantiene su altura, así el empuje es solo horizontal.
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const isWide = useMediaQuery("(min-width: 1280px)");
  const isInfoOpen = Boolean(infoStationId) && currentStep > 0;
  const isPlanOpen = isPlanPanelOpen && currentStep > 0;
  // Dev-i sale de la cabecera para ir a un panel ("¿Qué es?" o "Mi plano")
  const isStrobiAway = isInfoOpen || isPlanOpen;
  const sidePanelSpace =
    isStrobiAway && isWide
      ? INFO_PANEL_SPACE
      : isRouteMapOpen && currentStep > 0 && isDesktop
        ? MAP_PANEL_SPACE
        : 0;
  // Dev-i de la cabecera oculto o tapado por un panel: se congela
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
              ) : null}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Mapa lateral modal/panel */}
      <StationBreadcrumb />

      {/* Explicación "¿Qué es...?" con Dev-i al lado de la estación */}
      <StationInfoPanel />

      {/* 💡 Mi plano: lo decidido hasta ahora, con Dev-i */}
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
        {/* Cabecera: Dev-i y el nombre de la estación comparten la MISMA celda
            de la grilla, así su altura no cambia al abrir "¿Qué es?" y las
            cartas no pegan un tirón. Mientras Dev-i explica a un lado, en su
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
            {...strobiLayer}
            className={`w-full flex justify-center ${isStrobiAway ? "pointer-events-none" : ""}`}
            aria-hidden={isStrobiAway || undefined}
          >
            {/* En las estaciones Dev-i es más compacto para dejar sitio al mazo */}
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
                {...stationNameLayer}
                className="pointer-events-none select-none text-center"
              >
                <span className="block text-[10px] sm:text-xs font-mono uppercase tracking-[0.3em] text-neutral-600">
                  Estación {stationNumberInMode(currentStation, mode)}
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
              {...canvasLayer}
              className="w-full flex justify-center"
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
