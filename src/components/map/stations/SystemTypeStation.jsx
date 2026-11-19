"use client";

import { useEffect, useMemo, useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked } from "@/hooks/useStationNavigation";
import {
  SURFACES,
  SYSTEM_FAMILIES,
  buildSystemTypeDecision,
  detectSystemType,
  getComplementsFor,
  getSystemFamily,
  getSystemType,
  getTypesOfFamily,
} from "@/data/systemTypes";
import { getLevelStyle } from "./levelStyles";
import { StationShell } from "./StationShell";
import {
  AppWindow,
  Boxes,
  Bot,
  Briefcase,
  Building2,
  Calculator,
  CalendarCheck,
  CalendarDays,
  ChartColumn,
  Check,
  Contact,
  Database,
  Files,
  Globe,
  GraduationCap,
  Headset,
  LayoutGrid,
  LayoutTemplate,
  Lightbulb,
  MessageCircle,
  MessagesSquare,
  Newspaper,
  Plus,
  Server,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  SquarePen,
  SquareUser,
  Star,
  Store,
  Ticket,
  Users,
  Webhook,
} from "lucide-react";

const FAMILY_ICONS = {
  globe: Globe,
  shopping: ShoppingBag,
  briefcase: Briefcase,
  calendar: CalendarDays,
  users: Users,
  smartphone: Smartphone,
  server: Server,
};

const TYPE_ICONS = {
  landing: LayoutTemplate,
  multipage: Files,
  "cms-site": SquarePen,
  portfolio: SquareUser,
  blog: Newspaper,
  "catalog-orders": MessageCircle,
  ecommerce: ShoppingCart,
  marketplace: Store,
  pos: Calculator,
  inventory: Boxes,
  "erp-lite": Building2,
  crm: Contact,
  records: Database,
  helpdesk: Headset,
  booking: CalendarCheck,
  events: Ticket,
  saas: AppWindow,
  lms: GraduationCap,
  community: MessagesSquare,
  dashboard: ChartColumn,
  "mobile-app": Smartphone,
  api: Webhook,
  bot: Bot,
};

const LEVEL_LABEL = {
  simple: "Sencillo",
  medium: "Intermedio",
  advanced: "Ambicioso",
};

/** Altura de la lista: deja siempre a la vista el pie con "Confirmar". */
const LIST_HEIGHT = "h-[clamp(300px,calc(100dvh-440px),540px)]";

/**
 * Estación 2: tipo de sistema. Catálogo fijo (sin Gemini) en una lista simple.
 * Lee la idea, abre la familia detectada y marca con ⭐ los tipos más
 * probables, para no preguntar de nuevo lo que el usuario ya escribió.
 */
export function SystemTypeStation({ station, onNext }) {
  const { stepNumber, blueprintKey } = station;
  const idea = useDecisionStore((s) => s.blueprint.idea);
  const context = useDecisionStore((s) => s.blueprint.context);
  const saved = useDecisionStore((s) => s.blueprint[blueprintKey]);
  const updateBlueprint = useDecisionStore((s) => s.updateBlueprint);
  const setCompanion = useDecisionStore((s) => s.setCompanion);
  const isLockedHistory = useDecisionStore((s) => isStepLocked(s, stepNumber));

  // Un proyecto antiguo puede tener estaciones posteriores sin esta decisión:
  // entonces se deja elegir sin reescribir nada
  const canEditLegacy = isLockedHistory && !saved;
  const isLocked = isLockedHistory && !canEditLegacy;

  const detection = useMemo(
    () => detectSystemType(idea, context),
    [idea, context],
  );

  const [pickedId, setPickedId] = useState(null);
  const [pickedComplements, setPickedComplements] = useState(null);
  const [familyId, setFamilyId] = useState(
    () =>
      getSystemType(saved?.id)?.family ||
      detection.familyId ||
      SYSTEM_FAMILIES[0].id,
  );

  const selectedId = pickedId ?? saved?.id ?? null;
  const complements = pickedComplements ?? saved?.complements ?? [];
  const selectedType = getSystemType(selectedId);

  // Idea clara -> solo lo que encaja; el catálogo completo queda a un toque.
  // Si lo guardado no está entre lo enfocado, se abre el catálogo completo.
  const focusedIds = detection.focused;
  const [showAll, setShowAll] = useState(
    () => !focusedIds || Boolean(saved?.id && !focusedIds.includes(saved.id)),
  );
  const isFocused = Boolean(focusedIds) && !showAll;

  // Dev-i explica qué leyó en la idea (solo al llegar a la estación)
  useEffect(() => {
    if (saved) return;
    const family = getSystemFamily(detection.familyId);
    if (detection.focused && detection.matched.length) {
      setCompanion(
        "curious",
        `Leí «${detection.matched.join("», «")}» en tu idea: te muestro solo lo que encaja. Si buscabas otra cosa, abre «Ver todos los tipos».`,
      );
    } else if (family && detection.matched.length) {
      setCompanion(
        "curious",
        `Leí «${detection.matched.join("», «")}» en tu idea: te muestro opciones de «${family.title}» y marqué con ⭐ lo que mejor encaja.`,
      );
    } else {
      setCompanion(
        "thinking",
        "No pude deducir el tipo de producto con tu idea. Elige la familia que más se parezca.",
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isDetectedFamily = familyId === detection.familyId;
  const recommended =
    isFocused || isDetectedFamily ? detection.recommended : [];
  const familyTypes = getTypesOfFamily(familyId);
  const orderedTypes = isFocused
    ? [
        ...recommended,
        ...focusedIds.filter((id) => !recommended.includes(id)),
      ]
        .map(getSystemType)
        .filter(Boolean)
    : [
        ...recommended.map(getSystemType).filter(Boolean),
        ...familyTypes.filter((t) => !recommended.includes(t.id)),
      ];
  const crossType =
    !isFocused && isDetectedFamily && detection.crossId
      ? getSystemType(detection.crossId)
      : null;

  const selectType = (type) => {
    if (isLocked) return;
    setPickedId(type.id);
    // Se quitan los complementos que el nuevo tipo ya trae o que no le sirven
    const allowed = getComplementsFor(type).map((c) => c.id);
    setPickedComplements(complements.filter((id) => allowed.includes(id)));
    setCompanion(
      "happy",
      `"${type.title}" anotado. Si le falta algo, súmale un complemento abajo.`,
    );
  };

  const toggleComplement = (id) => {
    if (isLocked) return;
    setPickedComplements(
      complements.includes(id)
        ? complements.filter((c) => c !== id)
        : [...complements, id],
    );
  };

  const decision = selectedType
    ? buildSystemTypeDecision(selectedType.id, complements)
    : null;

  const handleConfirm = () => {
    if (!decision) return;
    updateBlueprint({ [blueprintKey]: decision });
    onNext({ [blueprintKey]: decision });
  };

  const availableComplements = getComplementsFor(selectedType);

  const detectedFamily = getSystemFamily(detection.familyId);

  return (
    <StationShell
      station={station}
      onConfirm={handleConfirm}
      confirmDisabled={!decision}
      confirmLabel="Confirmar tipo de sistema"
      forceEditable={canEditLegacy}
      selectionSummary={
        decision ? `${decision.surfaces.length} superficies` : null
      }
      rewriteTitle="¿Cambiar el tipo de sistema?"
      rewriteDescription="Se desbloqueará el tipo de sistema. Requisitos, stack y todo lo calculado después se descartará."
    >
      <div
        className={`${LIST_HEIGHT} w-full rounded-3xl border border-neutral-800 bg-neutral-950/70 flex flex-col overflow-hidden`}
      >
        {/* Qué se leyó en la idea + familias */}
        <div className="shrink-0 px-3 sm:px-4 pt-3 pb-2.5 border-b border-neutral-800/80 flex flex-col gap-2.5">
          <p className="text-[11px] sm:text-xs text-neutral-400 flex items-start gap-1.5">
            <Lightbulb className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-px" />
            {isFocused ? (
              <span>
                Por tu idea («{detection.matched.join("», «")}») te muestro
                solo lo que encaja con{" "}
                <b className="text-neutral-200">
                  {detectedFamily?.title.toLowerCase()}
                </b>
                .
              </span>
            ) : detectedFamily ? (
              <span>
                Por tu idea parece{" "}
                <b className="text-neutral-200">
                  {detectedFamily.title.toLowerCase()}
                </b>
                . Si no es así, cambia de familia.
              </span>
            ) : (
              <span>Elige la familia que más se parezca a tu producto.</span>
            )}
          </p>

          {!isFocused && (
          <div
            role="tablist"
            aria-label="Familias de sistemas"
            className="chip-scroll flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0"
          >
            {SYSTEM_FAMILIES.map((family) => {
              const Icon = FAMILY_ICONS[family.icon] || Globe;
              const isActive = family.id === familyId;
              const isDetected = family.id === detection.familyId;
              return (
                <button
                  key={family.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setFamilyId(family.id)}
                  className={`shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-[11px] font-medium transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white text-neutral-950 border-white"
                      : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-100 hover:border-neutral-700"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{family.title}</span>
                  {isDetected && (
                    <Star
                      className={`w-3 h-3 ${isActive ? "text-amber-500 fill-amber-500" : "text-amber-400 fill-amber-400"}`}
                    />
                  )}
                </button>
              );
            })}
          </div>
          )}
        </div>

        {/* Lista de tipos */}
        <div
          role="listbox"
          aria-label="Tipos de sistema"
          className="flex-1 min-h-0 overflow-y-auto scrollbar-thin p-2.5 sm:p-3 flex flex-col gap-2"
        >
          {orderedTypes.map((type) => (
            <SystemTypeRow
              key={type.id}
              type={type}
              isSelected={selectedId === type.id}
              isRecommended={recommended.includes(type.id)}
              isLocked={isLocked}
              onSelect={() => selectType(type)}
            />
          ))}

          {crossType && crossType.family !== familyId && (
            <div className="mt-1 flex flex-col gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 px-1">
                ¿También te sirve?
              </span>
              <SystemTypeRow
                type={crossType}
                isSelected={selectedId === crossType.id}
                isLocked={isLocked}
                onSelect={() => selectType(crossType)}
                familyLabel={getSystemFamily(crossType.family)?.title}
              />
            </div>
          )}

          {/* Salida de la vista enfocada (o vuelta a ella) */}
          {focusedIds && (
            <button
              type="button"
              onClick={() => {
                setShowAll(isFocused);
                if (isFocused && detection.familyId) setFamilyId(detection.familyId);
              }}
              className="mt-1 self-center flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-neutral-700 text-[11px] text-neutral-400 hover:text-neutral-100 hover:border-neutral-500 transition-colors cursor-pointer"
            >
              {isFocused ? (
                <>
                  <LayoutGrid className="w-3.5 h-3.5" />
                  ¿Tu idea es otra cosa? Ver todos los tipos
                </>
              ) : (
                <>
                  <Star className="w-3.5 h-3.5 text-amber-400" />
                  Ver solo lo que encaja con tu idea
                </>
              )}
            </button>
          )}
        </div>

        {/* Complementos del tipo elegido */}
        {selectedType && availableComplements.length > 0 && (
          <div className="shrink-0 border-t border-neutral-800/80 px-3 sm:px-4 py-2.5 flex flex-col gap-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
              Complementos opcionales
            </span>
            <div className="chip-scroll flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1 sm:flex-wrap sm:overflow-visible sm:mx-0 sm:px-0">
              {availableComplements.map((c) => {
                const isOn = complements.includes(c.id);
                return (
                  <button
                    key={c.id}
                    type="button"
                    disabled={isLocked}
                    aria-pressed={isOn}
                    title={c.desc}
                    onClick={() => toggleComplement(c.id)}
                    className={`shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-xl border text-[11px] transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-50 ${
                      isOn
                        ? "bg-emerald-400 border-emerald-400 text-neutral-950 font-medium"
                        : "bg-neutral-900 border-neutral-800 text-neutral-300 hover:border-neutral-600"
                    }`}
                  >
                    {isOn ? (
                      <Check className="w-3 h-3 stroke-[3]" />
                    ) : (
                      <Plus className="w-3 h-3" />
                    )}
                    {c.title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </StationShell>
  );
}

/** Fila de la lista: ícono · título · qué es · ejemplo · superficies. */
function SystemTypeRow({
  type,
  isSelected,
  isRecommended = false,
  isLocked,
  onSelect,
  familyLabel = null,
}) {
  const Icon = TYPE_ICONS[type.id] || Globe;
  const level = getLevelStyle(type.level);
  const isDimmed = isLocked && !isSelected;

  return (
    <button
      type="button"
      role="option"
      aria-selected={isSelected}
      disabled={isLocked}
      onClick={onSelect}
      className={`w-full text-left rounded-2xl border p-3 flex items-start gap-3 transition-colors cursor-pointer disabled:cursor-default ${
        isSelected
          ? "bg-neutral-900 border-emerald-400/80 ring-1 ring-emerald-400/40"
          : "bg-neutral-900/50 border-neutral-800 hover:bg-neutral-900 hover:border-neutral-700"
      } ${isDimmed ? "opacity-40" : ""}`}
    >
      <span
        className={`shrink-0 w-10 h-10 sm:w-11 sm:h-11 rounded-xl border flex items-center justify-center ${
          isSelected
            ? "bg-emerald-400 border-emerald-400 text-neutral-950"
            : "bg-neutral-950 border-neutral-800 text-neutral-300"
        }`}
      >
        <Icon className="w-5 h-5" />
      </span>

      <span className="flex-1 min-w-0 flex flex-col gap-1">
        <span className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-white leading-snug">
            {type.title}
          </span>
          {isRecommended && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-amber-400/15 border border-amber-500/40 text-amber-300 flex items-center gap-1">
              <Star className="w-2.5 h-2.5 fill-amber-300" /> Recomendado
            </span>
          )}
          {familyLabel && (
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
              {familyLabel}
            </span>
          )}
        </span>
        <span className="text-xs text-neutral-400 leading-relaxed">
          {type.summary}
        </span>
        <span className="text-[11px] text-neutral-500 italic">
          Ej.: {type.example}
        </span>
        <span className="flex items-center gap-1 flex-wrap mt-0.5">
          <span
            className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${level.badge}`}
          >
            {LEVEL_LABEL[type.level]}
          </span>
          {type.surfaces.map((s) => (
            <span
              key={s}
              className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-neutral-950 border border-neutral-800 text-neutral-400"
            >
              {SURFACES[s]}
            </span>
          ))}
        </span>
      </span>

      <span
        className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${
          isSelected
            ? "bg-emerald-400 border-emerald-400 text-neutral-950"
            : "border-neutral-700 text-transparent"
        }`}
      >
        <Check className="w-3 h-3 stroke-[3]" />
      </span>
    </button>
  );
}
