// Scope: [M] module-customers
//
// Aba "Suporte" do detalhe: indicadores de chamados e a lista de tickets
// (abertos/em andamento/resolvidos) com prioridade, canal e responsável.
// Mock-first (gerador determinístico).

import {
  HeadsetIcon,
  LifebuoyIcon,
  MessageIcon,
} from "@/shared/design-system/icons";
import { formatDateBR } from "@/shared/helpers/format";
import type { Customer, SupportTicket } from "../../domain/models/customer";
import {
  TICKET_PRIORITY_LABEL,
  TICKET_PRIORITY_TONE,
  TICKET_STATUS_LABEL,
  TICKET_STATUS_TONE,
} from "../customer-labels";
import { EmptyHint, Section, TonePill } from "./customer-detail-ui";

function isOpen(t: SupportTicket): boolean {
  return t.status === "aberto" || t.status === "em-andamento";
}

export function CustomerSupportTab({ customer }: { customer: Customer }) {
  const tickets = customer.tickets ?? [];
  const open = tickets.filter((t) => t.status === "aberto").length;
  const inProgress = tickets.filter((t) => t.status === "em-andamento").length;
  const closed = tickets.filter(
    (t) => t.status === "resolvido" || t.status === "fechado",
  ).length;

  // Abertos primeiro, depois por data desc.
  const sorted = [...tickets].sort((a, b) => {
    if (isOpen(a) !== isOpen(b)) return isOpen(a) ? -1 : 1;
    return a.openedAt < b.openedAt ? 1 : -1;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Abertos" value={open} tone="orange" />
        <Stat label="Em andamento" value={inProgress} tone="blue" />
        <Stat label="Resolvidos" value={closed} tone="green" />
      </div>

      <Section
        title="Chamados"
        icon={LifebuoyIcon}
        action={
          customer.lastServiceLabel ? (
            <span className="text-xs text-noturno-grey-light">
              Último atendimento: {customer.lastServiceLabel}
            </span>
          ) : undefined
        }
      >
        {sorted.length === 0 ? (
          <EmptyHint icon={HeadsetIcon}>
            Nenhum chamado registrado para este cliente.
          </EmptyHint>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {sorted.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-start justify-between gap-3 rounded-xl bg-white/[0.03] p-3"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono text-noturno-grey-light/70">
                      {t.code}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {t.subject}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] text-noturno-grey-light/70">
                    <MessageIcon size={12} />
                    {t.channel}
                    {" · "}
                    {formatDateBR(t.openedAt)}
                    {t.agent ? ` · ${t.agent}` : ""}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <TonePill tone={TICKET_PRIORITY_TONE[t.priority]}>
                    {TICKET_PRIORITY_LABEL[t.priority]}
                  </TonePill>
                  <TonePill tone={TICKET_STATUS_TONE[t.status]}>
                    {TICKET_STATUS_LABEL[t.status]}
                  </TonePill>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "orange" | "blue" | "green";
}) {
  const dot = {
    orange: "bg-noturno-orange",
    blue: "bg-noturno-blue-light",
    green: "bg-noturno-green",
  }[tone];
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-noturno-grey-light/70">
        <span className={"size-1.5 rounded-full " + dot} aria-hidden="true" />
        {label}
      </span>
      <span className="text-2xl font-semibold tracking-tight text-white">
        {value}
      </span>
    </div>
  );
}
