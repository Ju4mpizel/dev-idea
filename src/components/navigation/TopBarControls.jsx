"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { ConfirmModal } from "@/components/modals/ConfirmModal";
import { syncProjectToCloud } from "@/services/projectService";
import {
  Map,
  ArrowLeft,
  ArrowRight,
  Trash2,
  Pause,
  RefreshCw,
  Cloud,
} from "lucide-react";

export function TopBarControls() {
  const isLoading = useDecisionStore((state) => state.isLoading);
  const cancelRequest = useDecisionStore((state) => state.cancelRequest);
  const clearAllMemory = useDecisionStore((state) => state.clearAllMemory);
  const currentStep = useDecisionStore((state) => state.currentStep);
  const previousStep = useDecisionStore((state) => state.previousStep);
  const goToStep = useDecisionStore((state) => state.goToStep);
  const generatedOptions = useDecisionStore((state) => state.generatedOptions);

  const currentUser = useDecisionStore((state) => state.currentUser);
  const cloudProjectId = useDecisionStore((state) => state.cloudProjectId);
  const setCloudProjectId = useDecisionStore(
    (state) => state.setCloudProjectId,
  );
  const blueprint = useDecisionStore((state) => state.blueprint);
  const isSyncingCloud = useDecisionStore((state) => state.isSyncingCloud);
  const setIsSyncingCloud = useDecisionStore(
    (state) => state.setIsSyncingCloud,
  );
  const setCompanion = useDecisionStore((state) => state.setCompanion);

  const isRouteMapOpen = useDecisionStore((state) => state.isRouteMapOpen);
  const toggleRouteMap = useDecisionStore((state) => state.toggleRouteMap);

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [justSynced, setJustSynced] = useState(false);

  // Calcular la fase máxima alcanzada
  const maxStepReached = Math.max(
    ...Object.keys(generatedOptions)
      .map(Number)
      .filter((n) => !isNaN(n)),
    blueprint.selectedName ? 1 : 0,
    blueprint.selectedStack ? 2 : 0,
    blueprint.selectedArchitecture ? 3 : 0,
    blueprint.selectedMethodology ? 4 : 0,
    blueprint.selectedDiagrams?.length > 0 ? 5 : 0,
    blueprint.selectedStyle ? 6 : 0,
    blueprint.selectedLayout ? 7 : 0,
    blueprint.selectedDeploy ? 8 : 0,
    blueprint.selectedAiEcosystem ? 9 : 0,
    currentStep,
  );

  // Se puede avanzar si no estamos en el paso final (10) y no estamos en la última fase alcanzada
  const canGoNext =
    currentStep > 0 && currentStep < maxStepReached && currentStep < 10;

  const handleCloudSync = async () => {
    if (!currentUser || isSyncingCloud) return;

    try {
      setIsSyncingCloud(true);
      const savedId = await syncProjectToCloud({
        projectId: cloudProjectId,
        blueprint,
        currentStep,
      });

      if (savedId) {
        setCloudProjectId(savedId);
        setJustSynced(true);
        setCompanion("proud", "¡Proyecto sincronizado en la nube con éxito!");
        setTimeout(() => setJustSynced(false), 3000);
      }
    } catch (err) {
      console.error(err);
      setCompanion(
        "uneasy-left",
        "Hubo un problema sincronizando con Supabase.",
      );
    } finally {
      setIsSyncingCloud(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-900/80 border border-neutral-800/90 backdrop-blur-md select-none shadow-lg">
        {/* Indicador de Carga */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-neutral-950 border border-emerald-500/40 text-emerald-400 shrink-0"
            >
              <RefreshCw className="w-3 h-3 animate-spin shrink-0 text-emerald-400" />
              <span className="text-[11px] font-mono whitespace-nowrap">
                Generando...
              </span>
              <button
                type="button"
                onClick={cancelRequest}
                title="Pausar generación"
                className="flex items-center gap-1 ml-1 px-1.5 py-0.5 rounded-md bg-neutral-800 hover:bg-red-950 text-neutral-300 hover:text-red-400 transition-colors cursor-pointer text-[10px] font-mono"
              >
                <Pause className="w-2.5 h-2.5 fill-current" />
                <span>Pausar</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Botón Sincronización Nube */}
        {currentUser && currentStep > 0 && (
          <button
            type="button"
            onClick={handleCloudSync}
            disabled={isSyncingCloud}
            title={justSynced ? "Guardado en Supabase" : "Guardar en la nube"}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              justSynced
                ? "bg-emerald-950/80 border border-emerald-700 text-emerald-300"
                : "hover:bg-neutral-800/80 text-neutral-300 hover:text-white"
            }`}
          >
            {isSyncingCloud ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
            ) : (
              <Cloud className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">
              {isSyncingCloud
                ? "Guardando..."
                : justSynced
                  ? "Guardado"
                  : "Nube"}
            </span>
          </button>
        )}

        {currentUser && currentStep > 0 && (
          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />
        )}

        {/* Ver / Ocultar Mapa */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={toggleRouteMap}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              isRouteMapOpen
                ? "bg-white text-neutral-950 font-semibold shadow-[0_0_15px_rgba(255,255,255,0.25)]"
                : "hover:bg-neutral-800/80 text-neutral-300 hover:text-white"
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>{isRouteMapOpen ? "Ocultar Mapa" : "Ver Mapa"}</span>
          </button>
        )}

        {currentStep > 0 && (
          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />
        )}

        {/* Botón: Paso anterior */}
        {currentStep > 0 && (
          <button
            type="button"
            onClick={previousStep}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Anterior</span>
          </button>
        )}

        {/* Botón: Paso siguiente (NUEVO) */}
        {canGoNext && (
          <button
            type="button"
            onClick={() => goToStep(currentStep + 1)}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl hover:bg-neutral-800/80 text-neutral-400 hover:text-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed text-xs font-mono transition-colors cursor-pointer"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}

        {currentStep > 0 && (
          <div className="w-[1px] h-4 bg-neutral-800 mx-0.5" />
        )}

        {/* Botón: Purgar Memoria */}
        <button
          type="button"
          onClick={() => setConfirmClearOpen(true)}
          title="Purgar memoria"
          className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-neutral-800/80 text-neutral-500 hover:text-red-400 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Purgar</span>
        </button>
      </div>

      <ConfirmModal
        isOpen={confirmClearOpen}
        onClose={() => setConfirmClearOpen(false)}
        onConfirm={clearAllMemory}
        variant="danger"
        tag="Memoria Volátil"
        title="¿Limpiar toda la memoria del proyecto?"
        description="Se descartarán las opciones calculadas en este borrador local. Si lo guardaste en la nube, seguirá disponible en tu cuenta."
        confirmText="Purgar Memoria"
        cancelText="Conservar"
      />
    </>
  );
}
