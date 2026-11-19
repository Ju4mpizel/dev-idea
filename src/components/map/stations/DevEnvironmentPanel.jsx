"use client";

import {
  AI_MODES,
  ECOSYSTEMS,
  EDITORS,
  OPERATING_SYSTEMS,
  getManager,
  stackEcosystems,
} from "@/data/devPreferences";
import { Bot, Code2, Laptop, Package, SlidersHorizontal } from "lucide-react";

/**
 * "Tu entorno": gestor de paquetes (según el lenguaje de la carta elegida),
 * editor, sistema operativo y cómo trabajarás con IA. Son preferencias
 * personales: no cambian el stack, solo cómo salen los comandos y AGENTS.md.
 */
export function DevEnvironmentPanel({ stack, preferences, isLocked, onChange }) {
  const ecosystems = stackEcosystems(stack);

  return (
    <section
      aria-label="Tu entorno de trabajo"
      className="w-full rounded-2xl border border-neutral-800 bg-neutral-950/70 p-3 flex flex-col gap-2.5"
    >
      <header className="flex items-center justify-between gap-2 flex-wrap">
        <span className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-neutral-400">
          <SlidersHorizontal className="w-3.5 h-3.5 text-sky-400" />
          Tu entorno
        </span>
        <span className="text-[10px] text-neutral-500">
          Opcional · ajusta los comandos y el AGENTS.md del cierre
        </span>
      </header>

      <div
        className={`grid grid-cols-1 xs:grid-cols-2 gap-2 ${
          ecosystems.length > 1 ? "lg:grid-cols-5" : "lg:grid-cols-4"
        }`}
      >
        {ecosystems.length ? (
          ecosystems.map(({ id, role }) => {
            const eco = ECOSYSTEMS[id];
            const current = preferences.managers?.[id];
            return (
              <Field
                key={id}
                icon={Package}
                label={
                  role === "frontend"
                    ? "Gestor del frontend (JS)"
                    : `Gestor de paquetes · ${eco.label}`
                }
                hint={getManager(id, current)?.hint}
              >
                {eco.managers.length > 1 ? (
                  <Select
                    value={current}
                    disabled={isLocked}
                    onChange={(value) => onChange({ managers: { [id]: value } })}
                    options={eco.managers}
                    ariaLabel={`Gestor de paquetes de ${eco.label}`}
                  />
                ) : (
                  <span className="block px-2 py-1.5 rounded-lg border border-neutral-800 bg-neutral-900/60 text-[11px] font-mono text-neutral-300">
                    {eco.managers[0].label}
                  </span>
                )}
              </Field>
            );
          })
        ) : (
          <Field icon={Package} label="Gestor de paquetes">
            <span className="block px-2 py-1.5 rounded-lg border border-dashed border-neutral-800 text-[11px] text-neutral-500">
              Elige una carta para ver los gestores de su lenguaje
            </span>
          </Field>
        )}

        <Field icon={Code2} label="Editor">
          <Select
            value={preferences.editor}
            disabled={isLocked}
            onChange={(value) => onChange({ editor: value })}
            options={EDITORS}
            ariaLabel="Editor de código"
          />
        </Field>

        <Field icon={Laptop} label="Sistema operativo">
          <Select
            value={preferences.os}
            disabled={isLocked}
            onChange={(value) => onChange({ os: value })}
            options={OPERATING_SYSTEMS}
            ariaLabel="Sistema operativo"
          />
        </Field>

        <Field icon={Bot} label="¿Programarás con IA?">
          <Select
            value={preferences.ai}
            disabled={isLocked}
            onChange={(value) => onChange({ ai: value })}
            options={AI_MODES}
            ariaLabel="Cómo trabajarás con IA"
          />
        </Field>
      </div>
    </section>
  );
}

function Field({ icon: Icon, label, hint, children }) {
  return (
    <label className="min-w-0 flex flex-col gap-1">
      <span className="flex items-center gap-1 text-[10px] font-mono text-neutral-500 truncate">
        <Icon className="w-3 h-3 shrink-0" />
        <span className="truncate">{label}</span>
      </span>
      {children}
      {hint && (
        <span className="text-[10px] text-neutral-500 leading-snug line-clamp-1">
          {hint}
        </span>
      )}
    </label>
  );
}

function Select({ value, options, onChange, disabled, ariaLabel }) {
  return (
    <select
      value={value}
      disabled={disabled}
      aria-label={ariaLabel}
      onChange={(e) => onChange(e.target.value)}
      className="w-full min-w-0 bg-neutral-900 border border-neutral-700 hover:border-neutral-600 text-neutral-100 text-[11px] rounded-lg px-2 py-1.5 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/50 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
    >
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
