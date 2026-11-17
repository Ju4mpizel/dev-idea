"use client";

import { OptionStation } from "./OptionStation";
import { CardSection, CardList } from "./SelectionCard";
import { ListChecks, Gauge } from "lucide-react";

/** Estación 2: módulos con requisitos funcionales (RF) y no funcionales (RNF). */
export function RequirementsStation({ station, data, onNext, onGenerate }) {
  return (
    <OptionStation
      station={station}
      data={data}
      onNext={onNext}
      onGenerate={onGenerate}
      selectMessage={(m) =>
        `Módulo "${m.title}" dentro. Elige solo lo que de verdad necesita tu primera versión.`
      }
      renderExtra={(m) => (
        <>
          <CardSection
            label="Requisitos funcionales (RF)"
            icon={<ListChecks className="w-3 h-3 text-sky-400" />}
          >
            <CardList
              items={m.functional}
              marker="RF"
              markerClass="text-sky-500 text-[9px] mt-px"
            />
          </CardSection>
          <CardSection
            label="Requisitos no funcionales (RNF)"
            icon={<Gauge className="w-3 h-3 text-violet-400" />}
          >
            <CardList
              items={m.nonFunctional}
              marker="RNF"
              markerClass="text-violet-400 text-[9px] mt-px"
            />
          </CardSection>
        </>
      )}
      rewriteDescription="Se desbloquearán los módulos. Las historias, el stack y todo lo calculado después se descartarán."
    />
  );
}
