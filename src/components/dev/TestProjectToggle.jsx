"use client";

import { useEffect, useState } from "react";
import { FlaskConical, Loader2 } from "lucide-react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { checkDevToolsAccess } from "@/services/projectService";
import { ConfirmModal } from "@/components/modals/ConfirmModal";

/**
 * Palanca "Proyecto de prueba" (herramienta de desarrollo).
 *
 * Solo aparece si el servidor confirma que la cuenta está en DEV_TOOLS_EMAILS.
 * Encendida: carga "Reservalo" con todo decidido hasta el Layout y salta al
 * Deploy. Apagada: vacía la memoria local. El proyecto de prueba nunca se
 * guarda en la nube.
 */
export function TestProjectToggle({ onLoad }) {
  const userId = useDecisionStore((s) => s.currentUser?.id);
  const isTestProject = useDecisionStore((s) => s.isTestProject);
  const hasLocalMap = useDecisionStore(
    (s) =>
      Boolean(s.blueprint.idea?.trim()) &&
      Object.keys(s.generatedOptions).length > 0,
  );
  const clearAllMemory = useDecisionStore((s) => s.clearAllMemory);

  // Acceso verificado por usuario (se descarta al cambiar de sesión)
  const [access, setAccess] = useState({ userId: null, enabled: false });
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (!userId) return undefined;
    let cancelled = false;
    checkDevToolsAccess()
      .then((enabled) => {
        if (!cancelled) setAccess({ userId, enabled });
      })
      .catch(() => {
        if (!cancelled) setAccess({ userId, enabled: false });
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const enabled = Boolean(userId) && access.userId === userId && access.enabled;
  if (!enabled) return null;

  const load = async () => {
    setIsBusy(true);
    setError(null);
    try {
      await onLoad();
    } catch (err) {
      setError(err?.message || "No se pudo cargar el proyecto de prueba");
    } finally {
      setIsBusy(false);
    }
  };

  const handleToggle = () => {
    if (isBusy) return;
    if (isTestProject) {
      clearAllMemory();
      return;
    }
    // Reemplaza el mapa local: se confirma si hay uno en curso
    if (hasLocalMap) setConfirmOpen(true);
    else load();
  };

  return (
    <div className="md:col-span-3 w-full flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 rounded-2xl border border-dashed border-amber-800/60 bg-amber-950/10">
      <div className="flex items-start gap-3 min-w-0">
        <span className="w-8 h-8 rounded-xl bg-amber-950/60 border border-amber-900/70 flex items-center justify-center shrink-0">
          <FlaskConical className="w-4 h-4 text-amber-300" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-amber-200 flex items-center gap-2">
            Proyecto de prueba
            <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-950/70 border border-amber-900/70 text-amber-400">
              Dev
            </span>
          </p>
          <p className="text-[11px] text-neutral-400 leading-snug">
            {isTestProject
              ? "Activo: “Reservalo” con todo decidido hasta el Deploy y la galería de IA abierta. No se guarda en la nube."
              : "Carga al instante “Reservalo” hasta el Deploy y abre la estación 13 (Ecosistema de IA). Sin usar créditos de IA."}
          </p>
          {error && <p className="text-[11px] text-red-400 mt-1">{error}</p>}
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={isTestProject}
        aria-label="Proyecto de prueba"
        disabled={isBusy}
        onClick={handleToggle}
        className={`relative w-12 h-7 rounded-full border transition-colors shrink-0 self-end sm:self-auto cursor-pointer disabled:cursor-wait ${
          isTestProject
            ? "bg-amber-400 border-amber-300"
            : "bg-neutral-800 border-neutral-700"
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-[22px] h-[22px] rounded-full bg-white shadow flex items-center justify-center transition-transform duration-200 ${
            isTestProject ? "translate-x-5" : "translate-x-0"
          }`}
        >
          {isBusy && (
            <Loader2 className="w-3 h-3 text-neutral-500 animate-spin" />
          )}
        </span>
      </button>

      <ConfirmModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={load}
        tag="Proyecto de prueba"
        title="¿Reemplazar el mapa local?"
        description="El mapa que tienes en este navegador se reemplazará por el proyecto de prueba. Lo guardado en la nube no se toca."
        confirmText="Cargar proyecto de prueba"
        cancelText="Cancelar"
      />
    </div>
  );
}
