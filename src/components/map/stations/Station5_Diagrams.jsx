"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked, useOptionSelection } from "@/hooks/useStationNavigation";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { SelectionCard } from "./SelectionCard";
import { StationShell } from "./StationShell";
import {
  Database,
  FolderTree,
  Users,
  GitCommitHorizontal,
  Cloud,
  Workflow,
  Eye,
  X,
  Code2,
} from "lucide-react";

const STEP = 5;

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

function DiagramLegend() {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-3 py-2 rounded-xl bg-neutral-900/40 border border-neutral-800/80 text-[10px] sm:text-[11px] font-mono flex-wrap">
      <span className="text-neutral-500">Tipos de Diagramas:</span>
      <div className="flex items-center gap-1 text-sky-400">
        <Users className="w-3.5 h-3.5" /> <span>Casos de Uso (UML)</span>
      </div>
      <div className="flex items-center gap-1 text-amber-400">
        <FolderTree className="w-3.5 h-3.5" /> <span>Componentes</span>
      </div>
      <div className="flex items-center gap-1 text-emerald-400">
        <Database className="w-3.5 h-3.5" /> <span>Entidad-Relación (BD)</span>
      </div>
      <div className="flex items-center gap-1 text-purple-400">
        <GitCommitHorizontal className="w-3.5 h-3.5" /> <span>Secuencia</span>
      </div>
    </div>
  );
}

export function Station5_Diagrams({ data, onNext }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, STEP));

  const [previewSample, setPreviewSample] = useState(null);

  const options = data?.options || [];
  const { selectedOption, selectOption } = useOptionSelection(
    options,
    blueprint.selectedDiagrams?.[0],
  );

  const handleSelect = (option) => {
    if (isLockedHistory) return;
    selectOption(option);
    setCompanion(
      "curious",
      `Paquete "${option.title}" seleccionado. Tendrás los diagramas precisos para documentar y defender tu proyecto.`,
    );
  };

  const handleConfirm = () => {
    if (!selectedOption) return;
    updateBlueprint({ selectedDiagrams: [selectedOption] });
    onNext({ selectedDiagrams: [selectedOption] });
  };

  return (
    <StationShell
      stepNumber={STEP}
      eyebrow="Diagramas Dinámicos IA"
      title="Paquetes de diagramación técnica"
      legend={<DiagramLegend />}
      confirmLabel="Confirmar Paquete de Diagramas"
      onConfirm={handleConfirm}
      confirmDisabled={!selectedOption}
      rewriteTitle="¿Cambiar el paquete de diagramas?"
      rewriteDescription="Se desbloqueará la selección de diagramas. Los estilos visuales y layouts calculados más adelante se descartarán."
    >
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

            return (
              <SelectionCard
                key={opt.id}
                title={opt.title}
                subtitle={opt.summary}
                tag={opt.tag}
                pros={opt.pros}
                cons={opt.cons}
                level={opt.level}
                isSelected={isSelected}
                isDimmed={isLockedHistory && !isSelected}
                onClick={() => handleSelect(opt)}
                footer={
                  opt.sampleMermaid ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewSample(opt);
                      }}
                      className="w-full py-1.5 px-3 rounded-xl border border-neutral-800/80 bg-neutral-900/50 hover:bg-neutral-800 text-[10px] sm:text-[11px] font-mono text-neutral-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer pointer-events-auto"
                    >
                      <Eye className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                      <span>Ver Ejemplo en Mermaid</span>
                    </button>
                  ) : null
                }
              >
                {/* Lista de Diagramas Recomendados */}
                <div className="space-y-1.5 sm:space-y-2 mb-3 sm:mb-4">
                  <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                    Diagramas incluidos:
                  </span>
                  {(opt.diagrams || []).map((diag, idx) => (
                    <div
                      key={`${diag.type}-${idx}`}
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
              </SelectionCard>
            );
          })}
        </div>
      )}

      {/* Modal de Ejemplo Mermaid: el hijo directo de AnimatePresence es un
          motion.div para que la animación de salida sí se ejecute */}
      <AnimatePresence>
        {previewSample && (
          <motion.div
            key="mermaid-preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPreviewSample(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
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
          </motion.div>
        )}
      </AnimatePresence>
    </StationShell>
  );
}
