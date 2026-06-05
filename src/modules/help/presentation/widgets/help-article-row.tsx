// Scope: [M] module-help
//
// Linha de artigo da base de conhecimento. Título, resumo, tempo de leitura e
// metadados; tags como chips discretos. Apenas apresentação.

import { BaseCard } from "@/shared/widgets/base-card";
import {
  ArrowRightIcon,
  ClockIcon,
  FileTextIcon,
} from "@/shared/design-system/icons";
import type { HelpArticle } from "../../domain/models/help-content";

export function HelpArticleRow({ article }: { article: HelpArticle }) {
  return (
    <BaseCard className="group flex items-start gap-4 p-4 transition-all duration-300 hover:border-white/15 hover:bg-white/[0.05]">
      <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-white/5 text-noturno-grey-light-clean ring-1 ring-inset ring-white/10">
        <FileTextIcon size={18} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h4 className="text-sm font-semibold text-white group-hover:text-noturno-orange">
          {article.title}
        </h4>
        <p className="line-clamp-2 text-sm text-noturno-grey-light">
          {article.excerpt}
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-noturno-grey-light/70">
          <span className="inline-flex items-center gap-1">
            <ClockIcon size={13} />
            {article.readingTimeLabel}
          </span>
          <span>{article.updatedAtLabel}</span>
          {article.tags?.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-noturno-grey-light-clean"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>

      <span
        aria-hidden="true"
        className="mt-1 shrink-0 text-noturno-grey-light/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-noturno-orange"
      >
        <ArrowRightIcon size={16} />
      </span>
    </BaseCard>
  );
}
