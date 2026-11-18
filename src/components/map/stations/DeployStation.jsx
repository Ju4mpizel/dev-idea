"use client";

import {
  Cloud,
  Server,
  Database,
  GitBranch,
  Workflow,
  HardDrive,
  Monitor,
  Plus,
  Wallet,
  Rocket,
} from "lucide-react";
import { TechIcon } from "@/components/ui/TechChip";
import { getTechIcon } from "@/lib/techIcons";
import { OptionStation } from "./OptionStation";
import { SelectionCard, CardSection } from "./SelectionCard";

/** Etiqueta y ícono de respaldo por papel (si el servicio no tiene logo). */
const ROLE_META = {
  hosting: { label: "Hosting", Icon: Cloud },
  frontend: { label: "Frontend", Icon: Monitor },
  backend: { label: "Backend", Icon: Server },
  database: { label: "Base de datos", Icon: Database },
  repo: { label: "Repositorio", Icon: GitBranch },
  ci: { label: "CI / CD", Icon: Workflow },
  storage: { label: "Archivos", Icon: HardDrive },
};

const roleMeta = (role) => ROLE_META[role] || ROLE_META.hosting;

/** Halo suave del color de la marca (los logos negros usan un halo neutro). */
function glowOf(name) {
  const hex = getTechIcon(name)?.hex;
  if (!hex || parseInt(hex, 16) < 0x333333) return "rgba(255,255,255,0.10)";
  return `#${hex}40`;
}

/** Logo de un servicio: el de simple-icons o, si no existe, el ícono de su papel. */
function ProviderLogo({ provider, size }) {
  if (getTechIcon(provider.name)) {
    return <TechIcon name={provider.name} size={size} />;
  }
  const { Icon } = roleMeta(provider.role);
  return (
    <Icon className="text-neutral-300" style={{ width: size, height: size }} />
  );
}

/** Servicio destacado: logo grande, nombre y papel. */
function BigProvider({ provider }) {
  return (
    <div className="flex flex-col items-center gap-1.5 min-w-0 flex-1">
      <span
        title={provider.name}
        className="w-16 h-16 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center"
        style={{ boxShadow: `0 0 28px ${glowOf(provider.name)}` }}
      >
        <ProviderLogo provider={provider} size={34} />
      </span>
      <span className="text-[11px] font-semibold text-neutral-100 text-center leading-tight truncate max-w-full">
        {provider.name}
      </span>
      <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-500">
        {roleMeta(provider.role).label}
      </span>
    </div>
  );
}

/**
 * Escenario de logos de un plan: el servicio principal y GitHub en grande
 * (unidos por un "+"), y el resto de piezas en chips más pequeños.
 */
export function DeployProviders({ providers = [] }) {
  if (!providers.length) return null;
  const repo = providers.find((p) => p.role === "repo") || null;
  const main = providers.find((p) => p !== repo) || null;
  const big = [main, repo].filter(Boolean);
  const rest = providers.filter((p) => !big.includes(p));

  return (
    <div className="mb-3 rounded-xl border border-neutral-800 bg-gradient-to-b from-neutral-900 to-neutral-950 px-3 pt-4 pb-3">
      <div className="flex items-start justify-center gap-2">
        {big.map((provider, i) => (
          <div key={provider.name} className="contents">
            {i > 0 && (
              <Plus className="w-4 h-4 text-neutral-600 shrink-0 mt-6" />
            )}
            <BigProvider provider={provider} />
          </div>
        ))}
      </div>

      {rest.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-neutral-800/80 flex flex-wrap justify-center gap-1.5">
          {rest.map((provider) => (
            <span
              key={provider.name}
              title={roleMeta(provider.role).label}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-800 text-[10px] font-mono text-neutral-300"
            >
              <ProviderLogo provider={provider} size={14} />
              {provider.name}
              <span className="text-neutral-500">
                · {roleMeta(provider.role).label}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

/** Pasos numerados para publicar por primera vez. */
function DeploySteps({ steps = [] }) {
  if (!steps.length) return null;
  return (
    <CardSection
      label="Cómo publicarlo"
      icon={<Rocket className="w-3 h-3 text-emerald-400" />}
    >
      <ol className="space-y-1.5">
        {steps.map((step, i) => (
          <li
            key={`${i}-${step}`}
            className="flex items-start gap-2 text-[11px] text-neutral-300 leading-snug"
          >
            <span className="w-4 h-4 rounded-full bg-emerald-950/60 border border-emerald-800/70 text-emerald-300 text-[9px] font-mono flex items-center justify-center shrink-0 mt-px">
              {i + 1}
            </span>
            <span>{step}</span>
          </li>
        ))}
      </ol>
    </CardSection>
  );
}

/** Estación de deploy: cada plan muestra en grande dónde vivirá el proyecto. */
export function DeployStation({ station, data, onNext, onGenerate }) {
  return (
    <OptionStation
      station={station}
      data={data}
      onNext={onNext}
      onGenerate={onGenerate}
      selectMessage={(o) => {
        const main = o.providers?.find((p) => p.role !== "repo")?.name;
        return main
          ? `${main} + GitHub: cada push publica una versión nueva. Así se trabaja en serio.`
          : `"${o.title}" anotado. Recuerda: código que no está en GitHub, no existe.`;
      }}
      renderCard={(option, { isSelected, isDimmed, levelLabelOf }) => (
        <SelectionCard
          title={option.title}
          subtitle={option.summary}
          tag={option.tag}
          level={option.level}
          levelLabel={levelLabelOf(option.level)}
          beginnerTip={option.beginnerTip}
          pros={option.pros}
          cons={option.cons}
          isSelected={isSelected}
          isDimmed={isDimmed}
          media={<DeployProviders providers={option.providers} />}
          footer={
            option.cost ? (
              <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono text-emerald-300">
                <Wallet className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{option.cost}</span>
              </div>
            ) : null
          }
        >
          <DeploySteps steps={option.steps} />
        </SelectionCard>
      )}
      rewriteDescription="Se desbloquearán los planes de deploy. El ecosistema de IA y el cierre calculados después se descartarán."
    />
  );
}
