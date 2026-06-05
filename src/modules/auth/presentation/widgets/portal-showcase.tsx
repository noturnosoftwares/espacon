// Scope: [M] module-auth
//
// Coluna direita da tela inicial: apresentação institucional do portal. Reforça
// a marca Noturno e o valor do sistema (pilares e diferenciais). Conteúdo
// derivado da documentação do produto (módulos e escopo multiempresa).

import { BaseCard } from "@/shared/widgets/base-card";
import { BrandMark } from "@/shared/widgets/brand-mark";
import {
  BuildingIcon,
  ChartIcon,
  HeadsetIcon,
  ShieldIcon,
  WalletIcon,
  type IconProps,
} from "@/shared/design-system/icons";
import type { ComponentType } from "react";

type Pillar = {
  icon: ComponentType<IconProps>;
  title: string;
  description: string;
};

const PILLARS: Pillar[] = [
  {
    icon: BuildingIcon,
    title: "Comercial",
    description: "Clientes, contratos, planos, licenças e representantes.",
  },
  {
    icon: HeadsetIcon,
    title: "Atendimento",
    description: "CRM, chamados, histórico e canais integrados.",
  },
  {
    icon: WalletIcon,
    title: "Financeiro",
    description: "Contas, fluxo de caixa, comissões e cobranças.",
  },
  {
    icon: ChartIcon,
    title: "Administrativo",
    description: "Franquias, permissões, indicadores e auditoria.",
  },
];

const HIGHLIGHTS = [
  "Multiempresa: matriz, franquias e representantes",
  "Acesso granular por perfil e escopo",
  "Preparado para escalar por muitos anos",
];

export function PortalShowcase() {
  return (
    <div className="relative flex h-full flex-col justify-between gap-10 p-10 xl:p-14">
      {/* Brilho discreto da marca ao fundo. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-noturno-orange/20 blur-[120px]"
      />

      <div className="relative animate-fade-in">
        <BrandMark product="HelpDesk" size="lg" />
      </div>

      <div className="relative flex flex-col gap-4 animate-slide-up">
        <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight text-white xl:text-4xl">
          Toda a operação da Noturno em uma só plataforma.
        </h2>
        <p className="max-w-md text-sm leading-relaxed text-noturno-grey-light">
          Gestão comercial, atendimento, financeiro e administrativo —
          centralizados, documentados e prontos para a expansão da rede de
          franquias.
        </p>
      </div>

      <div className="relative grid grid-cols-2 gap-3 animate-slide-up">
        {PILLARS.map(({ icon: Icon, title, description }) => (
          <BaseCard key={title} className="flex flex-col gap-2 p-4">
            <span className="flex size-9 items-center justify-center rounded-lg bg-noturno-orange/10 text-noturno-orange">
              <Icon size={18} />
            </span>
            <span className="text-sm font-semibold text-white">{title}</span>
            <span className="text-xs leading-relaxed text-noturno-grey-light">
              {description}
            </span>
          </BaseCard>
        ))}
      </div>

      <ul className="relative flex flex-col gap-2.5 animate-fade-in">
        {HIGHLIGHTS.map((item) => (
          <li
            key={item}
            className="flex items-center gap-2.5 text-sm text-noturno-grey-light-clean"
          >
            <ShieldIcon size={16} className="shrink-0 text-noturno-green" />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
