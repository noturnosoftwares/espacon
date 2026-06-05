// Scope: [M] module-customers
//
// Store da listagem de Clientes. Estende BaseStore. O UseCase já entrega os
// clientes visíveis ao escopo do usuário (multiempresa); esta store cuida do
// estado de UI da grade: busca, filtro por situação, ordenação e paginação —
// tudo derivado (getters), sem mutar a fonte. Instância POR TELA.
//
// Nota: com API real, busca/ordenação/paginação migram para parâmetros do
// provider (server-side). Aqui é client-side por ser mock-first.

import { BaseStore, type BaseState } from "@/shared/stores/base-store";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { Customer, FinancialStatus } from "../../domain/models/customer";
import type { CustomerStatus } from "../../domain/enums/customer-status";
import type { ListCustomersUseCase } from "../../data/application/list-customers-usecase";

export type StatusFilter = CustomerStatus | "all";
export type FinancialFilter = FinancialStatus | "all";
export type CustomerSort = "name" | "recent" | "value-desc" | "code";

const PAGE_SIZE = 6;

type CustomerListState = BaseState & {
  all: Customer[];
  query: string;
  statusFilter: StatusFilter;
  planFilter: string;
  cityFilter: string;
  financialFilter: FinancialFilter;
  sort: CustomerSort;
  page: number;
};

export class CustomerListStore extends BaseStore<CustomerListState> {
  constructor(private readonly listCustomers: ListCustomersUseCase) {
    super({
      ...BaseStore.baseState(),
      all: [],
      query: "",
      statusFilter: "all",
      planFilter: "all",
      cityFilter: "all",
      financialFilter: "all",
      sort: "name",
      page: 1,
    });
  }

  // ----- Load -----

  async load(user: AuthenticatedUser): Promise<void> {
    this.setState({ loading: true, errorMessage: null });
    const result = await this.listCustomers.execute(user);
    if (!result.success) {
      this.setState({
        loading: false,
        isInitialized: true,
        errorMessage: result.error.message,
      });
      return;
    }
    this.setState({ all: result.data, loading: false, isInitialized: true });
  }

  // ----- UI actions -----

  setQuery(query: string): void {
    this.setState({ query, page: 1 });
  }

  setStatusFilter(statusFilter: StatusFilter): void {
    this.setState({ statusFilter, page: 1 });
  }

  setPlanFilter(planFilter: string): void {
    this.setState({ planFilter, page: 1 });
  }

  setCityFilter(cityFilter: string): void {
    this.setState({ cityFilter, page: 1 });
  }

  setFinancialFilter(financialFilter: FinancialFilter): void {
    this.setState({ financialFilter, page: 1 });
  }

  setSort(sort: CustomerSort): void {
    this.setState({ sort, page: 1 });
  }

  clearFilters(): void {
    this.setState({
      query: "",
      statusFilter: "all",
      planFilter: "all",
      cityFilter: "all",
      financialFilter: "all",
      page: 1,
    });
  }

  /** true quando há qualquer filtro/busca ativo (mostra "Limpar filtros"). */
  get hasActiveFilters(): boolean {
    const s = this.getSnapshot();
    return (
      s.query.trim() !== "" ||
      s.statusFilter !== "all" ||
      s.planFilter !== "all" ||
      s.cityFilter !== "all" ||
      s.financialFilter !== "all"
    );
  }

  /** Opções de plano (distintas, ordenadas) para o filtro. */
  get planOptions(): string[] {
    return [...new Set(this.getSnapshot().all.map((c) => c.contract.plan))].sort();
  }

  /** Opções de cidade ("Cidade/UF", distintas, ordenadas) para o filtro. */
  get cityOptions(): string[] {
    return [
      ...new Set(
        this.getSnapshot().all.map((c) => `${c.address.city}/${c.address.uf}`),
      ),
    ].sort();
  }

  setPage(page: number): void {
    const clamped = Math.min(Math.max(1, page), this.totalPages);
    this.setState({ page: clamped });
  }

  // ----- Derived -----

  /** Contagem por situação sobre o total visível (KPIs do topo). */
  get counts(): { total: number } & Record<CustomerStatus, number> {
    const all = this.getSnapshot().all;
    const base = { total: all.length, ativo: 0, bloqueado: 0, cancelado: 0, suspenso: 0 };
    for (const c of all) base[c.status] += 1;
    return base;
  }

  private get filtered(): Customer[] {
    const { all, query, statusFilter, planFilter, cityFilter, financialFilter } =
      this.getSnapshot();
    const q = query.trim().toLowerCase();

    return all.filter((c) => {
      if (statusFilter !== "all" && c.status !== statusFilter) return false;
      if (planFilter !== "all" && c.contract.plan !== planFilter) return false;
      if (
        cityFilter !== "all" &&
        `${c.address.city}/${c.address.uf}` !== cityFilter
      )
        return false;
      if (financialFilter !== "all" && c.financialStatus !== financialFilter)
        return false;
      if (!q) return true;
      return [c.code, c.legalName, c.tradeName, c.document, c.address.city]
        .filter(Boolean)
        .some((f) => f!.toLowerCase().includes(q));
    });
  }

  private get sorted(): Customer[] {
    const sort = this.getSnapshot().sort;
    const list = [...this.filtered];
    switch (sort) {
      case "recent":
        return list.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      case "value-desc":
        return list.sort(
          (a, b) => b.contract.monthlyValue - a.contract.monthlyValue,
        );
      case "code":
        return list.sort((a, b) => a.code.localeCompare(b.code));
      case "name":
      default:
        return list.sort((a, b) =>
          (a.tradeName ?? a.legalName).localeCompare(b.tradeName ?? b.legalName),
        );
    }
  }

  /** Total após filtros (base da paginação e do contador). */
  get filteredCount(): number {
    return this.filtered.length;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredCount / PAGE_SIZE));
  }

  /** Itens da página atual. */
  get pageItems(): Customer[] {
    const page = this.getSnapshot().page;
    const start = (page - 1) * PAGE_SIZE;
    return this.sorted.slice(start, start + PAGE_SIZE);
  }

  get pageSize(): number {
    return PAGE_SIZE;
  }
}
