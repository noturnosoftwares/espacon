// Scope: [M] module-customers
//
// Linha-card de cliente na listagem. Rica e clicável (abre o detalhe). Mostra
// identidade (ícone por tipo de pessoa), documento, localização, resumo de
// plano/licenças/mensalidade, representação e a situação. Responsiva: as
// estatísticas colapsam em telas menores.

import Link from "next/link";
import { BaseCard } from "@/shared/widgets/base-card";
import { formatCurrencyBRL } from "@/shared/helpers/format";
import {
  BuildingIcon,
  ChevronRightIcon,
  MapPinIcon,
  UserIcon,
} from "@/shared/design-system/icons";
import type { Customer } from "../../domain/models/customer";
import { OWNER_LABEL } from "../customer-labels";
import { StatusBadge, TypeBadge } from "./customer-badges";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col">
      <span className="text-[11px] uppercase tracking-wider text-noturno-grey-light/70">
        {label}
      </span>
      <span className="truncate text-sm font-medium text-noturno-grey-light-clean">
        {value}
      </span>
    </div>
  );
}

export function CustomerRowCard({ customer }: { customer: Customer }) {
  const Icon = customer.personType === "pj" ? BuildingIcon : UserIcon;
  const name = customer.tradeName ?? customer.legalName;
  const { contract, representation } = customer;
  const ownerLabel =
    representation.owner === "matriz"
      ? "Matriz"
      : (representation.franchiseName ??
        representation.representativeName ??
        OWNER_LABEL[representation.owner]);

  return (
    <Link href={`/clientes/${customer.id}`} className="block">
      <BaseCard className="group flex items-center gap-4 p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05] hover:shadow-[0_14px_32px_-20px_rgba(0,0,0,0.8)]">
        {/* Identidade. */}
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-white/12 to-white/[0.02] text-noturno-grey-light-clean ring-1 ring-inset ring-white/10 transition-colors group-hover:text-noturno-orange">
            <Icon size={22} />
          </span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <span className="truncate text-sm font-semibold text-white group-hover:text-noturno-orange">
                {name}
              </span>
              <TypeBadge type={customer.personType} />
            </div>
            <span className="truncate text-xs text-noturno-grey-light">
              #{customer.code} · {customer.document}
            </span>
            <span className="flex items-center gap-1 truncate text-xs text-noturno-grey-light/70">
              <MapPinIcon size={12} />
              {customer.address.city}/{customer.address.uf}
            </span>
          </div>
        </div>

        {/* Estatísticas (colapsam em telas menores). */}
        <div className="hidden shrink-0 items-center gap-8 xl:flex">
          <Stat label="Plano" value={`${contract.plan} · ${contract.modality}`} />
          <Stat
            label="Licenças"
            value={`${contract.computersInstalled}/${contract.computersContracted}`}
          />
          <Stat label="Mensalidade" value={formatCurrencyBRL(contract.monthlyValue)} />
          <Stat label="Representação" value={ownerLabel} />
        </div>

        {/* Versão compacta para md. */}
        <div className="hidden shrink-0 md:flex xl:hidden">
          <Stat label="Mensalidade" value={formatCurrencyBRL(contract.monthlyValue)} />
        </div>

        {/* Situação + chevron. */}
        <div className="flex shrink-0 items-center gap-3">
          <StatusBadge status={customer.status} />
          <span
            aria-hidden="true"
            className="text-noturno-grey-light/40 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:text-noturno-orange"
          >
            <ChevronRightIcon size={18} />
          </span>
        </div>
      </BaseCard>
    </Link>
  );
}
