// Scope: [M] module-customers
//
// Tela "Cadastro de Clientes" (listagem). Reaproveita o AuthenticatedShell
// (menu + navbar + guard) e carrega a lista já filtrada por escopo (UseCase).
// A grade tem busca, filtro por situação, ordenação, paginação e os estados
// de loading/vazio/erro (regras de UI corporativas). "Novo cliente" é gated por
// permissão (clients.edit).

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useStore } from "@/shared/stores/base-store";
import { BaseCard } from "@/shared/widgets/base-card";
import { PermissionExt } from "@/shared/extensions/permission-ext";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  PlusIcon,
  SearchIcon,
  UsersIcon,
  XIcon,
} from "@/shared/design-system/icons";
import { AuthenticatedShell } from "@/modules/home/presentation/widgets/authenticated-shell";
import { makeListCustomersUseCase } from "../../data/customer-factory";
import {
  CustomerListStore,
  type CustomerSort,
  type FinancialFilter,
  type StatusFilter,
} from "../stores/customer-list-store";
import { CustomerRowCard } from "../widgets/customer-row-card";
import { CustomersTable } from "../widgets/customers-table";

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "Todos os status" },
  { id: "ativo", label: "Ativos" },
  { id: "bloqueado", label: "Bloqueados" },
  { id: "suspenso", label: "Suspensos" },
  { id: "cancelado", label: "Cancelados" },
];

const FINANCIAL_OPTIONS: { id: FinancialFilter; label: string }[] = [
  { id: "all", label: "Financeiro" },
  { id: "em-dia", label: "Em dia" },
  { id: "atrasado", label: "Atrasado" },
  { id: "inadimplente", label: "Inadimplente" },
];

const SORT_OPTIONS: { id: CustomerSort; label: string }[] = [
  { id: "name", label: "Nome (A–Z)" },
  { id: "recent", label: "Mais recentes" },
  { id: "value-desc", label: "Maior mensalidade" },
  { id: "code", label: "Código" },
];

const SELECT_CLASS =
  "h-10 rounded-xl border border-white/10 bg-noturno-black-secondary px-3 text-sm text-noturno-grey-light-clean outline-none transition-colors hover:border-white/20 focus:border-noturno-orange/60";

export function CustomersPage() {
  return (
    <AuthenticatedShell>
      {({ user }) => <CustomersContent user={user} />}
    </AuthenticatedShell>
  );
}

function CustomersContent({ user }: { user: AuthenticatedUser }) {
  const [store] = useState(() => new CustomerListStore(makeListCustomersUseCase()));
  const state = useStore(store, (s) => s);

  useEffect(() => {
    void store.load(user);
  }, [store, user]);

  const canEdit = PermissionExt.has(user.permissions, "clients.edit");
  const counts = store.counts;

  return (
    <div className="flex w-full flex-col gap-6 animate-fade-in">
      {/* Cabeçalho. */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Clientes
          </h1>
          <p className="text-sm text-noturno-grey-light">
            Cadastro de clientes — núcleo comercial, contratual e financeiro.
          </p>
        </div>
        {canEdit && (
          <Link
            href="/clientes/novo"
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-noturno-orange px-4 text-sm font-semibold text-noturno-black transition-colors hover:bg-noturno-orange-dark"
          >
            <PlusIcon size={18} />
            Novo cliente
          </Link>
        )}
      </header>

      {/* KPIs. */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <Kpi label="Total" value={counts.total} tone="neutral" />
        <Kpi label="Ativos" value={counts.ativo} tone="green" />
        <Kpi label="Bloqueados" value={counts.bloqueado} tone="red" />
        <Kpi label="Suspensos" value={counts.suspenso} tone="orange" />
        <Kpi label="Cancelados" value={counts.cancelado} tone="neutral" />
      </div>

      {/* Toolbar: busca + ordenação. */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-sm">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-noturno-grey-light">
              <SearchIcon size={18} />
            </span>
            <input
              type="search"
              value={state.query}
              onChange={(e) => store.setQuery(e.target.value)}
              placeholder="Buscar por nome, documento, cidade ou código..."
              className="h-11 w-full rounded-xl border border-white/10 bg-noturno-black-secondary pl-11 pr-10 text-sm text-white placeholder:text-noturno-grey-light/60 outline-none transition-colors focus:border-noturno-orange/60"
            />
            {state.query && (
              <button
                type="button"
                onClick={() => store.setQuery("")}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-noturno-grey-light transition-colors hover:text-white"
              >
                <XIcon size={16} />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 text-sm text-noturno-grey-light">
            Ordenar
            <select
              value={state.sort}
              onChange={(e) => store.setSort(e.target.value as CustomerSort)}
              className="h-11 rounded-xl border border-white/10 bg-noturno-black-secondary px-3 text-sm text-white outline-none transition-colors focus:border-noturno-orange/60"
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.id} value={o.id} className="bg-noturno-black-secondary">
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Filtros (dropdowns) + limpar. */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filtrar por status"
            value={state.statusFilter}
            onChange={(e) => store.setStatusFilter(e.target.value as StatusFilter)}
            className={SELECT_CLASS}
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.id} value={o.id} className="bg-noturno-black-secondary">
                {o.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por plano"
            value={state.planFilter}
            onChange={(e) => store.setPlanFilter(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all" className="bg-noturno-black-secondary">
              Todos os planos
            </option>
            {store.planOptions.map((p) => (
              <option key={p} value={p} className="bg-noturno-black-secondary">
                {p}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por cidade"
            value={state.cityFilter}
            onChange={(e) => store.setCityFilter(e.target.value)}
            className={SELECT_CLASS}
          >
            <option value="all" className="bg-noturno-black-secondary">
              Todas as cidades
            </option>
            {store.cityOptions.map((c) => (
              <option key={c} value={c} className="bg-noturno-black-secondary">
                {c}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por situação financeira"
            value={state.financialFilter}
            onChange={(e) =>
              store.setFinancialFilter(e.target.value as FinancialFilter)
            }
            className={SELECT_CLASS}
          >
            {FINANCIAL_OPTIONS.map((o) => (
              <option key={o.id} value={o.id} className="bg-noturno-black-secondary">
                {o.label}
              </option>
            ))}
          </select>

          {store.hasActiveFilters && (
            <button
              type="button"
              onClick={() => store.clearFilters()}
              className="ml-auto text-sm text-noturno-grey-light transition-colors hover:text-noturno-orange"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo. */}
      {state.loading ? (
        <ListSkeleton />
      ) : state.errorMessage ? (
        <BaseCard className="p-8 text-center text-sm text-noturno-grey-light">
          {state.errorMessage}
        </BaseCard>
      ) : store.filteredCount === 0 ? (
        <EmptyState hasQuery={store.hasActiveFilters} />
      ) : (
        <>
          {/* Tabela no desktop; cards no mobile. */}
          <div className="hidden md:block">
            <CustomersTable customers={store.pageItems} />
          </div>
          <div className="flex flex-col gap-3 md:hidden">
            {store.pageItems.map((customer) => (
              <CustomerRowCard key={customer.id} customer={customer} />
            ))}
          </div>
          <Pagination
            page={state.page}
            totalPages={store.totalPages}
            total={store.filteredCount}
            pageSize={store.pageSize}
            onPage={(p) => store.setPage(p)}
          />
        </>
      )}
    </div>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "red" | "orange" | "neutral";
}) {
  const dot = {
    green: "bg-noturno-green",
    red: "bg-noturno-red",
    orange: "bg-noturno-orange",
    neutral: "bg-noturno-grey-light",
  }[tone];

  return (
    <BaseCard className="flex flex-col gap-1 p-4">
      <span className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider text-noturno-grey-light/70">
        <span className={"size-1.5 rounded-full " + dot} aria-hidden="true" />
        {label}
      </span>
      <span className="text-2xl font-semibold tracking-tight text-white">
        {value}
      </span>
    </BaseCard>
  );
}

function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPage,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPage: (page: number) => void;
}) {
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex items-center justify-between gap-4 pt-1">
      <span className="text-xs text-noturno-grey-light">
        {from}–{to} de {total} clientes
      </span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          aria-label="Página anterior"
          className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-noturno-grey-light-clean transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowLeftIcon size={16} />
        </button>
        <span className="text-sm text-noturno-grey-light-clean">
          {page} / {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          aria-label="Próxima página"
          className="flex size-9 items-center justify-center rounded-lg border border-white/10 text-noturno-grey-light-clean transition-colors hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ArrowRightIcon size={16} />
        </button>
      </div>
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <BaseCard className="flex flex-col items-center gap-3 p-12 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-white/5 text-noturno-grey-light">
        <UsersIcon size={24} />
      </span>
      <p className="text-sm text-noturno-grey-light">
        {hasQuery
          ? "Nenhum cliente encontrado para os filtros aplicados."
          : "Nenhum cliente cadastrado ainda."}
      </p>
    </BaseCard>
  );
}

function ListSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <BaseCard
          key={i}
          className="h-[84px] animate-pulse bg-white/[0.04]"
          aria-hidden="true"
        />
      ))}
    </div>
  );
}
