// Scope: [M] module-customers
//
// Tabela de clientes (desktop) — espelha docs/screens/custumers_screen.png:
// Cliente · Contato · Cidade · Plano · Licenças · Mensalidade · Financeiro ·
// Situação · Último atend. · Ações. A linha inteira navega para o detalhe; a
// coluna Ações traz o atalho "ver" e um menu (placeholder). Em telas menores a
// listagem usa cards (CustomerRowCard), não esta tabela.

"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatCurrencyBRL } from "@/shared/helpers/format";
import {
  EyeIcon,
  MoreVerticalIcon,
} from "@/shared/design-system/icons";
import type { Customer } from "../../domain/models/customer";
import { FinancialBadge, StatusBadge, TypeBadge } from "./customer-badges";

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
  return (first + last).toUpperCase();
}

const TH = "px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-noturno-grey-light/70";
const TD = "px-3 py-3 align-middle";

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const router = useRouter();

  return (
    <div className="overflow-hidden rounded-2xl border border-white/8 bg-white/[0.02]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] border-collapse text-sm">
          <thead>
            <tr className="border-b border-white/8">
              <th className={TH}>Cliente</th>
              <th className={TH}>Contato</th>
              <th className={TH}>Cidade</th>
              <th className={TH}>Plano</th>
              <th className={TH}>Licenças</th>
              <th className={TH}>Mensalidade</th>
              <th className={TH}>Financeiro</th>
              <th className={TH}>Situação</th>
              <th className={TH}>Último atend.</th>
              <th className={TH + " text-right"}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => {
              const name = c.tradeName ?? c.legalName;
              const contact = c.contacts[0];
              return (
                <tr
                  key={c.id}
                  onClick={() => router.push(`/clientes/${c.id}`)}
                  className="cursor-pointer border-b border-white/5 transition-colors last:border-0 hover:bg-white/[0.04]"
                >
                  {/* Cliente */}
                  <td className={TD}>
                    <div className="flex items-center gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-noturno-orange/30 to-noturno-orange/5 text-xs font-bold text-noturno-orange ring-1 ring-inset ring-noturno-orange/25">
                        {initials(name)}
                      </span>
                      <div className="flex min-w-0 flex-col">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-white">
                            {name}
                          </span>
                          <TypeBadge type={c.personType} />
                        </div>
                        <span className="truncate text-xs text-noturno-grey-light">
                          #{c.code} · {c.document}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contato */}
                  <td className={TD}>
                    <div className="flex flex-col text-xs">
                      <span className="text-noturno-grey-light-clean">
                        {contact?.mobile ?? contact?.phone ?? "—"}
                      </span>
                      {contact?.email && (
                        <span className="truncate text-noturno-grey-light">
                          {contact.email}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cidade */}
                  <td className={TD + " text-noturno-grey-light-clean"}>
                    {c.address.city}/{c.address.uf}
                  </td>

                  {/* Plano */}
                  <td className={TD}>
                    <div className="flex flex-col">
                      <span className="text-noturno-grey-light-clean">
                        {c.contract.plan}
                      </span>
                      <span className="text-xs text-noturno-grey-light">
                        {c.contract.modality}
                      </span>
                    </div>
                  </td>

                  {/* Licenças */}
                  <td className={TD + " text-noturno-grey-light-clean"}>
                    {c.contract.computersInstalled} / {c.contract.computersContracted}
                  </td>

                  {/* Mensalidade */}
                  <td className={TD + " font-medium text-white"}>
                    {formatCurrencyBRL(c.contract.monthlyValue)}
                  </td>

                  {/* Financeiro */}
                  <td className={TD}>
                    <FinancialBadge status={c.financialStatus} />
                  </td>

                  {/* Situação */}
                  <td className={TD}>
                    <StatusBadge status={c.status} />
                  </td>

                  {/* Último atendimento */}
                  <td className={TD + " text-xs text-noturno-grey-light"}>
                    {c.lastServiceLabel ?? "—"}
                  </td>

                  {/* Ações */}
                  <td className={TD}>
                    <div
                      className="flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Link
                        href={`/clientes/${c.id}`}
                        aria-label={`Abrir ${name}`}
                        className="flex size-8 items-center justify-center rounded-lg text-noturno-grey-light transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <EyeIcon size={16} />
                      </Link>
                      <button
                        type="button"
                        title="Mais ações (em breve)"
                        className="flex size-8 items-center justify-center rounded-lg text-noturno-grey-light transition-colors hover:bg-white/5 hover:text-white"
                      >
                        <MoreVerticalIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
