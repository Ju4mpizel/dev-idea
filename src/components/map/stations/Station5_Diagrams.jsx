"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { TopBarControls } from "@/components/navigation/TopBarControls";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import {
  Lock,
  RotateCcw,
  ArrowRight,
  Database,
  FolderTree,
  Users,
  GitCommitHorizontal,
  Cloud,
  Workflow,
  Eye,
  X,
  Code2,
  Check,
} from "lucide-react";

function getDiagramTypeIcon(type = "") {
  switch (type.toLowerCase()) {
    case "use-case":
      return <Users className="w-3.5 h-3.5 text-sky-400 shrink-0" />;
    case "components":
      return <FolderTree className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
    case "erd":
      return <Database className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
    case "sequence":
      return (
        <GitCommitHorizontal className="w-3.5 h-3.5 text-purple-400 shrink-0" />
      );
    case "cloud":
      return <Cloud className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
    default:
      return <Workflow className="w-3.5 h-3.5 text-neutral-400 shrink-0" />;
  }
}

export function Station5_Diagrams({ data, onNext }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const generatedOptions = useDecisionStore((state) => state.generatedOptions);
  const currentStep = useDecisionStore((state) => state.currentStep);
  const goToStep = useDecisionStore((state) => state.goToStep);
  const truncateWorkflowFrom = useDecisionStore(
    (state) => state.truncateWorkflowFrom,
  );

  const [confirmRewriteOpen, setConfirmRewriteOpen] = useState(false);
  const [previewSample, setPreviewSample] = useState(null);

  const highestStep = Math.max(
    ...Object.keys(generatedOptions)
      .map(Number)
      .filter((n) => !isNaN(n)),
    currentStep,
    blueprint.selectedStyle ? 6 : 5,
    5,
  );

  const isLockedHistory = Boolean(
    highestStep > 5 ||
    generatedOptions[6] ||
    generatedOptions["morphism"] ||
    blueprint.selectedStyle,
  );

  const options = data?.options || [];
  const [selectedId, setSelectedId] = useState(
    blueprint.selectedDiagrams?.[0]?.id || options[0]?.id || "",
  );

  useEffect(() => {
    if (!selectedId && options.length > 0) {
      setSelectedId(blueprint.selectedDiagrams?.[0]?.id || options[0]?.id);
    }
  }, [options, blueprint.selectedDiagrams, selectedId]);

  const selectedOption =
    options.find((o) => o.id === selectedId) ||
    blueprint.selectedDiagrams?.[0] ||
    options[0] ||
    null;

  const handleSelect = (option) => {
    if (isLockedHistory) return;
    setSelectedId(option.id);
    updateBlueprint({ selectedDiagrams: [option] });
    setCompanion(
      "curious",
      `Paquete "${option.title}" seleccionado. Tendrás los diagramas precisos para documentar y defender tu proyecto.`,
    );
  };

  const handleConfirm = () => {
    if (isLockedHistory) {
      goToStep(highestStep);
      return;
    }

    if (!selectedOption) return;
    updateBlueprint({ selectedDiagrams: [selectedOption] });
    onNext({ selectedDiagrams: [selectedOption] });
  };

  const handleRewriteConfirm = () => {
    truncateWorkflowFrom(5);
    setConfirmRewriteOpen(false);
  };

  const levelStyles = {
    simple: {
      badge: "bg-sky-950/80 border-sky-800 text-sky-400",
      borderSelected:
        "border-sky-400 ring-1 ring-sky-400/80 shadow-[0_0_20px_rgba(56,189,248,0.15)]",
      checkSelected: "bg-sky-400 border-sky-400 text-neutral-950",
      accentDot: "bg-sky-400",
    },
    medium: {
      badge: "bg-amber-950/80 border-amber-800 text-amber-400",
      borderSelected:
        "border-amber-400 ring-1 ring-amber-400/80 shadow-[0_0_20px_rgba(251,191,36,0.15)]",
      checkSelected: "bg-amber-400 border-amber-400 text-neutral-950",
      accentDot: "bg-amber-400",
    },
    advanced: {
      badge: "bg-rose-950/80 border-rose-800 text-rose-400",
      borderSelected:
        "border-rose-400 ring-1 ring-rose-400/80 shadow-[0_0_20px_rgba(244,63,94,0.15)]",
      checkSelected: "bg-rose-400 border-rose-400 text-neutral-950",
      accentDot: "bg-rose-400",
    },
  };

  return (
    <div className="w-full flex flex-col gap-4 sm:gap-6">
      {/* Cabecera */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <span>Estación 5 · Diagramas Dinámicos IA</span>
            {isLockedHistory && (
              <span className="text-[9px] sm:text-[10px] px-2 py-0.5 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 font-mono flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Modo Consulta
              </span>
            )}
          </span>
          <h2 className="text-lg sm:text-2xl font-bold text-white tracking-tight mt-0.5">
            Paquetes de diagramación técnica
          </h2>
        </div>

        <TopBarControls />
      </div>

      {/* Leyenda de Tipos de Diagramas */}
      <div className="flex items-center gap-3 sm:gap-4 px-3 py-2 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-[10px] sm:text-[11px] font-mono flex-wrap">
        <span className="text-neutral-500">Tipos de Diagramas:</span>
        <div className="flex items-center gap-1 text-sky-400">
          <Users className="w-3.5 h-3.5" /> <span>Casos de Uso (UML)</span>
        </div>
        <div className="flex items-center gap-1 text-amber-400">
          <FolderTree className="w-3.5 h-3.5" /> <span>Componentes</span>
        </div>
        <div className="flex items-center gap-1 text-emerald-400">
          <Database className="w-3.5 h-3.5" />{" "}
          <span>Entidad-Relación (BD)</span>
        </div>
        <div className="flex items-center gap-1 text-purple-400">
          <GitCommitHorizontal className="w-3.5 h-3.5" /> <span>Secuencia</span>
        </div>
      </div>

      {/* Skeletons Shimmer durante carga */}
      {isLoading && options.length === 0 ? (
        <SkeletonGrid
          count={3}
          columns="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          height="h-[310px]"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {options.map((opt) => {
            const isSelected = selectedOption?.id === opt.id;
            const isDimmed = isLockedHistory && !isSelected;
            const style = levelStyles[opt.level] || levelStyles.medium;

            return (
              <motion.div
                key={opt.id}
                whileHover={!isLockedHistory ? { y: -2 } : {}}
                onClick={() => handleSelect(opt)}
                className={`w-full relative p-4 sm:p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between select-none ${
                  isSelected
                    ? `bg-neutral-900/90 ${style.borderSelected}`
                    : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40"
                } ${isDimmed ? "opacity-35 grayscale pointer-events-none" : "opacity-100"}`}
              >
                <div>
                  {/* Tag y Checkbox */}
                  <div className="flex items-start justify-between gap-2.5 sm:gap-3 mb-2 sm:mb-2.5">
                    <span
                      className={`text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-md border flex items-center gap-1.5 ${style.badge}`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 ${style.accentDot}`}
                      />
                      <span className="truncate max-w-[140px] sm:max-w-none">
                        {opt.tag || opt.level.toUpperCase()}
                      </span>
                    </span>

                    <div
                      className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? style.checkSelected
                          : "border-neutral-700 bg-neutral-900 text-transparent"
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]" />
                    </div>
                  </div>

                  <h3 className="font-bold text-white text-sm sm:text-base tracking-tight mb-1 truncate">
                    {opt.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-400 leading-relaxed mb-3 sm:mb-4">
                    {opt.summary}
                  </p>

                  {/* Lista de Diagramas Recomendados */}
                  <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                      Diagramas incluidos:
                    </span>
                    {(opt.diagrams || []).map((diag, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2 p-1.5 sm:p-2 rounded-xl bg-neutral-900/70 border border-neutral-800/60 text-xs"
                      >
                        <div className="mt-0.5">
                          {getDiagramTypeIcon(diag.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[11px] sm:text-xs text-neutral-200 truncate">
                            {diag.name}
                          </p>
                          {diag.description && (
                            <p className="text-[10px] sm:text-[11px] text-neutral-400 line-clamp-1">
                              {diag.description}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  {/* Pros y Cons */}
                  {(opt.pros || opt.cons) && (
                    <div className="pt-2 sm:pt-2.5 border-t border-neutral-900/80 text-[10px] sm:text-[11px] space-y-1 mb-2.5 sm:mb-3">
                      {opt.pros && (
                        <div className="text-emerald-400/90 flex items-baseline gap-1.5">
                          <span className="font-mono text-emerald-500 font-bold shrink-0">
                            +
                          </span>
                          <span className="leading-snug">{opt.pros}</span>
                        </div>
                      )}
                      {opt.cons && (
                        <div className="text-neutral-400 flex items-baseline gap-1.5">
                          <span className="font-mono text-neutral-500 font-bold shrink-0">
                            -
                          </span>
                          <span className="leading-snug">{opt.cons}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Previsualización rápida */}
                  {opt.sampleMermaid && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewSample(opt);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl border border-neutral-800/80 bg-neutral-900/50 hover:bg-neutral-800 text-[10px] sm:text-[11px] font-mono text-neutral-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Ver Ejemplo en Mermaid</span>
                    </button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Botones Inferiores Responsivos */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3 pt-1">
        <div className="w-full sm:w-auto">
          {(isLockedHistory ||
            (blueprint.selectedDiagrams &&
              blueprint.selectedDiagrams.length > 0)) && (
            <button
              type="button"
              onClick={() => setConfirmRewriteOpen(true)}
              className="w-full sm:w-auto px-4 py-2 sm:py-2.5 rounded-xl border border-amber-500/40 bg-amber-950/20 hover:bg-amber-900/30 text-amber-300 hover:text-amber-200 text-xs font-mono flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reescribir desde aquí</span>
            </button>
          )}
        </div>

        <div className="w-full sm:w-auto flex items-center gap-2">
          <button
            type="button"
            disabled={!selectedOption || isLoading}
            onClick={handleConfirm}
            className="w-full sm:w-auto px-5 sm:px-6 py-2.5 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed font-medium text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg active:scale-95"
          >
            {isLockedHistory ? (
              <>
                <span>Volver al Flujo (Fase {highestStep})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>Confirmar Paquete de Diagramas</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Modal de Ejemplo Mermaid Responsivo */}
      <AnimatePresence>
        {previewSample && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-4 sm:p-5 rounded-2xl bg-neutral-950 border border-neutral-800 flex flex-col gap-3 sm:gap-4 shadow-2xl max-h-[90dvh] overflow-y-auto"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-bold text-white truncate">
                    {previewSample.title}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewSample(null)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-900 transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-[11px] sm:text-xs text-neutral-400">
                Sintaxis Mermaid generada para este esquema:
              </p>

              <div className="p-3 rounded-xl bg-neutral-900/90 border border-neutral-800 font-mono text-[11px] sm:text-xs text-sky-300 whitespace-pre overflow-x-auto">
                {previewSample.sampleMermaid}
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setPreviewSample(null)}
                  className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs font-mono text-neutral-200 transition-colors cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmRewriteOpen}
        onClose={() => setConfirmRewriteOpen(false)}
        onConfirm={handleRewriteConfirm}
        variant="danger"
        tag="Reescritura de Flujo"
        title="¿Cambiar el paquete de diagramas?"
        description="Se desbloqueará la selección de diagramas. Los estilos visuales y layouts calculados más adelante se descartarán."
        confirmText="Sí, desbloquear y reescribir"
        cancelText="Conservar como está"
      />
    </div>
  );
}
