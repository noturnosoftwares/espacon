// Scope: [M] module-help
//
// Item da timeline de Novidades (changelog). Marcador colorido por tipo, tag e
// data. Apenas apresentação.

import { IconByKey } from "@/shared/design-system/icon-key";
import type {
  HelpNews,
  HelpNewsKind,
} from "../../domain/models/help-content";
import type { IconKey } from "@/shared/design-system/icon-key";

const KIND_STYLE: Record<
  HelpNewsKind,
  { chip: string; dot: string; icon: IconKey }
> = {
  Novo: {
    chip: "bg-noturno-green/10 text-noturno-green",
    dot: "bg-noturno-green",
    icon: "sparkles",
  },
  Melhoria: {
    chip: "bg-noturno-blue-light/10 text-noturno-blue-light",
    dot: "bg-noturno-blue-light",
    icon: "rocket",
  },
  Correção: {
    chip: "bg-noturno-orange/10 text-noturno-orange",
    dot: "bg-noturno-orange",
    icon: "shield",
  },
};

export function HelpNewsItem({
  news,
  last,
}: {
  news: HelpNews;
  last: boolean;
}) {
  const style = KIND_STYLE[news.kind];

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Linha vertical da timeline. */}
      {!last && (
        <span
          aria-hidden="true"
          className="absolute left-[19px] top-10 bottom-0 w-px bg-white/8"
        />
      )}

      <span
        className={
          "relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-white/5 ring-1 ring-inset ring-white/10 " +
          style.chip.split(" ")[1]
        }
      >
        <IconByKey name={style.icon} size={18} />
      </span>

      <div className="flex flex-1 flex-col gap-1 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={
              "rounded-full px-2 py-0.5 text-[11px] font-medium " + style.chip
            }
          >
            {news.kind}
          </span>
          <span className="text-xs text-noturno-grey-light/70">
            {news.dateLabel}
          </span>
        </div>
        <h4 className="text-sm font-semibold text-white">{news.title}</h4>
        <p className="text-sm text-noturno-grey-light">{news.description}</p>
      </div>
    </li>
  );
}
