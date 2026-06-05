// Scope: [M] module-help
//
// Canais de suporte + chamada para ação (abrir chamado). Conteúdo de produto
// (estático). Os canais são ilustrativos enquanto não há integração real; o CTA
// aponta para a futura abertura de chamado de suporte.

import { BaseCard } from "@/shared/widgets/base-card";
import {
  ArrowRightIcon,
  ClockIcon,
  HeadsetIcon,
  MailIcon,
  MessageIcon,
} from "@/shared/design-system/icons";
import type { IconProps } from "@/shared/design-system/icons";
import type { ComponentType } from "react";

type Channel = {
  id: string;
  icon: ComponentType<IconProps>;
  title: string;
  detail: string;
  hint: string;
};

const CHANNELS: Channel[] = [
  {
    id: "chat",
    icon: MessageIcon,
    title: "Chat ao vivo",
    detail: "Resposta em poucos minutos",
    hint: "Seg. a Sex., 8h às 18h",
  },
  {
    id: "email",
    icon: MailIcon,
    title: "E-mail",
    detail: "suporte@noturno.com.br",
    hint: "Retorno em até 4h úteis",
  },
  {
    id: "phone",
    icon: HeadsetIcon,
    title: "Telefone",
    detail: "(11) 4000-0000",
    hint: "Seg. a Sex., 8h às 18h",
  },
];

export function HelpSupportChannels() {
  return (
    <div className="flex flex-col gap-4">
      {/* CTA principal: abrir chamado. */}
      <BaseCard className="relative isolate flex flex-col items-start gap-4 overflow-hidden p-6 sm:flex-row sm:items-center sm:justify-between">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-12 -top-16 -z-10 size-48 rounded-full bg-noturno-orange opacity-20 blur-3xl"
        />
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-noturno-orange/30 to-noturno-orange/5 text-noturno-orange ring-1 ring-inset ring-noturno-orange/25">
            <HeadsetIcon size={24} />
          </span>
          <div className="flex flex-col">
            <h3 className="text-base font-semibold text-white">
              Não encontrou o que procurava?
            </h3>
            <p className="text-sm text-noturno-grey-light">
              Abra um chamado e nossa equipe de suporte vai te ajudar.
            </p>
          </div>
        </div>

        <button
          type="button"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-noturno-orange px-4 py-2.5 text-sm font-semibold text-noturno-black transition-colors hover:bg-noturno-orange-dark"
        >
          Abrir chamado de suporte
          <ArrowRightIcon size={16} />
        </button>
      </BaseCard>

      {/* Canais de contato. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CHANNELS.map((channel) => {
          const Icon = channel.icon;
          return (
            <BaseCard
              key={channel.id}
              className="group flex flex-col gap-3 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-white/5 text-noturno-grey-light-clean ring-1 ring-inset ring-white/10 transition-colors group-hover:text-noturno-orange">
                <Icon size={20} />
              </span>
              <div className="flex flex-col gap-0.5">
                <h4 className="text-sm font-semibold text-white">
                  {channel.title}
                </h4>
                <p className="text-sm text-noturno-grey-light-clean">
                  {channel.detail}
                </p>
              </div>
              <span className="inline-flex items-center gap-1 text-xs text-noturno-grey-light/70">
                <ClockIcon size={13} />
                {channel.hint}
              </span>
            </BaseCard>
          );
        })}
      </div>
    </div>
  );
}
