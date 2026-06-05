// Scope: [M] module-home
//
// Card de widget do dashboard — componente independente (ver home-layout.md).
// Dois layouts conforme o tamanho:
//  - sm  → contador compacto (badge + valor + tendência + sparkline);
//  - md/lg → card rico (badge em gradiente, valor em destaque, pílula de
//    tendência, sparkline, watermark, acento/glow se `featured`) e, havendo
//    `detailHref`, o link "Ver detalhes".
// Apenas apresentação; o tom mapeia para a paleta Noturno.

import Link from "next/link";
import { BaseCard } from "@/shared/widgets/base-card";
import { Sparkline } from "@/shared/widgets/sparkline";
import { IconByKey } from "@/shared/design-system/icon-key";
import { TONE_BADGE, TONE_HEX } from "@/shared/design-system/tones";
import {
  ArrowDownRightIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
} from "@/shared/design-system/icons";
import type { DashboardWidget } from "../../domain/models/dashboard-widget";

function TrendPill({
  widget,
}: {
  widget: DashboardWidget;
}) {
  const trend = widget.trend;
  if (!trend) return null;
  const good = trend.positive ?? trend.direction === "up";
  return (
    <span
      className={
        "inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium " +
        (good
          ? "bg-noturno-green/10 text-noturno-green"
          : "bg-noturno-red/10 text-noturno-red")
      }
    >
      {trend.direction === "up" ? (
        <ArrowUpRightIcon size={13} />
      ) : (
        <ArrowDownRightIcon size={13} />
      )}
      {trend.label}
    </span>
  );
}

export function DashboardWidgetCard({
  widget,
  className = "",
}: {
  widget: DashboardWidget;
  className?: string;
}) {
  const toneHex = TONE_HEX[widget.tone];

  // ----- Contador compacto (sm) -----
  if (widget.size === "sm") {
    return (
      <BaseCard
        className={
          "group flex h-full flex-col gap-3 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 " +
          className
        }
      >
        <div className="flex items-center gap-3">
          <span
            className={
              "flex size-10 shrink-0 items-center justify-center rounded-xl " +
              TONE_BADGE[widget.tone]
            }
          >
            <IconByKey name={widget.icon} size={20} />
          </span>
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="truncate text-xs text-noturno-grey-light">
              {widget.title}
            </span>
            <span className="text-xl font-semibold tracking-tight text-white">
              {widget.value}
            </span>
          </div>
          {widget.spark && (
            <Sparkline
              data={widget.spark}
              stroke={toneHex}
              width={64}
              height={32}
              className="shrink-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
            />
          )}
        </div>
        <TrendPill widget={widget} />
      </BaseCard>
    );
  }

  // ----- Card rico (md / lg) -----
  const isLarge = widget.size === "lg";

  return (
    <BaseCard
      className={
        "group relative isolate flex h-full flex-col gap-4 overflow-hidden p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:shadow-[0_18px_40px_-20px_rgba(0,0,0,0.8)] " +
        className
      }
      style={
        widget.featured
          ? ({
              boxShadow: `0 0 0 1px ${toneHex}1f, inset 0 1px 0 0 rgba(255,255,255,0.05)`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {/* Acento no topo (apenas featured). */}
      {widget.featured && (
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[3px] rounded-t-2xl"
          style={{
            background: `linear-gradient(90deg, ${toneHex}, ${toneHex}33)`,
          }}
        />
      )}

      {/* Glow radial de fundo na cor do tom. */}
      <span
        aria-hidden="true"
        className={
          "pointer-events-none absolute -right-10 -top-12 -z-10 size-40 rounded-full blur-2xl transition-opacity duration-300 " +
          (widget.featured
            ? "opacity-50 group-hover:opacity-70"
            : "opacity-0 group-hover:opacity-40")
        }
        style={{ backgroundColor: toneHex }}
      />

      {/* Watermark do ícone ao fundo. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-5 -right-3 -z-10 text-white/[0.04] transition-transform duration-300 group-hover:scale-110"
      >
        <IconByKey name={widget.icon} size={isLarge ? 140 : 110} strokeWidth={1.25} />
      </span>

      {/* Cabeçalho: badge + título/subtítulo + sparkline. */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className={
              "flex size-11 shrink-0 items-center justify-center rounded-xl " +
              TONE_BADGE[widget.tone]
            }
          >
            <IconByKey name={widget.icon} size={22} />
          </span>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-noturno-grey-light-clean">
              {widget.title}
            </span>
            {widget.subtitle && (
              <span className="text-xs text-noturno-grey-light">
                {widget.subtitle}
              </span>
            )}
          </div>
        </div>

        {widget.spark && (
          <Sparkline
            data={widget.spark}
            stroke={toneHex}
            width={isLarge ? 120 : 96}
            className="mt-0.5 shrink-0 opacity-80 transition-opacity duration-300 group-hover:opacity-100"
          />
        )}
      </div>

      {/* Valor principal. */}
      <div className="flex flex-col gap-1">
        <span
          className={
            "font-semibold tracking-tight text-white " +
            (isLarge ? "text-4xl" : "text-3xl")
          }
        >
          {widget.value}
        </span>
        {widget.hint && (
          <span className="text-xs text-noturno-grey-light">{widget.hint}</span>
        )}
      </div>

      <TrendPill widget={widget} />

      {/* Link de detalhe. */}
      {widget.detailHref && (
        <Link
          href={widget.detailHref}
          className="mt-auto inline-flex w-fit items-center gap-1 pt-1 text-xs font-semibold text-noturno-orange transition-colors hover:text-noturno-orange-dark"
        >
          {widget.detailLabel ?? "Ver detalhes"}
          <ArrowRightIcon size={14} />
        </Link>
      )}
    </BaseCard>
  );
}
