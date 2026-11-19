"use client";

import { useMemo, useState } from "react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { isStepLocked } from "@/hooks/useStationNavigation";
import {
  DATABASES,
  NO_DATABASE_DECISION,
  adminToolsFor,
  getAdminTool,
  getDatabase,
  recommendDataStorage,
} from "@/data/databases";
import { DeckSkeleton } from "@/components/map/deck/CardDeck";
import { OptionStation } from "./OptionStation";
import { StationShell } from "./StationShell";
import {
  AlertTriangle,
  CloudOff,
  Database,
  FileText,
  HardDrive,
  KeyRound,
  Layers,
  Star,
  Wrench,
} from "lucide-react";

const DB_TYPES = {
  none: { label: "Sin base de datos", Icon: CloudOff, color: "text-neutral-300" },
  relational: { label: "Relacional (SQL)", Icon: Database, color: "text-sky-400" },
  document: { label: "Documental (NoSQL)", Icon: FileText, color: "text-emerald-400" },
  "key-value": { label: "Clave-valor", Icon: KeyRound, color: "text-rose-400" },
  baas: { label: "Backend como servicio", Icon: Layers, color: "text-violet-400" },
  embedded: { label: "Embebida (archivo local)", Icon: HardDrive, color: "text-amber-400" },
};

const REWRITE_DESCRIPTION =
  "Se desbloqueará la elección de base de datos. La arquitectura, los diagramas y todo lo calculado después se descartarán.";

/**
 * Estación Base de datos en dos pasos:
 * 1. "¿Tu proyecto guardará datos?" (interruptor, sin IA). Viene preactivado
 *    según el tipo de sistema y el stack. En "No" se confirma sin gastar una
 *    generación; en "Sí" se puede elegir una favorita y se piden las cartas.
 * 2. Cartas de bases compatibles con el stack + el administrador para verla.
 */
export function DatabaseStation({ station, data, onNext, onGenerateWith }) {
  const { stepNumber, blueprintKey } = station;
  const systemType = useDecisionStore((s) => s.blueprint.selectedSystemType);
  const stack = useDecisionStore((s) => s.blueprint.selectedStack);
  const saved = useDecisionStore((s) => s.blueprint[blueprintKey]);
  const isLoading = useDecisionStore((s) => s.isLoading);
  const isLocked = useDecisionStore((s) => isStepLocked(s, stepNumber));
  const setCompanion = useDecisionStore((s) => s.setCompanion);
  const updateBlueprint = useDecisionStore((s) => s.updateBlueprint);

  const storage = useMemo(
    () => recommendDataStorage({ selectedSystemType: systemType, selectedStack: stack }),
    [systemType, stack],
  );

  // Las cartas "sin base de datos" de versiones anteriores ya no se muestran:
  // eso se decide con el interruptor
  const cards = (data?.options || []).filter((o) => o.dbType !== "none");
  const savedNone = saved?.dbType === "none";

  const [editingSetup, setEditingSetup] = useState(false);
  const [wantsDatabase, setWantsDatabase] = useState(() =>
    saved ? saved.dbType !== "none" : storage.needed,
  );
  const [favorite, setFavorite] = useState("auto");
  const [adminChoice, setAdminChoice] = useState({});

  const showSetup = editingSetup || savedNone || cards.length === 0;

  if (isLoading && cards.length === 0) {
    return (
      <StationShell
        station={station}
        onConfirm={() => {}}
        confirmDisabled
        confirmLabel="Buscando bases de datos…"
        rewriteDescription={REWRITE_DESCRIPTION}
      >
        <DeckSkeleton />
      </StationShell>
    );
  }

  if (showSetup) {
    const toggle = () => {
      if (isLocked) return;
      const next = !wantsDatabase;
      setWantsDatabase(next);
      if (!next && storage.strong) {
        setCompanion(
          "uneasy-left",
          `Ojo: ${storage.reason} Sin base de datos se perdería todo al recargar.`,
        );
      } else if (!next) {
        setCompanion("happy", "Sin base de datos: menos piezas que mantener. Si luego la necesitas, se agrega.");
      } else {
        setCompanion("curious", "¡Bien! Si ya tienes una base favorita, elígela y la pongo primera.");
      }
    };

    const favorites = storage.staticStack
      ? DATABASES.filter((d) => d.dbType === "baas")
      : DATABASES;

    const handleConfirm = () => {
      if (!wantsDatabase) {
        updateBlueprint({ [blueprintKey]: NO_DATABASE_DECISION });
        onNext({ [blueprintKey]: NO_DATABASE_DECISION });
        return;
      }
      setEditingSetup(false);
      onGenerateWith?.({
        databasePreference: {
          wantsDatabase: true,
          favorite: favorite !== "auto" ? favorite : null,
        },
      });
    };

    return (
      <StationShell
        station={station}
        onConfirm={handleConfirm}
        confirmDisabled={isLocked}
        confirmLabel={
          wantsDatabase ? "Ver bases de datos recomendadas" : "Confirmar sin base de datos"
        }
        footerCenter={
          editingSetup && cards.length > 0 && !isLocked ? (
            <button
              type="button"
              onClick={() => setEditingSetup(false)}
              className="w-full text-[11px] font-mono text-neutral-400 hover:text-neutral-100 underline underline-offset-4 cursor-pointer"
            >
              Volver a las cartas sin regenerar
            </button>
          ) : null
        }
        rewriteTitle="¿Cambiar la base de datos?"
        rewriteDescription={REWRITE_DESCRIPTION}
      >
        <div className="w-full rounded-3xl border border-neutral-800 bg-neutral-950/70 p-4 sm:p-6 flex flex-col gap-4">
          {/* Interruptor */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex flex-col gap-1">
              <h3 className="text-sm sm:text-base font-semibold text-white">
                ¿Tu proyecto guardará datos?
              </h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Usuarios, pedidos, registros o cualquier cosa que deba seguir ahí
                mañana. Si solo muestra información fija, no necesitas base de datos.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={wantsDatabase}
              aria-label="El proyecto guardará datos"
              disabled={isLocked}
              onClick={toggle}
              className={`shrink-0 relative w-14 h-8 rounded-full border transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                wantsDatabase
                  ? "bg-emerald-400 border-emerald-300"
                  : "bg-neutral-800 border-neutral-700"
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                  wantsDatabase ? "translate-x-6" : "translate-x-0"
                }`}
              />
              <span className="sr-only">{wantsDatabase ? "Sí" : "No"}</span>
            </button>
          </div>

          {/* Qué recomienda Dev-i */}
          <p
            className={`text-[11px] sm:text-xs rounded-xl border px-3 py-2 leading-relaxed flex items-start gap-1.5 ${
              !wantsDatabase && storage.strong
                ? "border-amber-700/60 bg-amber-950/30 text-amber-100"
                : "border-neutral-800 bg-neutral-900/60 text-neutral-300"
            }`}
          >
            {!wantsDatabase && storage.strong ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-px" />
            ) : (
              <Star className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-px" />
            )}
            <span>
              {storage.reason}{" "}
              <b className="text-white">
                Recomendado: {storage.needed ? "con base de datos" : "sin base de datos"}.
              </b>
            </span>
          </p>

          {wantsDatabase ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="flex flex-col gap-1">
                <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-500">
                  <Database className="w-3 h-3" />
                  ¿Ya tienes una favorita? (opcional)
                </span>
                <select
                  value={favorite}
                  disabled={isLocked}
                  onChange={(e) => setFavorite(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 hover:border-neutral-600 text-neutral-100 text-xs rounded-lg px-2 py-2 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 cursor-pointer disabled:opacity-50"
                >
                  <option value="auto">Que Dev-i recomiende según mi stack</option>
                  {favorites.map((db) => (
                    <option key={db.id} value={db.id}>
                      {db.label}
                    </option>
                  ))}
                </select>
                <span className="text-[10px] text-neutral-500">
                  {favorite !== "auto"
                    ? `${getDatabase(favorite)?.label} irá primera; las demás serán alternativas.`
                    : "Te muestro opciones compatibles con tu stack."}
                </span>
              </label>
              <div className="text-[11px] text-neutral-400 leading-relaxed rounded-xl border border-neutral-800 bg-neutral-900/40 px-3 py-2 flex items-start gap-1.5">
                <Wrench className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-px" />
                <span>
                  Después de elegir la base podrás escoger su{" "}
                  <b className="text-neutral-200">administrador</b> (el programa para
                  ver y editar los datos, como pgAdmin o MySQL Workbench).
                  {storage.staticStack &&
                    " Tu stack no tiene servidor propio: te mostraré bases que se usan desde el navegador."}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-[11px] text-neutral-500 leading-relaxed">
              Sin base de datos, la arquitectura no tendrá capa de datos, los
              diagramas no incluirán el modelo entidad-relación y el deploy no
              sumará servicios de base de datos.
            </p>
          )}
        </div>
      </StationShell>
    );
  }

  const adminOf = (option) => {
    const tools = adminToolsFor(option);
    const picked =
      adminChoice[option.id] ||
      (saved?.id === option.id ? saved.adminTool : null);
    return tools.find((t) => t.id === picked) || tools[0] || null;
  };

  return (
    <OptionStation
      station={station}
      data={{ ...data, options: cards }}
      onNext={onNext}
      selectMessage={(o) =>
        `"${o.title}" anotada. Abajo elige con qué programa verás tus datos.`
      }
      toDecision={(o) => {
        const admin = adminOf(o);
        return { ...o, adminTool: admin?.id || null, adminToolLabel: admin?.label || null };
      }}
      cardProps={(o) => {
        const meta = DB_TYPES[o.dbType] || DB_TYPES.relational;
        return {
          media: (
            <div className="flex items-center gap-2 mb-3">
              <span className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                <meta.Icon className={`w-5 h-5 ${meta.color}`} />
              </span>
              <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400">
                {meta.label}
              </span>
            </div>
          ),
        };
      }}
      afterDeck={
        !isLocked ? (
          <button
            type="button"
            onClick={() => {
              setWantsDatabase(true);
              setEditingSetup(true);
            }}
            className="w-full text-[11px] font-mono text-neutral-400 hover:text-neutral-100 underline underline-offset-4 cursor-pointer"
          >
            ¿Otra favorita o sin base de datos? Cambiar
          </button>
        ) : null
      }
      belowDeck={(selected, { isLocked: locked }) => {
        const option = selected[0];
        if (!option) return null;
        const tools = adminToolsFor(option);
        const current = adminOf(option);
        return (
          <section className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/70 p-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400 shrink-0">
              <Wrench className="w-3.5 h-3.5 text-sky-400" />
              Administrador
            </span>
            <select
              value={current?.id || ""}
              disabled={locked}
              aria-label={`Administrador para ${option.title}`}
              onChange={(e) => {
                setAdminChoice((prev) => ({ ...prev, [option.id]: e.target.value }));
                setCompanion(
                  "happy",
                  `${getAdminTool(e.target.value)?.label} anotado: con eso verás y editarás tus datos.`,
                );
              }}
              className="sm:w-64 bg-neutral-900 border border-neutral-700 text-neutral-100 text-xs rounded-lg px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 cursor-pointer disabled:opacity-50"
            >
              {tools.map((tool) => (
                <option key={tool.id} value={tool.id}>
                  {tool.label}
                </option>
              ))}
            </select>
            {current?.hint && (
              <span className="text-[10px] sm:text-[11px] text-neutral-500 leading-snug">
                {current.hint}
              </span>
            )}
          </section>
        );
      }}
      rewriteDescription={REWRITE_DESCRIPTION}
    />
  );
}
