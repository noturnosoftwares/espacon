import { computed, ref, shallowRef } from 'vue'
import type { AsyncResult } from '@/shared/result'
import { useBaseStore } from './base-store'

/** Página de resultados retornada por listagens (contrato de UseCase/Repository). */
export interface PageResult<T> {
  items: T[]
  total: number
}

/**
 * BaseCrudStore — estende o BaseStore com estado comum de CRUD/listagem:
 * itens, paginação, filtros e seleção de registro. Composable, para uso em
 * Pinia setup stores:
 *
 * ```ts
 * export const useCustomerStore = defineStore('customers', () => {
 *   const crud = useBaseCrudStore<Customer, CustomerFilters>()
 *   async function load() {
 *     await crud.loadPage((page, size, filters) =>
 *       getCustomers({ page, size, filters }),
 *     )
 *   }
 *   return { ...crud, load }
 * })
 * ```
 *
 * `T` = tipo do item; `F` = tipo do objeto de filtros da tela.
 */
export function useBaseCrudStore<T, F = Record<string, unknown>>(options: { pageSize?: number } = {}) {
  const base = useBaseStore()

  // shallowRef: a lista é substituída inteira (imutabilidade de models), não
  // mutada item a item — evita reatividade profunda desnecessária.
  const items = shallowRef<T[]>([])
  const totalItems = ref(0)
  const page = ref(1)
  const pageSize = ref(options.pageSize ?? 20)
  const filters = ref<F | null>(null)
  const selected = shallowRef<T | null>(null)

  const totalPages = computed(() =>
    pageSize.value > 0 ? Math.max(1, Math.ceil(totalItems.value / pageSize.value)) : 1,
  )
  const isEmpty = computed(() => !base.loading.value && items.value.length === 0)

  function setItems(list: T[], total?: number): void {
    items.value = list
    totalItems.value = total ?? list.length
  }

  function setPage(value: number): void {
    page.value = Math.max(1, value)
  }

  function setPageSize(value: number): void {
    pageSize.value = Math.max(1, value)
  }

  function setFilters(value: F | null): void {
    filters.value = value
    page.value = 1
  }

  function select(item: T | null): void {
    selected.value = item
  }

  function clearSelection(): void {
    selected.value = null
  }

  function resetCrud(): void {
    base.resetBase()
    items.value = []
    totalItems.value = 0
    page.value = 1
    filters.value = null
    selected.value = null
  }

  /**
   * Carrega uma página da listagem usando a página/tamanho/filtros atuais.
   * O `operation` recebe esses valores e devolve um `PageResult` via AsyncResult.
   */
  async function loadPage(
    operation: (page: number, pageSize: number, filters: F | null) => Promise<AsyncResult<PageResult<T>>>,
  ): Promise<void> {
    const result = await base.run(() => operation(page.value, pageSize.value, filters.value))
    if (result) setItems(result.items, result.total)
  }

  return {
    ...base,
    // estado
    items,
    totalItems,
    page,
    pageSize,
    filters,
    selected,
    totalPages,
    isEmpty,
    // ações
    setItems,
    setPage,
    setPageSize,
    setFilters,
    select,
    clearSelection,
    resetCrud,
    loadPage,
  }
}

export type BaseCrudStore = ReturnType<typeof useBaseCrudStore>
