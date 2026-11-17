"use client";

import { useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked } from "@/hooks/useStationNavigation";
import { CardDeck, DeckSkeleton } from "@/components/map/deck/CardDeck";
import { SelectionCard } from "./SelectionCard";
import { StationShell } from "./StationShell";

const defaultGetKey = (option) => option.id;

/**
 * Estación de cartas genérica: carga, selección (una o varias), mazo, omitir y
 * confirmar. Las estaciones con contenido propio solo aportan `renderCard`
 * (o `renderExtra` para añadir bloques a la carta estándar).
 *
 * Nada viene preseleccionado: el usuario debe elegir de forma consciente.
 */
export function OptionStation({
  station,
  data,
  onNext,
  onGenerate = null,
  // Valor que sustituye a la selección de cartas (p. ej. nombre escrito a mano)
  overrideDecision = null,
  // Contenido en el pie, junto a Confirmar (p. ej. "¿Ya tienes un nombre?")
  afterDeck = null,
  getKey = defaultGetKey,
  getLabel = (option) => option.title,
  // ¿La opción coincide con la decisión guardada? (para restaurar la selección)
  matchesSaved = (option, saved) => option.id === saved?.id,
  // Transforma la opción elegida en lo que se guarda en el blueprint
  toDecision = (option) => option,
  renderCard = null,
  renderExtra = null,
  cardProps = () => ({}),
  selectMessage = (option) =>
    `"${option.title}" anotado. Revisa las demás cartas antes de confirmar.`,
  selectMood = station.defaultMood || "thinking",
  confirmLabel,
  rewriteTitle,
  rewriteDescription,
}) {
  const { stepNumber, blueprintKey, optionsKey } = station;
  const isMulti = station.selection === "multi";

  const saved = useDecisionStore((state) => state.blueprint[blueprintKey]);
  const updateBlueprint = useDecisionStore((state) => state.updateBlueprint);
  const setCompanion = useDecisionStore((state) => state.setCompanion);
  const isLoading = useDecisionStore((state) => state.isLoading);
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, stepNumber));

  const options = data?.[optionsKey] || [];

  // `null` = el usuario aún no tocó nada; se deriva de la decisión guardada
  const [pickedKeys, setPickedKeys] = useState(null);

  const savedList = Array.isArray(saved) ? saved : saved ? [saved] : [];
  const selectedKeys =
    pickedKeys ??
    new Set(
      options
        .filter((option) => savedList.some((s) => matchesSaved(option, s)))
        .map(getKey),
    );
  const selectedOptions = options.filter((o) => selectedKeys.has(getKey(o)));

  const handleToggle = (option) => {
    if (isLockedHistory) return;
    const key = getKey(option);
    const nextKeys = new Set(isMulti ? selectedKeys : []);
    const willSelect = !selectedKeys.has(key);
    if (willSelect) nextKeys.add(key);
    else if (isMulti) nextKeys.delete(key);
    else nextKeys.add(key); // en selección única, volver a pulsar la mantiene
    setPickedKeys(nextKeys);
    if (willSelect) setCompanion(selectMood, selectMessage(option));
  };

  const decision = overrideDecision
    ? overrideDecision
    : isMulti
      ? selectedOptions.map(toDecision)
      : selectedOptions[0]
        ? toDecision(selectedOptions[0])
        : null;

  const hasDecision = Array.isArray(decision)
    ? decision.length > 0
    : Boolean(decision);

  const handleConfirm = () => {
    if (!hasDecision) return;
    updateBlueprint({ [blueprintKey]: decision });
    onNext({ [blueprintKey]: decision });
  };

  const handleSkip = station.skippable
    ? () => {
        const empty = isMulti ? [] : blueprintKey === "selectedName" ? "" : null;
        updateBlueprint({ [blueprintKey]: empty });
        onNext({ [blueprintKey]: empty });
      }
    : null;

  const selectionSummary =
    isMulti && options.length
    ? `${selectedOptions.length} de ${options.length} elegidas`
    : null;

  const legend = station.legend;
  const levelLabelOf = (level) => legend?.[level];

  const defaultRender = (option, { isSelected, isDimmed }) => (
    <SelectionCard
      title={option.title}
      subtitle={option.summary}
      tag={option.tag}
      level={option.level}
      levelLabel={levelLabelOf(option.level)}
      beginnerTip={option.beginnerTip}
      pros={option.pros}
      cons={option.cons}
      techs={option.techs || []}
      isSelected={isSelected}
      isDimmed={isDimmed}
      {...cardProps(option)}
    >
      {renderExtra?.(option, { isSelected, isDimmed })}
    </SelectionCard>
  );

  return (
    <StationShell
      station={station}
      onSkip={handleSkip}
      confirmLabel={
        confirmLabel ||
        (isMulti
          ? `Confirmar ${selectedOptions.length || ""} ${selectedOptions.length === 1 ? "elección" : "elecciones"}`.replace(
              "  ",
              " ",
            )
          : "Confirmar elección")
      }
      onConfirm={handleConfirm}
      confirmDisabled={!hasDecision}
      selectionSummary={selectionSummary}
      footerCenter={afterDeck}
      rewriteTitle={rewriteTitle || `¿Cambiar tu elección de ${station.title}?`}
      rewriteDescription={rewriteDescription}
    >
      {isLoading && options.length === 0 ? (
        <DeckSkeleton />
      ) : (
        <CardDeck
          items={options}
          getKey={getKey}
          getLabel={getLabel}
          selectedKeys={selectedKeys}
          onToggle={handleToggle}
          selection={station.selection}
          isLocked={isLockedHistory}
          renderCard={(option, state) =>
            renderCard
              ? renderCard(option, { ...state, levelLabelOf })
              : defaultRender(option, state)
          }
          emptyMessage={
            <div className="flex flex-col items-center gap-3">
              <span>
                {data?.skipped
                  ? "Omitiste esta estación."
                  : "Todavía no hay cartas para esta estación."}
              </span>
              {onGenerate && !isLockedHistory && (
                <button
                  type="button"
                  onClick={onGenerate}
                  className="px-4 py-2 rounded-xl bg-white text-neutral-950 hover:bg-neutral-200 text-xs font-sans font-medium transition-colors cursor-pointer"
                >
                  Generar cartas con IA
                </button>
              )}
            </div>
          }
        />
      )}
    </StationShell>
  );
}
