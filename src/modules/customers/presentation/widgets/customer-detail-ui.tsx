// Scope: [M] module-customers
//
// Primitivos de apresentação compartilhados pelas abas do detalhe do cliente
// (Visão geral, Comercial, Financeiro, Suporte, Integrações, Administração).
// Mantêm um visual consistente (cards com cabeçalho de ícone, campos rotulados,
// pílulas por tom da paleta Noturno) e evitam duplicação entre as abas.

import type { ComponentType, ReactNode } from "react";
import type { IconProps } from "@/shared/design-system/icons";
import { BaseCard } from "@/shared/widgets/base-card";
import { ArrowRightIcon, MapPinIcon } from "@/shared/design-system/icons";
import { TONE_SOFT, type Tone } from "@/shared/design-system/tones";

/** Card de seção com cabeçalho (ícone + título) e conteúdo empilhado. */
export function Section({
  title,
  icon: Icon,
  action,
  children,
  className,
}: {
  title: string;
  icon: ComponentType<IconProps>;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <BaseCard className={"flex flex-col gap-4 p-5 " + (className ?? "")}>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-white/5 text-noturno-orange ring-1 ring-inset ring-white/10">
            <Icon size={16} />
          </span>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-noturno-grey-light-clean">
            {title}
          </h2>
        </div>
        {action}
      </div>
      <div className="flex flex-col gap-3">{children}</div>
    </BaseCard>
  );
}

/** Campo rotulado (label pequena em caixa alta + valor). */
export function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] uppercase tracking-wider text-noturno-grey-light/70">
        {label}
      </span>
      <span className="text-sm text-white">
        {value && value.trim() ? value : "—"}
      </span>
    </div>
  );
}

/** Variante de campo cujo valor é um nó (ex.: badge). */
export function Field2({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] uppercase tracking-wider text-noturno-grey-light/70">
        {label}
      </span>
      {children}
    </div>
  );
}

/** Pílula suave por tom da paleta. */
export function TonePill({
  tone,
  children,
}: {
  tone: Tone;
  children: ReactNode;
}) {
  return (
    <span
      className={
        "inline-flex w-fit items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-medium " +
        TONE_SOFT[tone]
      }
    >
      {children}
    </span>
  );
}

/** Estado vazio compacto dentro de uma seção/aba. */
export function EmptyHint({
  icon: Icon,
  children,
}: {
  icon: ComponentType<IconProps>;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-8 text-center">
      <span className="flex size-9 items-center justify-center rounded-xl bg-white/5 text-noturno-grey-light">
        <Icon size={18} />
      </span>
      <p className="max-w-sm text-sm text-noturno-grey-light">{children}</p>
    </div>
  );
}

/** Link de "ação" no rodapé de uma seção. */
export function SectionLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  // Mantido como <a> para servir tanto a rotas quanto a destinos externos; o
  // detalhe usa next/link onde for navegação interna.
  return (
    <a
      href={href}
      className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-noturno-orange transition-colors hover:text-noturno-orange-dark"
    >
      {children}
      <ArrowRightIcon size={14} />
    </a>
  );
}

/** Mapa estilizado (placeholder) com link para o Google Maps. */
export function MapPlaceholder({ query }: { query: string }) {
  return (
    <div className="relative mt-1 h-28 overflow-hidden rounded-xl border border-white/8 bg-noturno-black-3">
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-0 bg-gradient-to-br from-noturno-green/10 to-transparent"
      />
      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-noturno-green drop-shadow">
        <MapPinIcon size={28} />
      </span>
      <a
        href={`https://www.google.com/maps/search/${encodeURIComponent(query)}`}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-lg bg-noturno-black/70 px-2 py-1 text-xs text-noturno-grey-light-clean backdrop-blur transition-colors hover:text-white"
      >
        Ver no mapa
        <ArrowRightIcon size={12} />
      </a>
    </div>
  );
}
