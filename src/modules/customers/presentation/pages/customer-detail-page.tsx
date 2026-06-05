// Scope: [M] module-customers
//
// Detalhe do Cliente — espelha docs/screens/custumers_screen.png: cabeçalho com
// avatar + identidade + ações, faixa de chips (contratos, licenças, mensalidade,
// próximo pagamento, chamados, situação financeira) e abas (Visão geral,
// Comercial, Financeiro, Suporte, Integrações, Administração). A "Visão geral"
// reúne os cards da Aba Principal (dados, endereço com mapa, representação, forma
// de pagamento, contatos, contrato/licenciamento e resumo financeiro). As demais
// abas entram em próximas fases ("em breve").

"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { useStore } from "@/shared/stores/base-store";
import { BaseCard } from "@/shared/widgets/base-card";
import { PermissionExt } from "@/shared/extensions/permission-ext";
import {
  formatCurrencyBRL,
  formatDateBR,
  toISODate,
} from "@/shared/helpers/format";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  CreditCardIcon,
  FileTextIcon,
  HeadsetIcon,
  KeyIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldIcon,
  UserIcon,
  WalletIcon,
} from "@/shared/design-system/icons";
import { AuthenticatedShell } from "@/modules/home/presentation/widgets/authenticated-shell";
import { makeGetCustomerUseCase } from "../../data/customer-factory";
import { CustomerRules } from "../../domain/models/customer-rules";
import type { Customer } from "../../domain/models/customer";
import { CustomerDetailStore } from "../stores/customer-detail-store";
import {
  FinancialBadge,
  SignBadge,
  StatusBadge,
  TypeBadge,
} from "../widgets/customer-badges";
import {
  Field,
  Field2,
  MapPlaceholder,
  Section,
} from "../widgets/customer-detail-ui";
import { CustomerCommercialTab } from "../widgets/customer-commercial-tab";
import { CustomerFinancialTab } from "../widgets/customer-financial-tab";
import { CustomerSupportTab } from "../widgets/customer-support-tab";
import { CustomerIntegrationsTab } from "../widgets/customer-integrations-tab";
import { CustomerAdminTab } from "../widgets/customer-admin-tab";
import {
  OWNER_LABEL,
  PAYMENT_METHOD_LABEL,
  PERSON_TYPE_LABEL,
} from "../customer-labels";

export function CustomerDetailPage({ id }: { id: string }) {
  return (
    <AuthenticatedShell>
      {({ user }) => <CustomerDetailContent id={id} user={user} />}
    </AuthenticatedShell>
  );
}

function CustomerDetailContent({
  id,
  user,
}: {
  id: string;
  user: AuthenticatedUser;
}) {
  const [store] = useState(() => new CustomerDetailStore(makeGetCustomerUseCase()));
  const state = useStore(store, (s) => s);

  useEffect(() => {
    void store.load(id);
  }, [store, id]);

  const canEdit = PermissionExt.has(user.permissions, "clients.edit");

  if (state.loading || !state.isInitialized) return <DetailSkeleton />;

  if (state.errorMessage) {
    return (
      <Centered>
        <p className="text-sm text-noturno-grey-light">{state.errorMessage}</p>
        <BackLink />
      </Centered>
    );
  }

  if (state.notFound || !state.customer) {
    return (
      <Centered>
        <p className="text-sm text-noturno-grey-light">Cliente não encontrado.</p>
        <BackLink />
      </Centered>
    );
  }

  return <CustomerDetail customer={state.customer} canEdit={canEdit} />;
}

// ----- Detalhe carregado -----

type TabId =
  | "overview"
  | "commercial"
  | "financial"
  | "support"
  | "integrations"
  | "admin";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Visão geral" },
  { id: "commercial", label: "Comercial" },
  { id: "financial", label: "Financeiro" },
  { id: "support", label: "Suporte" },
  { id: "integrations", label: "Integrações" },
  { id: "admin", label: "Administração" },
];

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? "") + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

function nextPaymentLabel(paymentDay: number): string {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let due = new Date(now.getFullYear(), now.getMonth(), paymentDay);
  if (due < todayStart) due = new Date(now.getFullYear(), now.getMonth() + 1, paymentDay);
  return formatDateBR(toISODate(due));
}

function CustomerDetail({
  customer,
  canEdit,
}: {
  customer: Customer;
  canEdit: boolean;
}) {
  const [tab, setTab] = useState<TabId>("overview");
  const name = customer.tradeName ?? customer.legalName;
  const { contract } = customer;
  const paymentDay = CustomerRules.paymentDay(contract.contractDate);

  return (
    <div className="flex w-full flex-col gap-6 animate-fade-in">
      {/* Breadcrumb. */}
      <nav className="flex items-center gap-1.5 text-sm text-noturno-grey-light">
        <Link href="/clientes" className="transition-colors hover:text-white">
          Clientes
        </Link>
        <ChevronRightIcon size={14} />
        <span className="text-noturno-grey-light-clean">{name}</span>
      </nav>

      {/* Cabeçalho + chips. */}
      <BaseCard className="flex flex-col gap-5 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-noturno-orange/30 to-noturno-orange/5 text-lg font-bold text-noturno-orange ring-1 ring-inset ring-noturno-orange/25">
              {initials(name)}
            </span>
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  {name}
                </h1>
                <TypeBadge type={customer.personType} />
                <StatusBadge status={customer.status} />
                <SignBadge status={customer.contract.signStatus} />
              </div>
              <p className="text-sm text-noturno-grey-light">
                #{customer.code} · {customer.document}
              </p>
              <span className="flex items-center gap-1 text-xs text-noturno-grey-light/80">
                <MapPinIcon size={12} />
                {customer.address.city}/{customer.address.uf}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {canEdit && (
              <Link
                href={`/clientes/${customer.id}/editar`}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-semibold text-noturno-grey-light-clean transition-colors hover:border-noturno-orange/50 hover:text-white"
              >
                Editar cliente
              </Link>
            )}
            <button
              type="button"
              title="Em breve"
              className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-white/10 px-4 text-sm font-semibold text-noturno-grey-light-clean transition-colors hover:border-white/20 hover:text-white"
            >
              Ações
              <ChevronDownIcon size={14} />
            </button>
          </div>
        </div>

        {/* Chips. */}
        <div className="flex flex-wrap gap-2.5">
          <Chip label="Contratos ativos" value={contract.signStatus === "assinado" ? "1" : "0"} />
          <Chip
            label="Licenças"
            value={`${contract.computersInstalled}/${contract.computersContracted}`}
          />
          <Chip label="Mensalidade" value={formatCurrencyBRL(contract.monthlyValue)} />
          <Chip label="Próximo pagto" value={nextPaymentLabel(paymentDay)} />
          <Chip label="Chamados abertos" value={String(customer.openTickets)} />
          <Chip label="Financeiro">
            <FinancialBadge status={customer.financialStatus} />
          </Chip>
        </div>
      </BaseCard>

      {/* Abas. */}
      <div className="flex flex-wrap gap-1 overflow-x-auto border-b border-white/8 pb-px">
        {TABS.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={active ? "page" : undefined}
              className={
                "relative whitespace-nowrap rounded-t-lg px-3.5 py-2 text-sm font-medium transition-colors " +
                (active
                  ? "text-noturno-orange"
                  : "text-noturno-grey-light hover:text-white")
              }
            >
              {t.label}
              {active && (
                <span className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-noturno-orange" />
              )}
            </button>
          );
        })}
      </div>

      {tab === "overview" && <OverviewTab customer={customer} />}
      {tab === "commercial" && <CustomerCommercialTab customer={customer} />}
      {tab === "financial" && <CustomerFinancialTab customer={customer} />}
      {tab === "support" && <CustomerSupportTab customer={customer} />}
      {tab === "integrations" && <CustomerIntegrationsTab customer={customer} />}
      {tab === "admin" && <CustomerAdminTab customer={customer} />}
    </div>
  );
}

// ----- Visão geral -----

function OverviewTab({ customer }: { customer: Customer }) {
  const { address, contract, representation } = customer;
  const paymentDay = CustomerRules.paymentDay(contract.contractDate);
  const available = Math.max(
    0,
    contract.computersContracted - contract.computersInstalled,
  );
  const canReleaseKeys = CustomerRules.canReleaseKeys(contract.signStatus);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <Section title="Dados básicos" icon={UserIcon}>
        <Field label="Razão Social / Nome" value={customer.legalName} />
        <Field label="Fantasia / Apelido" value={customer.tradeName} />
        <Field label="Tipo de pessoa" value={PERSON_TYPE_LABEL[customer.personType]} />
        <Field label="CPF / CNPJ" value={customer.document} />
        <Field
          label={customer.personType === "pj" ? "Inscrição Estadual" : "RG"}
          value={customer.stateRegistration}
        />
      </Section>

      <Section title="Endereço" icon={MapPinIcon}>
        <Field
          label="Logradouro"
          value={`${address.street}, ${address.number}${address.complement ? " · " + address.complement : ""}`}
        />
        <Field label="Bairro" value={address.district} />
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Cidade / UF" value={`${address.city}/${address.uf}`} />
          <Field label="CEP" value={address.zip} />
        </div>
        <MapPlaceholder query={`${address.street}, ${address.city}`} />
      </Section>

      <Section title="Representação" icon={ShieldIcon}>
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
      </Section>

      <Section title="Forma de pagamento" icon={CreditCardIcon}>
        <Field label="Forma" value={PAYMENT_METHOD_LABEL[customer.paymentMethod]} />
        <Field label="Data do contrato" value={formatDateBR(contract.contractDate)} />
        <Field label="Dia de pagamento" value={`Dia ${paymentDay}`} />
        <p className="text-xs text-noturno-grey-light/70">
          O dia de pagamento é definido automaticamente pela data do contrato.
        </p>
      </Section>

      <Section title="Contatos" icon={PhoneIcon}>
        {customer.contacts.length === 0 ? (
          <p className="text-sm text-noturno-grey-light">Nenhum contato.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {customer.contacts.map((c) => (
              <li key={c.id} className="flex flex-col gap-1 rounded-xl bg-white/[0.03] p-3">
                <span className="text-sm font-medium text-white">{c.name}</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-noturno-grey-light">
                  {c.mobile && (
                    <span className="inline-flex items-center gap-1">
                      <PhoneIcon size={12} />
                      {c.mobile}
                    </span>
                  )}
                  {c.phone && (
                    <span className="inline-flex items-center gap-1">
                      <HeadsetIcon size={12} />
                      {c.phone}
                    </span>
                  )}
                  {c.email && (
                    <span className="inline-flex items-center gap-1">
                      <MailIcon size={12} />
                      {c.email}
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Contrato e licenciamento" icon={WalletIcon}>
        <div className="grid grid-cols-2 gap-x-4">
          <Field label="Plano" value={contract.plan} />
          <Field label="Modalidade" value={contract.modality} />
          <Field label="Licenças contratadas" value={String(contract.computersContracted)} />
          <Field label="Instaladas" value={String(contract.computersInstalled)} />
          <Field label="Disponíveis" value={String(available)} />
          <Field label="Mensalidade" value={formatCurrencyBRL(contract.monthlyValue)} />
        </div>
        <div className="mt-1 flex items-center gap-2">
          <SignBadge status={contract.signStatus} />
          <span
            className={
              "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium " +
              (canReleaseKeys
                ? "bg-noturno-green/10 text-noturno-green"
                : "bg-noturno-orange/10 text-noturno-orange")
            }
          >
            <KeyIcon size={13} />
            {canReleaseKeys ? "Chaves liberadas" : "Chaves bloqueadas"}
          </span>
        </div>
      </Section>

      {/* Resumo financeiro (largura total). */}
      <div className="lg:col-span-2">
        <Section title="Resumo financeiro" icon={FileTextIcon}>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field2 label="Situação">
              <FinancialBadge status={customer.financialStatus} />
            </Field2>
            <Field label="Mensalidade" value={formatCurrencyBRL(contract.monthlyValue)} />
            <Field label="Próximo vencimento" value={nextPaymentLabel(paymentDay)} />
            <Field label="Forma" value={PAYMENT_METHOD_LABEL[customer.paymentMethod]} />
          </div>
          <Link
            href="/clientes"
            className="mt-1 inline-flex w-fit items-center gap-1 text-xs font-semibold text-noturno-orange transition-colors hover:text-noturno-orange-dark"
          >
            Ver financeiro do cliente
            <ArrowRightIcon size={14} />
          </Link>
        </Section>
      </div>
    </div>
  );
}

// ----- Auxiliares de apresentação -----

function Chip({
  label,
  value,
  children,
}: {
  label: string;
  value?: string;
  children?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2">
      <span className="text-[11px] uppercase tracking-wider text-noturno-grey-light/70">
        {label}
      </span>
      {children ?? (
        <span className="text-sm font-semibold text-white">{value}</span>
      )}
    </div>
  );
}

function BackLink() {
  return (
    <Link
      href="/clientes"
      className="inline-flex w-fit items-center gap-1.5 text-sm text-noturno-grey-light transition-colors hover:text-white"
    >
      <ChevronRightIcon size={16} className="rotate-180" />
      Voltar para clientes
    </Link>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-4 py-16 text-center animate-fade-in">
      {children}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex w-full flex-col gap-6">
      <BaseCard className="h-40 animate-pulse bg-white/[0.04]" aria-hidden="true" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <BaseCard
            key={i}
            className="h-48 animate-pulse bg-white/[0.04]"
            aria-hidden="true"
          />
        ))}
      </div>
    </div>
  );
}
