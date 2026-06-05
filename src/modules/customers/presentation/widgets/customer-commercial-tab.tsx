// Scope: [M] module-customers
//
// Aba "Comercial" do detalhe: contrato vigente (plano + licenciamento), aditivos
// contratuais, ferramentas adicionais e representação. Dados mock-first vindos do
// provider (gerador determinístico).

import {
  FileTextIcon,
  KeyIcon,
  ShieldIcon,
  WalletIcon,
  ZapIcon,
} from "@/shared/design-system/icons";
import { formatCurrencyBRL, formatDateBR } from "@/shared/helpers/format";
import { CustomerRules } from "../../domain/models/customer-rules";
import type { Customer } from "../../domain/models/customer";
import {
  AMENDMENT_LABEL,
  OWNER_LABEL,
} from "../customer-labels";
import { SignBadge } from "./customer-badges";
import {
  EmptyHint,
  Field,
  Section,
  TonePill,
} from "./customer-detail-ui";

export function CustomerCommercialTab({ customer }: { customer: Customer }) {
  const { contract, representation } = customer;
  const available = Math.max(
    0,
    contract.computersContracted - contract.computersInstalled,
  );
  const usedPct = contract.computersContracted
    ? Math.round((contract.computersInstalled / contract.computersContracted) * 100)
    : 0;
  const canReleaseKeys = CustomerRules.canReleaseKeys(contract.signStatus);
  const amendments = customer.amendments ?? [];
  const tools = customer.tools ?? [];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {/* Contrato vigente + licenciamento. */}
      <Section title="Contrato vigente" icon={WalletIcon} className="lg:col-span-2">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Plano" value={contract.plan} />
          <Field label="Modalidade" value={contract.modality} />
          <Field label="Data do contrato" value={formatDateBR(contract.contractDate)} />
          <Field label="Mensalidade" value={formatCurrencyBRL(contract.monthlyValue)} />
        </div>

        <div className="mt-1 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-noturno-grey-light">
            <span>
              Licenças: {contract.computersInstalled}/{contract.computersContracted}{" "}
              instaladas
            </span>
            <span>{available} disponíveis</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-noturno-orange to-noturno-orange-dark"
              style={{ width: `${usedPct}%` }}
            />
          </div>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <SignBadge status={contract.signStatus} />
          <TonePill tone={canReleaseKeys ? "green" : "orange"}>
            <KeyIcon size={13} />
            {canReleaseKeys ? "Chaves liberadas" : "Chaves bloqueadas"}
          </TonePill>
        </div>
      </Section>

      {/* Aditivos contratuais. */}
      <Section title="Aditivos contratuais" icon={FileTextIcon}>
        {amendments.length === 0 ? (
          <EmptyHint icon={FileTextIcon}>
            Nenhum aditivo registrado para este contrato.
          </EmptyHint>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {amendments.map((a) => (
              <li
                key={a.id}
                className="flex items-start justify-between gap-3 rounded-xl bg-white/[0.03] p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-white">
                    {AMENDMENT_LABEL[a.type]}
                  </span>
                  {a.note && (
                    <span className="text-xs text-noturno-grey-light">{a.note}</span>
                  )}
                  <span className="text-[11px] text-noturno-grey-light/70">
                    {formatDateBR(a.date)} · {a.responsible}
                  </span>
                </div>
                <span
                  className={
                    "shrink-0 text-sm font-semibold " +
                    (a.value < 0 ? "text-noturno-red" : "text-noturno-green")
                  }
                >
                  {a.value < 0 ? "−" : "+"}
                  {formatCurrencyBRL(Math.abs(a.value))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Ferramentas adicionais. */}
      <Section title="Ferramentas adicionais" icon={ZapIcon}>
        {tools.length === 0 ? (
          <EmptyHint icon={ZapIcon}>
            Nenhuma ferramenta adicional contratada.
          </EmptyHint>
        ) : (
          <ul className="flex flex-col gap-2.5">
            {tools.map((t) => (
              <li
                key={t.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-white/[0.03] p-3"
              >
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium text-white">{t.name}</span>
                  <span className="text-[11px] text-noturno-grey-light/70">
                    {t.licenses} {t.licenses > 1 ? "licenças" : "licença"}
                    {t.validUntil ? ` · até ${formatDateBR(t.validUntil)}` : ""}
                  </span>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold text-white">
                    {formatCurrencyBRL(t.value)}
                  </span>
                  <TonePill tone={t.active ? "green" : "neutral"}>
                    {t.active ? "Ativa" : "Inativa"}
                  </TonePill>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {/* Representação. */}
      <Section title="Representação" icon={ShieldIcon} className="lg:col-span-2">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Pertence a" value={OWNER_LABEL[representation.owner]} />
          <Field label="Franquia" value={representation.franchiseName} />
          <Field label="Representante" value={representation.representativeName} />
          <Field
            label="Comissão"
            value={
              representation.commission !== undefined
                ? `${representation.commission}%`
                : undefined
            }
          />
          {representation.startDate && (
            <Field label="Início" value={formatDateBR(representation.startDate)} />
          )}
        </div>
      </Section>
    </div>
  );
}
