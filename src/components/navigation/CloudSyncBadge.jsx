"use client";

import { useDecisionStore } from "@/hooks/useDecisionStore";
import { saveToCloudNow } from "@/hooks/useCloudAutosave";
import {
  Cloud,
  CloudOff,
  RefreshCw,
  CheckCircle2,
  FlaskConical,
} from "lucide-react";

/**
 * Estado del autoguardado. Sin sesión indica "Solo local"; con error permite
 * reintentar con un clic.
 */
export function CloudSyncBadge({ compact = false }) {
  const currentUser = useDecisionStore((s) => s.currentUser);
  const status = useDecisionStore((s) => s.cloudSyncStatus);
  const error = useDecisionStore((s) => s.cloudSyncError);
  const isTestProject = useDecisionStore((s) => s.isTestProject);

  if (isTestProject) {
    return (
      <span
        title="Proyecto de prueba: no se guarda en la nube"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-mono text-amber-300 bg-amber-950/40 border border-amber-900/60 shrink-0"
      >
        <FlaskConical className="w-3.5 h-3.5" />
        <span className={compact ? "hidden md:inline" : ""}>
          Prueba · sin guardar
        </span>
      </span>
    );
  }

  if (!currentUser) {
    return (
      <span
        title="Inicia sesión con Google para guardar tus mapas en la nube"
        className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-mono text-neutral-500 shrink-0"
      >
        <CloudOff className="w-3.5 h-3.5" />
        {!compact && <span>Solo local</span>}
      </span>
    );
  }

  const config = {
    saving: {
      Icon: RefreshCw,
      text: "Guardando...",
      className: "text-neutral-300",
      iconClass: "animate-spin text-emerald-400",
    },
    saved: {
      Icon: CheckCircle2,
      text: "Guardado",
      className: "text-emerald-300",
      iconClass: "text-emerald-400",
    },
    error: {
      Icon: CloudOff,
      text: "Reintentar",
      className: "text-red-300 bg-red-950/40 border border-red-900/60",
      iconClass: "text-red-400",
    },
    idle: {
      Icon: Cloud,
      text: "Autoguardado",
      className: "text-neutral-400",
      iconClass: "",
    },
  }[status] || {
    Icon: Cloud,
    text: "Autoguardado",
    className: "text-neutral-400",
    iconClass: "",
  };

  const isError = status === "error";

  return (
    <button
      type="button"
      onClick={isError ? () => saveToCloudNow() : undefined}
      disabled={!isError}
      title={
        isError
          ? `No se pudo guardar: ${error}. Clic para reintentar.`
          : "Tus cambios se guardan solos en la nube"
      }
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-xl text-[11px] font-mono shrink-0 transition-colors ${config.className} ${
        isError ? "cursor-pointer hover:bg-red-900/40" : "cursor-default"
      }`}
    >
      <config.Icon className={`w-3.5 h-3.5 ${config.iconClass}`} />
      <span className={compact ? "hidden md:inline" : ""}>{config.text}</span>
    </button>
  );
}
