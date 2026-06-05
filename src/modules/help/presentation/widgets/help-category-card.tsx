// Scope: [M] module-help
//
// Card de categoria da base de conhecimento. Apenas apresentação. Badge de ícone
// em gradiente (tom da paleta), glow sutil no hover e contagem de artigos.

import { BaseCard } from "@/shared/widgets/base-card";
import { IconByKey } from "@/shared/design-system/icon-key";
import { ChevronRightIcon } from "@/shared/design-system/icons";
import { TONE_BADGE, TONE_HEX } from "@/shared/design-system/tones";
import type { HelpCategory } from "../../domain/models/help-content";

export function HelpCategoryCard({ category }: { category: HelpCategory }) {
  return (
    <BaseCard className="group relative isolate flex flex-col gap-3 overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)]">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-12 -z-10 size-36 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-40"
        style={{ backgroundColor: TONE_HEX[category.tone] }}
      />

      <div className="flex items-start justify-between gap-3">
        <span
          className={
            "flex size-11 shrink-0 items-center justify-center rounded-xl " +
            TONE_BADGE[category.tone]
          }
        >
          <IconByKey name={category.icon} size={22} />
        </span>
        <span className="text-noturno-grey-light/50 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-noturno-grey-light-clean">
          <ChevronRightIcon size={18} />
        </span>
      </div>

      <div className="flex flex-col gap-1">
        <h3 className="text-base font-semibold text-white">{category.title}</h3>
        <p className="text-sm leading-relaxed text-noturno-grey-light">
          {category.description}
        </p>
      </div>

      <span className="mt-1 text-xs font-medium text-noturno-grey-light/70">
        {category.articleCount} artigos
      </span>
    </BaseCard>
  );
}
