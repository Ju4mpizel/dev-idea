"use client";

import { useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked } from "@/hooks/useStationNavigation";
import { OptionStation } from "./OptionStation";
import { SelectionCard, CardSection } from "./SelectionCard";
import { PenTool, X } from "lucide-react";

export function NamingStation({ station, data, onNext, onGenerate }) {
  const savedName = useDecisionStore((s) => s.blueprint.selectedName) || "";
  const setCompanion = useDecisionStore((s) => s.setCompanion);
  const isLoading = useDecisionStore((s) => s.isLoading);
  const isLocked = useDecisionStore((s) => isStepLocked(s, station.stepNumber));

  const names = data?.names || [];
  const savedIsCustom =
    Boolean(savedName) && !names.some((n) => n.name === savedName);
  const [customDraft, setCustomDraft] = useState(null);
  const customValue = customDraft ?? (savedIsCustom ? savedName : "");
  const customName = customValue.trim();

  return (
    <OptionStation
      station={station}
      data={data}
      onNext={onNext}
      onGenerate={onGenerate}
      getLabel={(n) => n.name}
      matchesSaved={(n, saved) => n.name === saved}
      toDecision={(n) => n.name}
      // Si escribió su propio nombre, ese manda sobre las cartas
      overrideDecision={customName || null}
      confirmLabel={customName ? `Usar "${customName}"` : "Confirmar nombre"}
      selectMessage={(n) =>
        `"${n.name}" tiene buen golpe. Veamos qué construimos con él.`
      }
      renderCard={(n, { isSelected, isDimmed }) => (
        <SelectionCard
          title={n.name}
          subtitle={n.tagline}
          level="simple"
          levelLabel={n.style}
          isSelected={isSelected && !customName}
          isDimmed={isDimmed || Boolean(customName)}
        >
          {n.rationale && (
            <CardSection label="Por qué funciona">
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                {n.rationale}
              </p>
            </CardSection>
          )}
        </SelectionCard>
      )}
      afterDeck={
        <label
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-colors ${
            customName
              ? "bg-neutral-900 border-neutral-500"
              : "bg-neutral-950/60 border-neutral-800"
          } ${isLocked ? "opacity-40" : ""}`}
        >
          <PenTool
            className={`w-4 h-4 shrink-0 ${customName ? "text-white" : "text-neutral-500"}`}
          />
          <input
            type="text"
            disabled={isLocked || isLoading}
            value={customValue}
            onChange={(e) => {
              setCustomDraft(e.target.value);
              if (e.target.value.trim()) {
                setCompanion(
                  "proud",
                  `"${e.target.value.trim()}" me gusta. Un toque personal siempre le da identidad.`,
                );
              }
            }}
            placeholder="¿Ya tienes un nombre? Escríbelo aquí"
            maxLength={40}
            aria-label="Nombre propio del proyecto"
            className="flex-1 min-w-0 bg-transparent text-neutral-100 placeholder-neutral-500 text-xs sm:text-sm outline-none font-mono disabled:cursor-not-allowed"
          />
          {customValue && !isLocked && (
            <button
              type="button"
              onClick={() => setCustomDraft("")}
              aria-label="Borrar nombre propio"
              className="p-1 rounded-md text-neutral-500 hover:text-white hover:bg-neutral-800 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </label>
      }
      rewriteDescription="Se desbloquearán las opciones de nombre. Todo lo calculado después se descartará."
    />
  );
}
