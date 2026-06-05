// Scope: [M] module-help
//
// Card de tutorial guiado. Badge de ícone em gradiente (tom), pílula de nível,
// duração e play overlay no hover. Apenas apresentação.

import { BaseCard } from "@/shared/widgets/base-card";
import { IconByKey } from "@/shared/design-system/icon-key";
import { ClockIcon, PlayCircleIcon } from "@/shared/design-system/icons";
import { TONE_BADGE, TONE_HEX } from "@/shared/design-system/tones";
import type { HelpTutorial } from "../../domain/models/help-content";

const LEVEL_CLASS: Record<HelpTutorial["level"], string> = {
  Iniciante: "bg-noturno-green/10 text-noturno-green",
  Intermediário: "bg-noturno-blue-light/10 text-noturno-blue-light",
  Avançado: "bg-noturno-orange/10 text-noturno-orange",
};

export function HelpTutorialCard({ tutorial }: { tutorial: HelpTutorial }) {
  return (
    <BaseCard className="group relative isolate flex flex-col gap-4 overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 -z-10 size-36 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: TONE_HEX[tutorial.tone] }}
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={
            "flex size-11 shrink-0 items-center justify-center rounded-xl " +
            TONE_BADGE[tutorial.tone]
          }
        >
          <IconByKey name={tutorial.icon} size={22} />
        </span>
        <span className="text-noturno-grey-light/40 transition-all duration-300 group-hover:scale-110 group-hover:text-white">
          <PlayCircleIcon size={26} />
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-white">{tutorial.title}</h3>
        <p className="text-sm leading-relaxed text-noturno-grey-light">
          {tutorial.description}
        </p>
      </div>

      <div className="mt-auto flex items-center gap-2">
        <span
          className={
            "rounded-full px-2 py-0.5 text-[11px] font-medium " +
            LEVEL_CLASS[tutorial.level]
          }
        >
          {tutorial.level}
        </span>
        <span className="inline-flex items-center gap-1 text-xs text-noturno-grey-light/70">
          <ClockIcon size={13} />
          {tutorial.durationLabel}
        </span>
      </div>
    </BaseCard>
  );
}
