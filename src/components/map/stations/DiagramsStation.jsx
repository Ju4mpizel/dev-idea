"use client";

import { OptionStation } from "./OptionStation";
import { SelectionCard } from "./SelectionCard";
import { MermaidPreviewButton } from "./MermaidPreview";
import {
  Users,
  Boxes,
  GitCommitHorizontal,
  Activity,
  ToggleRight,
  FolderTree,
  Server,
  Globe,
  Container,
  Database,
  ArrowRightLeft,
  Briefcase,
  Workflow,
  LayoutTemplate,
  Route,
  Cloud,
  GraduationCap,
  Building2,
} from "lucide-react";

/** Nombre legible e ícono de cada tipo de diagrama. */
const DIAGRAM_META = {
  "use-case": { label: "Casos de uso", Icon: Users, color: "text-sky-400" },
  class: { label: "Clases", Icon: Boxes, color: "text-amber-400" },
  sequence: {
    label: "Secuencia",
    Icon: GitCommitHorizontal,
    color: "text-purple-400",
  },
  activity: { label: "Actividades", Icon: Activity, color: "text-pink-400" },
  state: { label: "Estados", Icon: ToggleRight, color: "text-orange-400" },
  components: {
    label: "Componentes",
    Icon: FolderTree,
    color: "text-amber-300",
  },
  deployment: { label: "Despliegue", Icon: Server, color: "text-cyan-400" },
  "c4-context": { label: "C4 · Contexto", Icon: Globe, color: "text-blue-400" },
  "c4-container": {
    label: "C4 · Contenedores",
    Icon: Container,
    color: "text-blue-300",
  },
  erd: { label: "Entidad-Relación", Icon: Database, color: "text-emerald-400" },
  dfd: {
    label: "Flujo de datos",
    Icon: ArrowRightLeft,
    color: "text-teal-400",
  },
  bpmn: { label: "BPMN", Icon: Briefcase, color: "text-lime-400" },
  flowchart: { label: "Flujo", Icon: Workflow, color: "text-neutral-300" },
  wireflow: {
    label: "Wireflow",
    Icon: LayoutTemplate,
    color: "text-rose-400",
  },
  "user-journey": {
    label: "User Journey",
    Icon: Route,
    color: "text-fuchsia-400",
  },
  architecture: {
    label: "Arquitectura cloud",
    Icon: Cloud,
    color: "text-cyan-300",
  },
};

const AUDIENCE = {
  Universidad: { Icon: GraduationCap, text: "Se ve en la universidad" },
  Industria: { Icon: Building2, text: "Muy usado en la industria" },
  Ambos: { Icon: GraduationCap, text: "Universidad e industria" },
};

export function DiagramsStation({ station, data, onNext, onGenerate }) {
  return (
    <OptionStation
      station={station}
      data={data}
      onNext={onNext}
      onGenerate={onGenerate}
      selectMessage={(d) =>
        `"${d.title}" a tu documentación. Dibuja solo lo que vayas a mantener.`
      }
      renderCard={(d, { isSelected, isDimmed, levelLabelOf }) => {
        const meta = DIAGRAM_META[d.diagramType] || DIAGRAM_META.flowchart;
        const audience = AUDIENCE[d.audience] || AUDIENCE.Ambos;
        return (
          <SelectionCard
            title={d.title}
            subtitle={d.summary}
            tag={`${d.category} · ${meta.label}`}
            level={d.level}
            levelLabel={levelLabelOf(d.level)}
            beginnerTip={d.beginnerTip}
            pros={d.pros}
            cons={d.cons}
            techs={d.techs || []}
            isSelected={isSelected}
            isDimmed={isDimmed}
            media={
              <div className="flex items-center gap-2 mb-3">
                <span className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center">
                  <meta.Icon className={`w-5 h-5 ${meta.color}`} />
                </span>
                <span className="text-[10px] sm:text-[11px] font-mono text-neutral-400 flex items-center gap-1">
                  <audience.Icon className="w-3.5 h-3.5" />
                  {audience.text}
                </span>
              </div>
            }
            footer={
              <MermaidPreviewButton title={d.title} source={d.sampleMermaid} />
            }
          />
        );
      }}
      rewriteDescription="Se desbloqueará la selección de diagramas. El estilo visual y todo lo calculado después se descartarán."
    />
  );
}
