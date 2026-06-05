// Scope: [M] module-customers
//
// Aba "Financeiro" do detalhe: resumo (mensalidade, recebido, em aberto, situação)
// e faturas/cobranças. Mock-first (gerador determinístico). Cálculos de soma são
// derivados das faturas em render (sem mutação de estado).

import {
  ArrowDownCircleIcon,
  ArrowUpCircleIcon,
  ReceiptIcon,
  WalletIcon,
} from "@/shared/design-system/icons";
import { formatCurrencyBRL, formatDateBR } from "@/shared/helpers/format";
import { CustomerRules } from "../../domain/models/customer-rules";
import type { Customer, Invoice } from "../../domain/models/customer";
import {
  FINANCIAL_LABEL,
  FINANCIAL_TONE,
  INVOICE_LABEL,
  INVOICE_TONE,
  PAYMENT_METHOD_LABEL,
} from "../customer-labels";
import {
  EmptyHint,
  Section,
  TonePill,
} from "./customer-detail-ui";

function sumBy(invoices: Invoice[], pred: (i: Invoice) => boolean): number {
  return invoices.filter(pred).reduce((acc, i) => acc + i.value, 0);
}

export function CustomerFinancialTab({ customer }: { customer: Customer }) {
  const invoices = customer.invoices ?? [];
  const paid = sumBy(invoices, (i) => i.status === "paga");
  const open = sumBy(invoices, (i) => i.status === "aberta" || i.status === "atrasada");
  const payDay = CustomerRules.paymentDay(customer.contract.contractDate);

  return (
    <div className="flex flex-col gap-4">
      {/* Resumo. */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard
          icon={WalletIcon}
          tone="orange"
          label="Mensalidade"
          value={formatCurrencyBRL(customer.contract.monthlyValue)}
          hint={`Vencimento dia ${payDay}`}
        />
        <SummaryCard
          icon={ArrowUpCircleIcon}
          tone="green"
          label="Recebido (6 meses)"
          value={formatCurrencyBRL(paid)}
        />
        <SummaryCard
          icon={ArrowDownCircleIcon}
          tone="red"
          label="Em aberto"
          value={formatCurrencyBRL(open)}
        />
        <SummaryCard
          icon={ReceiptIcon}
          tone={FINANCIAL_TONE[customer.financialStatus]}
          label="Situação"
          value={FINANCIAL_LABEL[customer.financialStatus]}
          hint={PAYMENT_METHOD_LABEL[customer.paymentMethod]}
        />
      </div>

      {/* Faturas. */}
      <Section title="Faturas e cobranças" icon={ReceiptIcon}>
        {invoices.length === 0 ? (
          <EmptyHint icon={ReceiptIcon}>
            Nenhuma fatura emitida para este cliente.
          </EmptyHint>
        ) : (
          <div className="-mx-1 overflow-x-auto">
            <table className="w-full min-w-[560px] border-collapse text-sm">
              <thead>
                <tr className="text-left text-[11px] uppercase tracking-wider text-noturno-grey-light/70">
                  <th className="px-3 pb-2 font-medium">Competência</th>
                  <th className="px-3 pb-2 font-medium">Vencimento</th>
                  <th className="px-3 pb-2 font-medium">Pagamento</th>
                  <th className="px-3 pb-2 text-right font-medium">Valor</th>
                  <th className="px-3 pb-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="border-t border-white/6 text-noturno-grey-light-clean"
                  >
                    <td className="px-3 py-2.5 font-medium text-white">
                      {inv.reference}
                    </td>
                    <td className="px-3 py-2.5">{formatDateBR(inv.dueDate)}</td>
                    <td className="px-3 py-2.5">
                      {inv.paidDate ? formatDateBR(inv.paidDate) : "—"}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-white">
                      {formatCurrencyBRL(inv.value)}
                    </td>
                    <td className="px-3 py-2.5">
                      <TonePill tone={INVOICE_TONE[inv.status]}>
                        {INVOICE_LABEL[inv.status]}
                      </TonePill>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  tone,
  label,
  value,
  hint,
}: {
  icon: typeof WalletIcon;
  tone: "orange" | "green" | "red" | "blue" | "neutral";
  label: string;
  value: string;
  hint?: string;
}) {
  const ring = {
    orange: "text-noturno-orange",
    green: "text-noturno-green",
    red: "text-noturno-red",
    blue: "text-noturno-blue-light",
    neutral: "text-noturno-grey-light-clean",
  }[tone];

  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/8 bg-white/[0.02] p-4">
      <span className="flex items-center gap-2 text-xs text-noturno-grey-light">
        <span className={ring}>
          <Icon size={16} />
        </span>
        {label}
      </span>
      <span className="text-xl font-semibold tracking-tight text-white">{value}</span>
      {hint && <span className="text-[11px] text-noturno-grey-light/70">{hint}</span>}
    </div>
  );
}
