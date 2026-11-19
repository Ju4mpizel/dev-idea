"use client";

import { useEffect } from "react";
import { Infinity as InfinityIcon, Lightbulb, Clock } from "lucide-react";
import { useDecisionStore } from "@/hooks/useDecisionStore";
import { fetchIdeaQuota } from "@/services/projectService";

/** Hora local corta ("18:40") de una fecha ISO. */
export const formatQuotaTime = (iso) =>
  iso
    ? new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

/** ¿Queda cupo para abrir una idea nueva? (sin dato aún: se deja intentar) */
export const hasIdeaSlot = (quota) =>
  !quota || quota.unlimited || quota.used < quota.limit;

/**
 * Cupo de ideas en la Estación 0: "Te quedan 1 de 2 ideas" o "Próxima idea a
 * las 18:40". Se refresca solo cuando se libera un cupo.
 */
export function IdeaQuota() {
  const currentUser = useDecisionStore((s) => s.currentUser);
  const quota = useDecisionStore((s) => s.ideaQuota);
  const setIdeaQuota = useDecisionStore((s) => s.setIdeaQuota);

  // Lectura inicial (y al cambiar de cuenta)
  useEffect(() => {
    if (!currentUser) return undefined;
    let cancelled = false;
    fetchIdeaQuota()
      .then((q) => {
        if (!cancelled && q) setIdeaQuota(q);
      })
      .catch(console.error);
    return () => {
      cancelled = true;
    };
  }, [currentUser, setIdeaQuota]);

  // Cuando se libera el próximo cupo, se vuelve a leer
  const nextFreeAt = quota?.nextFreeAt;
  useEffect(() => {
    if (!nextFreeAt) return undefined;
    const wait = new Date(nextFreeAt).getTime() - Date.now() + 1000;
    const timer = setTimeout(
      () => fetchIdeaQuota().then((q) => q && setIdeaQuota(q)).catch(console.error),
      Math.min(Math.max(wait, 1000), 2_147_000_000),
    );
    return () => clearTimeout(timer);
  }, [nextFreeAt, setIdeaQuota]);

  if (!quota) return null;

  const base =
    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] sm:text-[11px] font-mono";

  if (quota.unlimited) {
    return (
      <span className={`${base} border-violet-500/30 bg-violet-500/10 text-violet-300`}>
        <InfinityIcon className="w-3.5 h-3.5" aria-hidden="true" />
        Ideas sin límite
      </span>
    );
  }

  const left = Math.max(quota.limit - quota.used, 0);
  if (left === 0) {
    return (
      <span
        className={`${base} border-amber-500/30 bg-amber-500/10 text-amber-300`}
        title="Puedes abrir 2 ideas cada 8 horas. Tus mapas ya empezados siguen disponibles."
      >
        <Clock className="w-3.5 h-3.5" aria-hidden="true" />
        Próxima idea a las {formatQuotaTime(quota.nextFreeAt)}
      </span>
    );
  }

  return (
    <span
      className={`${base} border-neutral-800 bg-neutral-950/60 text-neutral-400`}
      title="Cada idea es una ruta completa por todas las estaciones. El cupo se renueva cada 8 horas."
    >
      <Lightbulb className="w-3.5 h-3.5 text-amber-300" aria-hidden="true" />
      Te {left === 1 ? "queda" : "quedan"} {left} de {quota.limit}{" "}
      {quota.limit === 1 ? "idea" : "ideas"}
    </span>
  );
}
