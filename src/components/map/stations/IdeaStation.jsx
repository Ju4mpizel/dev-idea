"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import {
  STROBI_RESUME_QUOTES,
  STROBI_DISCARD_QUOTES,
} from "@/data/strobiQuotes";
import {
  fetchUserProjects,
  deleteProjectFromCloud,
} from "@/services/projectService";
import { SkeletonFormStation0 } from "@/components/ui/SkeletonCard";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { Cloud, HardDrive, Trash2 } from "lucide-react";
import { useIntro, introClass, introDelay } from "@/hooks/useIntro";
import { TestProjectToggle } from "@/components/dev/TestProjectToggle";

export function IdeaStation({ onStartNew, onResumeSaved, onLoadTestProject }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const currentIdeaDraft = useDecisionStore((state) => state.currentIdeaDraft);
  const setCurrentIdeaDraft = useDecisionStore(
    (state) => state.setCurrentIdeaDraft,
  );
  const isMapCardActive = useDecisionStore((state) => state.isMapCardActive);
  const toggleMapCard = useDecisionStore((state) => state.toggleMapCard);
  const clearAllMemory = useDecisionStore((state) => state.clearAllMemory);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const generatedOptions = useDecisionStore((state) => state.generatedOptions);
  const setCompanion = useDecisionStore((state) => state.setCompanion);

  const currentUser = useDecisionStore((state) => state.currentUser);
  const loadProjectFromCloud = useDecisionStore(
    (state) => state.loadProjectFromCloud,
  );
  const cloudProjectId = useDecisionStore((state) => state.cloudProjectId);
  const setCloudProjectId = useDecisionStore(
    (state) => state.setCloudProjectId,
  );

  // Entrada de la página: la tarjeta sube, su borde se dibuja y el contenido
  // aparece en cascada (solo al abrir la página, no al volver desde el mapa)
  const intro = useIntro();

  const [cloudProjects, setCloudProjects] = useState([]);
  const [activeTab, setActiveTab] = useState("local");
  // Proyecto de la nube pendiente de confirmar su borrado
  const [projectToDelete, setProjectToDelete] = useState(null);
  const [confirmDiscardOpen, setConfirmDiscardOpen] = useState(false);

  const hasSavedBlueprint = Boolean(
    blueprint?.idea && (blueprint?.selectedName || generatedOptions.naming),
  );

  // Sin sesión se fuerza la vista local (derivado, sin setState en el efecto)
  const visibleTab = currentUser ? activeTab : "local";
  const visibleCloudProjects = currentUser ? cloudProjects : [];

  useEffect(() => {
    if (!currentUser) return;
    let cancelled = false;
    fetchUserProjects()
      .then((projects) => {
        if (!cancelled) setCloudProjects(projects);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [currentUser]);

  useEffect(() => {
    if (!isMapCardActive) {
      setCompanion(
        "idle",
        "Cuéntame qué quieres armar y calibramos el camino.",
      );
    }
  }, [isMapCardActive, setCompanion]);

  const handleToggleCard = () => {
    const willBeActive = !isMapCardActive;
    toggleMapCard();

    if (willBeActive) {
      const randomResume =
        STROBI_RESUME_QUOTES[
          Math.floor(Math.random() * STROBI_RESUME_QUOTES.length)
        ];
      setCompanion(randomResume.mood, randomResume.quote);
    } else {
      setCompanion(
        "idle",
        "Cuéntame qué quieres armar y calibramos el camino.",
      );
    }
  };

  const handleDiscardLocal = () => {
    clearAllMemory();
    const randomDiscard =
      STROBI_DISCARD_QUOTES[
        Math.floor(Math.random() * STROBI_DISCARD_QUOTES.length)
      ];
    setCompanion(randomDiscard.mood, randomDiscard.quote);
  };

  const handleLoadCloudProject = (project) => {
    const stepToResume = loadProjectFromCloud(project);
    onResumeSaved(stepToResume);
  };

  const handleDeleteCloudProject = async () => {
    const project = projectToDelete;
    setProjectToDelete(null);
    if (!project) return;
    try {
      await deleteProjectFromCloud(project.id);
      setCloudProjects((prev) => prev.filter((p) => p.id !== project.id));
      // Si era el mapa abierto, también se limpia en local: si no, el
      // autoguardado lo volvería a subir como un proyecto nuevo.
      if (project.id === cloudProjectId) {
        setCloudProjectId(null);
        clearAllMemory();
      }
      setCompanion("celebrate", `"${project.title}" eliminado de la nube.`);
    } catch (err) {
      console.error(err);
      setCompanion("uneasy-left", "No pude eliminar el proyecto. Intenta de nuevo.");
    }
  };

  const handleSubmit = () => {
    if (isMapCardActive && hasSavedBlueprint) {
      onResumeSaved();
    } else {
      if (!currentIdeaDraft.trim()) return;
      onStartNew(currentIdeaDraft.trim(), blueprint.context || "startup");
    }
  };

  if (isLoading) {
    return <SkeletonFormStation0 />;
  }

  const showSidebar =
    hasSavedBlueprint || (currentUser && visibleCloudProjects.length > 0);

  return (
    <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-start">
      {/* Formulario Principal */}
      <div
        style={introDelay(intro, 600)}
        className={`${
          showSidebar ? "md:col-span-2" : "md:col-span-3 max-w-xl mx-auto"
        } relative w-full p-4 sm:p-7 rounded-3xl bg-neutral-900/40 border border-neutral-800/80 backdrop-blur-xl shadow-2xl flex flex-col gap-4 sm:gap-6 transition-[border-color,box-shadow] duration-300 ${introClass(intro, "intro-rise")}`}
      >
        {/* Línea que recorre el borde (la tarjeta "se dibuja") */}
        {intro && (
          <svg
            aria-hidden="true"
            className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
          >
            <rect
              x="0.75"
              y="0.75"
              rx="24"
              pathLength="1"
              fill="none"
              stroke="rgba(255,255,255,0.55)"
              strokeWidth="1.5"
              className="intro-trace"
              style={{
                width: "calc(100% - 1.5px)",
                height: "calc(100% - 1.5px)",
                "--d": "700ms",
              }}
            />
          </svg>
        )}

        <div>
          <span
            style={introDelay(intro, 780)}
            className={`block text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500 ${introClass(intro, "intro-rise")}`}
          >
            Estación 0 · Entrada & Contexto
          </span>
          <h2
            style={introDelay(intro, 850)}
            className={`text-lg sm:text-2xl font-bold text-white tracking-tight mt-0.5 sm:mt-1 ${introClass(intro, "intro-rise")}`}
          >
            ¿Qué software tienes en mente?
          </h2>
          <p
            style={introDelay(intro, 920)}
            className={`text-[11px] sm:text-xs text-neutral-400 mt-1 ${introClass(intro, "intro-rise")}`}
          >
            Escribe una descripción corta para calibrar los requerimientos
            técnicos.
          </p>
        </div>

        <textarea
          rows={2}
          value={currentIdeaDraft}
          onChange={(e) => {
            setCurrentIdeaDraft(e.target.value);
            if (isMapCardActive) {
              toggleMapCard();
              setCompanion(
                "idle",
                "Cuéntame qué quieres armar y calibramos el camino.",
              );
            }
          }}
          placeholder="Ej. Sistema de reservas para una pesquería local con pagos QR..."
          style={introDelay(intro, 1000)}
          className={`${introClass(intro, "intro-rise")} w-full px-3.5 sm:px-4 py-2.5 sm:py-3.5 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs sm:text-sm outline-none focus:border-neutral-600 transition-colors font-sans resize-none`}
        />

        {/* Selector de Contexto */}
        <div>
          <span
            style={introDelay(intro, 1080)}
            className={`text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-2 ${introClass(intro, "intro-rise")}`}
          >
            Propósito del proyecto
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              {
                id: "academic",
                title: "Académico / U",
                desc: "Estructurado y fácil de defender",
              },
              {
                id: "startup",
                title: "Startup / Trabajo",
                desc: "Escalable y enfocado a producto",
              },
              {
                id: "personal",
                title: "Personal / MVP",
                desc: "Rápido, ligero y experimental",
              },
            ].map((ctx, i) => (
              <button
                key={ctx.id}
                type="button"
                onClick={() => updateBlueprint({ context: ctx.id })}
                style={introDelay(intro, 1140 + i * 80)}
                className={`${introClass(intro, "intro-rise")} p-2.5 sm:p-3 rounded-xl border text-left transition-[background-color,border-color,color] cursor-pointer ${
                  blueprint.context === ctx.id
                    ? "bg-neutral-800/90 border-neutral-500 text-white"
                    : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800 text-neutral-400"
                }`}
              >
                <div className="font-medium text-[11px] sm:text-xs text-neutral-200">
                  {ctx.title}
                </div>
                <div className="text-[9px] sm:text-[10px] text-neutral-500 mt-0.5">
                  {ctx.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        <div
          style={introDelay(intro, 1400)}
          className={`flex justify-end pt-1 ${introClass(intro, "intro-rise")}`}
        >
          <button
            type="button"
            disabled={
              isLoading || (!isMapCardActive && !currentIdeaDraft.trim())
            }
            onClick={handleSubmit}
            className={`w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95 ${
              isMapCardActive && hasSavedBlueprint
                ? "bg-emerald-400 text-neutral-950 hover:bg-emerald-300 shadow-[0_0_20px_rgba(52,211,153,0.3)]"
                : "bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            <span>
              {isLoading
                ? "Calibrando..."
                : isMapCardActive && hasSavedBlueprint
                  ? "Continuar Mapa Guardado →"
                  : "Comenzar Nuevo Mapa →"}
            </span>
          </button>
        </div>
      </div>

      {/* Tarjeta Lateral de Proyectos */}
      <AnimatePresence>
        {showSidebar && (
          <motion.aside
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.25 }}
            className="w-full flex flex-col gap-2.5 sm:gap-3"
          >
            <AnimatePresence>
              {currentUser && (
                <div className="flex items-center gap-1 p-1 bg-neutral-900/60 border border-neutral-800/80 rounded-xl text-xs font-mono">
                  <button
                    type="button"
                    onClick={() => setActiveTab("local")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      visibleTab === "local"
                        ? "bg-neutral-800 text-white font-medium"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <HardDrive className="w-3 h-3 shrink-0" />
                    <span>Local</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("cloud")}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1 rounded-lg transition-colors cursor-pointer ${
                      visibleTab === "cloud"
                        ? "bg-neutral-800 text-white font-medium"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <Cloud className="w-3 h-3 shrink-0" />
                    <span>Nube ({visibleCloudProjects.length})</span>
                  </button>
                </div>
              )}
            </AnimatePresence>

            {/* Pestaña Local */}
            {visibleTab === "local" && hasSavedBlueprint && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleToggleCard}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none backdrop-blur-md flex flex-col justify-between ${
                  isMapCardActive
                    ? "bg-neutral-900/90 border-emerald-400/80 shadow-[0_0_25px_rgba(52,211,153,0.15)] ring-1 ring-emerald-400/50"
                    : "bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 opacity-70 hover:opacity-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-300">
                      {blueprint.selectedName || "Borrador"}
                    </span>
                    <div
                      className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center transition-colors ${
                        isMapCardActive
                          ? "border-emerald-400 bg-emerald-400"
                          : "border-neutral-700"
                      }`}
                    >
                      {isMapCardActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                      )}
                    </div>
                  </div>

                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-100 line-clamp-2">
                    &ldquo;{blueprint.idea}&rdquo;
                  </h4>
                  <p className="text-[10px] sm:text-[11px] text-neutral-400 mt-1 font-mono">
                    Stack: {blueprint.selectedStack?.title || "Pendiente"}
                  </p>
                </div>

                <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex items-center justify-between text-[10px] sm:text-[11px] font-mono">
                  <span
                    className={
                      isMapCardActive
                        ? "text-emerald-400 font-medium"
                        : "text-neutral-500"
                    }
                  >
                    {isMapCardActive ? "● Activado" : "○ Click para activar"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDiscardOpen(true);
                    }}
                    className="text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                  >
                    Descartar
                  </button>
                </div>
              </motion.div>
            )}

            {/* Pestaña Nube */}
            {visibleTab === "cloud" && (
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto pr-1">
                {visibleCloudProjects.length === 0 ? (
                  <div className="p-4 rounded-2xl border border-neutral-900 bg-neutral-950/40 text-center text-[11px] text-neutral-500 font-mono">
                    No tienes proyectos guardados en la nube aún.
                  </div>
                ) : (
                  visibleCloudProjects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => handleLoadCloudProject(proj)}
                      className="p-3 sm:p-4 rounded-xl border border-neutral-800/80 hover:border-neutral-700 bg-neutral-900/60 hover:bg-neutral-900/90 transition-all cursor-pointer select-none flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[11px] font-bold text-neutral-200 truncate pr-2">
                          {proj.title}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectToDelete(proj);
                          }}
                          className="text-neutral-500 hover:text-red-400 transition-colors p-0.5 cursor-pointer shrink-0"
                          title="Eliminar de la nube"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-[9px] sm:text-[10px] text-neutral-400 font-mono">
                        Fase {proj.current_step} ·{" "}
                        {new Date(proj.updated_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Herramienta de desarrollo: solo cuentas autorizadas en el servidor */}
      {onLoadTestProject && <TestProjectToggle onLoad={onLoadTestProject} />}

      <ConfirmModal
        isOpen={Boolean(projectToDelete)}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteCloudProject}
        variant="danger"
        tag="Eliminar de la nube"
        title={`¿Eliminar "${projectToDelete?.title || "este proyecto"}"?`}
        description={
          projectToDelete?.id === cloudProjectId
            ? "Se borrará de tu cuenta para siempre y, como es el mapa que tienes abierto, también se limpiará de la memoria local."
            : "Se borrará de tu cuenta para siempre. Esta acción no se puede deshacer."
        }
        confirmText="Sí, eliminar"
        cancelText="Conservar"
      />

      <ConfirmModal
        isOpen={confirmDiscardOpen}
        onClose={() => setConfirmDiscardOpen(false)}
        onConfirm={handleDiscardLocal}
        variant="danger"
        tag="Memoria local"
        title="¿Descartar el mapa guardado en este navegador?"
        description={
          cloudProjectId
            ? "Se borrará la copia local. La copia en la nube seguirá en tu cuenta."
            : "Se borrará el mapa y sus cartas. No está guardado en la nube, así que no se podrá recuperar."
        }
        confirmText="Descartar"
        cancelText="Conservar"
      />
    </div>
  );
}
