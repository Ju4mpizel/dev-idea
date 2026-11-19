"use client";

import { useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked } from "@/hooks/useStationNavigation";
import { TechIcon } from "@/components/ui/TechChip";
import { getTechIcon } from "@/lib/techIcons";
import { OptionStation } from "./OptionStation";
import { SelectionCard } from "./SelectionCard";
import { DevEnvironmentPanel } from "./DevEnvironmentPanel";
import { getManager, resolvePreferences } from "@/data/devPreferences";

/** Fila de logos grandes del stack (solo las piezas con logo conocido). */
function StackLogos({ names }) {
  // Un logo por tecnología (p. ej. "Django" y "Django ORM" comparten logo)
  const seen = new Set();
  const withIcon = names.filter((n) => {
    const icon = getTechIcon(n);
    if (!icon || seen.has(icon.title)) return false;
    seen.add(icon.title);
    return true;
  });
  if (!withIcon.length) return null;
  return (
    <div className="flex items-center gap-2 mb-3 flex-wrap">
      {withIcon.map((name) => (
        <span
          key={name}
          title={name}
          className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center"
        >
          <TechIcon name={name} size={17} />
        </span>
      ))}
    </div>
  );
}

export function StackStation({ station, data, onNext, onGenerate }) {
  const savedStack = useDecisionStore((s) => s.blueprint.selectedStack);
  const setCompanion = useDecisionStore((s) => s.setCompanion);
  const isLocked = useDecisionStore((s) => isStepLocked(s, station.stepNumber));

  // Solo guardamos los cambios del usuario; el valor efectivo se deriva
  const [languageOverrides, setLanguageOverrides] = useState({});
  // Preferencias del entorno elegidas a mano (parciales; el resto es de serie)
  const [chosenPrefs, setChosenPrefs] = useState(
    () => savedStack?.preferences || {},
  );

  const getLanguage = (stack) =>
    languageOverrides[stack.id] ||
    (savedStack?.id === stack.id ? savedStack.selectedLanguage : null) ||
    stack.defaultLanguage ||
    stack.availableLanguages?.[0] ||
    "TypeScript";

  const withLanguage = (stack) =>
    stack ? { ...stack, selectedLanguage: getLanguage(stack) } : null;

  const changePreference = (patch, message) => {
    setChosenPrefs((prev) => ({
      ...prev,
      ...patch,
      managers: { ...prev.managers, ...patch.managers },
    }));
    if (message) setCompanion("happy", message);
  };

  return (
    <OptionStation
      station={station}
      data={data}
      onNext={onNext}
      onGenerate={onGenerate}
      toDecision={(stack) => {
        const full = withLanguage(stack);
        return { ...full, preferences: resolvePreferences(full, chosenPrefs) };
      }}
      belowDeck={(selected, { isLocked: locked }) => {
        const stack = withLanguage(selected[0]);
        return (
          <DevEnvironmentPanel
            stack={stack}
            preferences={resolvePreferences(stack, chosenPrefs)}
            isLocked={locked}
            onChange={(patch) => {
              const [eco, id] = Object.entries(patch.managers || {})[0] || [];
              changePreference(
                patch,
                eco
                  ? `Anotado: usarás ${getManager(eco, id)?.label}. Los comandos del cierre saldrán con ese gestor.`
                  : null,
              );
            }}
          />
        );
      }}
      selectMessage={(stack) =>
        `¿${stack.title} con ${getLanguage(stack)}? Interesante, analicemos sus límites.`
      }
      renderCard={(stack, { isSelected, isDimmed, levelLabelOf }) => {
        const languages = stack.availableLanguages || [];
        const currentLang = getLanguage(stack);
        return (
          <SelectionCard
            title={stack.title}
            subtitle={stack.summary}
            tag={stack.badge}
            level={stack.level}
            levelLabel={levelLabelOf(stack.level)}
            beginnerTip={stack.beginnerTip}
            techs={stack.tags || []}
            pros={stack.pros}
            cons={stack.cons}
            isSelected={isSelected}
            isDimmed={isDimmed}
            footer={
              <div className="flex items-center justify-between gap-2 text-[10px] sm:text-[11px] font-mono text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <TechIcon name={currentLang} />
                  Lenguaje: {currentLang}
                </span>
                {languages.length > 1 && (
                  <select
                    disabled={isLocked}
                    value={currentLang}
                    onClick={(e) => e.stopPropagation()}
                    onPointerDown={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setLanguageOverrides((prev) => ({
                        ...prev,
                        [stack.id]: e.target.value,
                      }))
                    }
                    aria-label="Lenguaje del stack"
                    className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-[11px] rounded-lg px-2 py-1 outline-none font-mono disabled:opacity-40 cursor-pointer"
                  >
                    {languages.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            }
            media={<StackLogos names={stack.tags || []} />}
          />
        );
      }}
      rewriteDescription="Se desbloquearán las opciones de stack. La base de datos, la arquitectura y todo lo calculado después se descartarán."
    />
  );
}
