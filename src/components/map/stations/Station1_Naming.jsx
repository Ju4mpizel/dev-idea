"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked } from "@/hooks/useStationNavigation";
import { SkeletonGrid } from "@/components/ui/SkeletonCard";
import { StationShell, staggerContainer } from "./StationShell";
import { PenTool } from "lucide-react";

const STEP = 1;

export function Station1_Naming({ data, onNext }) {
  const blueprint = useDecisionStore((state) => state.blueprint);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, STEP));

  const names = data?.names || [];
  const savedName = blueprint.selectedName || "";
  const savedIsCustom =
    Boolean(savedName) && !names.some((n) => n.name === savedName);

  // `null` = el usuario aún no tocó nada; el valor efectivo se deriva en cada render
  const [pickedName, setPickedName] = useState(null);
  const [customDraft, setCustomDraft] = useState(null);

  const customName = customDraft ?? (savedIsCustom ? savedName : "");
  const isCustomActive = Boolean(customName.trim());
  const selectedName = pickedName ?? (savedIsCustom ? "" : savedName) ?? "";
  const effectiveSelected = selectedName || names[0]?.name || "";

  const handleSelectCard = (item) => {
    if (isLockedHistory) return;
    setCustomDraft("");
    setPickedName(item.name);
    setCompanion(
      "thinking",
      `"${item.name}" tiene buen golpe. Veamos qué arquitectura le damos.`,
    );
  };

  const handleCustomNameChange = (val) => {
    if (isLockedHistory) return;
    setCustomDraft(val);
    if (val.trim()) {
      setCompanion(
        "proud",
        `"${val.trim()}" me gusta. Un toque personal siempre le da identidad.`,
      );
    }
  };

  const finalName = (customName.trim() || effectiveSelected).trim();

  const handleConfirm = () => {
    if (!finalName) return;
    updateBlueprint({ selectedName: finalName });
    onNext({ selectedName: finalName });
  };

  return (
    <StationShell
      stepNumber={STEP}
      eyebrow="Identidad & Concepto"
      title="Bautiza tu proyecto de software"
      confirmLabel={isCustomActive ? "Usar este Nombre" : "Confirmar Nombre"}
      onConfirm={handleConfirm}
      confirmDisabled={!finalName}
      rewriteTitle="¿Cambiar el nombre del proyecto?"
      rewriteDescription="Se desbloquearán todas las opciones de nombre. El stack, la arquitectura y los pasos calculados posteriormente se descartarán."
    >
      {isLoading && names.length === 0 ? (
        <SkeletonGrid
          count={4}
          columns="grid-cols-1 sm:grid-cols-2"
          height="h-[155px]"
        />
      ) : (
        <motion.div
          variants={staggerContainer(0.08)}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4"
        >
          {names.map((item) => {
            const isSelected =
              !isCustomActive && effectiveSelected === item.name;
            const isDimmed = isLockedHistory && !isSelected;

            return (
              <motion.div
                key={item.id || item.name}
                onClick={() => handleSelectCard(item)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all duration-300 select-none backdrop-blur-md flex flex-col justify-between ${
                  isSelected
                    ? "bg-neutral-900/90 border-neutral-400 shadow-xl ring-1 ring-neutral-400"
                    : isDimmed
                      ? "bg-neutral-950/40 border-neutral-900/50 opacity-35 grayscale cursor-not-allowed"
                      : "bg-neutral-950/70 border-neutral-900 hover:border-neutral-800 hover:bg-neutral-900/40 cursor-pointer"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                    <span className="text-[9px] sm:text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">
                      {item.style}
                    </span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-white bg-white"
                          : "border-neutral-700"
                      }`}
                    >
                      {isSelected && (
                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-950" />
                      )}
                    </div>
                  </div>

                  <h3
                    className={`text-base sm:text-lg font-bold truncate ${
                      isDimmed ? "text-neutral-500" : "text-neutral-100"
                    }`}
                  >
                    {item.name}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-1 line-clamp-2">
                    {item.tagline}
                  </p>
                </div>

                <p className="text-[10px] sm:text-[11px] font-mono text-neutral-500 mt-3 pt-2 sm:mt-4 sm:pt-3 border-t border-neutral-900 line-clamp-1">
                  {item.rationale}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Recuadro de Nombre Personalizado */}
      <div
        className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 backdrop-blur-md ${
          isCustomActive
            ? "bg-neutral-900/90 border-neutral-400 ring-1 ring-neutral-400 shadow-xl"
            : isLockedHistory
              ? "bg-neutral-950/40 border-neutral-900/50 opacity-40 grayscale"
              : "bg-neutral-950/60 border-neutral-900 hover:border-neutral-800"
        }`}
      >
        <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto">
          <div
            className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl border flex items-center justify-center shrink-0 transition-colors ${
              isCustomActive
                ? "bg-white text-neutral-950 border-white"
                : "bg-neutral-900 border-neutral-800 text-neutral-400"
            }`}
          >
            <PenTool className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-200">
                ¿Tienes tu propio nombre?
              </span>
              <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-neutral-800/80 text-neutral-400 border border-neutral-700/60">
                Custom
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-neutral-500">
              Usa tu marca o nombre original en el blueprint técnico.
            </p>
          </div>
        </div>

        <div className="w-full sm:w-64">
          <input
            type="text"
            disabled={isLockedHistory || isLoading}
            value={customName}
            onChange={(e) => handleCustomNameChange(e.target.value)}
            placeholder="Ej. DevFlow, AcuaLog..."
            className="w-full px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 text-neutral-100 placeholder-neutral-600 text-xs outline-none focus:border-neutral-500 transition-colors font-mono disabled:opacity-40 disabled:cursor-not-allowed"
          />
        </div>
      </div>
    </StationShell>
  );
}
