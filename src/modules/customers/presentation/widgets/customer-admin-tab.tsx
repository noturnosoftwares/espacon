// Scope: [M] module-customers
//
// Aba "Administração" do detalhe: sócios (apenas PJ), instalações em uso,
// histórico de eventos (timeline), anotações internas e registro de bloqueio.
// Mock-first (gerador determinístico).

import {
  BlockIcon,
  BuildingIcon,
  CheckCircleIcon,
  ClockIcon,
  FileTextIcon,
  UsersIcon,
} from "@/shared/design-system/icons";
import { formatDateBR } from "@/shared/helpers/format";
import type { Tone } from "@/shared/design-system/tones";
import { TONE_HEX } from "@/shared/design-system/tones";
import type { Customer, HistoryEntryType } from "../../domain/models/customer";
import { EmptyHint, Field, Section, TonePill } from "./customer-detail-ui";

const HISTORY_TONE: Record<HistoryEntryType, Tone> = {
  cadastro: "neutral",
  contrato: "blue",
  financeiro: "orange",
  bloqueio: "red",
  desbloqueio: "green",
  assinatura: "green",
  integracao: "blue",
};

export function CustomerAdminTab({ customer }: { customer: Customer }) {
  const partners = customer.partners ?? [];
  const installations = customer.installations ?? [];
  const history = customer.history ?? [];
  const notes = customer.notes ?? [];
  const isPj = customer.personType === "pj";

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Bloqueio (destaque no topo quando existir). */}
      {customer.block && (
        <div className="lg:col-span-2">
          <Section title="Bloqueio" icon={BlockIcon}>
            <div className="rounded-2xl border border-noturno-red/25 bg-noturno-red/[0.06] p-4">
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                <Field label="Motivo" value={customer.block.reason} />
                <Field label="Responsável" value={customer.block.responsible} />
                <Field label="Data" value={formatDateBR(customer.block.date)} />
              </div>
              {customer.block.note && (
                <p className="mt-3 text-sm text-noturno-grey-light">
                  {customer.block.note}
                </p>
              )}
            </div>
          </Section>
        </div>
      )}

      {/* Sócios (PJ). */}
      {isPj && (
        <Section title="Sócios" icon={UsersIcon}>
          {partners.length === 0 ? (
            <EmptyHint icon={UsersIcon}>Nenhum sócio cadastrado.</EmptyHint>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {partners.map((p) => (
                <li
                  key={p.id}
                  className="flex flex-col gap-1.5 rounded-xl bg-white/[0.03] p-3"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-medium text-white">{p.name}</span>
                    {p.legalRepresentative && (
                      <TonePill tone="blue">Representante legal</TonePill>
                    )}
                    {p.mustSign && (
                      <TonePill tone={p.signed ? "green" : "orange"}>
                        {p.signed ? "Assinou" : "Pendente"}
                      </TonePill>
                    )}
                  </div>
                  <span className="text-[11px] text-noturno-grey-light/70">
                    {p.document}
                    {p.email ? ` · ${p.email}` : ""}
                    {p.mobile ? ` · ${p.mobile}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      )}

      {/* Instalações. */}
      <Section
        title="Instalações"
        icon={BuildingIcon}
        className={isPj ? "" : "lg:col-span-2"}
      >
        {installations.length === 0 ? (
          <EmptyHint icon={BuildingIcon}>
            Nenhuma instalação ativa registrada.
          </EmptyHint>
        ) : (
          <ul className="flex flex-col gap-2">
            {installations.map((inst) => (
              <li
                key={inst.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white">
                    {inst.computerName}
                  </span>
                  <span className="text-[11px] text-noturno-grey-light/70">
                    {inst.server} · {inst.environment}
                  </span>
                </div>
                <TonePill tone="neutral">{inst.type}</TonePill>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Histórico (timeline). */}
      <Section title="Histórico" icon={ClockIcon} className="lg:col-span-2">
        {history.length === 0 ? (
          <EmptyHint icon={ClockIcon}>Sem eventos registrados.</EmptyHint>
        ) : (
          <ol className="relative flex flex-col gap-4 pl-5">
            <span
              aria-hidden="true"
              className="absolute left-[5px] top-1.5 bottom-1.5 w-px bg-white/10"
            />
            {history.map((h) => (
              <li key={h.id} className="relative flex flex-col gap-0.5">
                <span
                  aria-hidden="true"
                  className="absolute -left-5 top-1.5 size-2.5 rounded-full ring-2 ring-noturno-black"
                  style={{ backgroundColor: TONE_HEX[HISTORY_TONE[h.type]] }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-white">{h.title}</span>
                  <span className="text-[11px] text-noturno-grey-light/70">
                    {formatDateBR(h.date)}
                    {h.user ? ` · ${h.user}` : ""}
                  </span>
                </div>
                {h.description && (
                  <span className="text-xs text-noturno-grey-light">
                    {h.description}
                  </span>
                )}
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Anotações. */}
      <Section
        title="Anotações internas"
        icon={FileTextIcon}
        className="lg:col-span-2"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] text-noturno-grey-light/70">
            <CheckCircleIcon size={12} />
            Não exibidas ao cliente
          </span>
        }
      >
        {notes.length === 0 ? (
          <EmptyHint icon={FileTextIcon}>Nenhuma anotação interna.</EmptyHint>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {notes.map((n) => (
              <li
                key={n.id}
                className="flex flex-col gap-1 rounded-xl bg-white/[0.03] p-3"
              >
                <p className="text-sm text-white">{n.text}</p>
                <span className="text-[11px] text-noturno-grey-light/70">
                  {formatDateBR(n.date)} · {n.author}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}
