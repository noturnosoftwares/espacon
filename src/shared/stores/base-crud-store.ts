import { computed, ref, shallowRef } from 'vue'
import { type AsyncResult, isOk } from '@/shared/result'
import { useBaseStore } from './base-store'

/** Página de resultados retornada por listagens (contrato de UseCase/Repository). */
export interface PageResult<T> {
  items: T[]
  total: number
}

/**
 * Resultado de `cancelEditing`:
 * - `stay`  — era uma **edição** (havia registro anterior): o snapshot original
 *   foi restaurado e a UI deve **permanecer na tela de detalhe** (ADR-001).
 * - `leave` — era um **registro novo** (sem objeto anterior): a edição foi
 *   descartada e a UI deve **voltar para a listagem/pesquisa** (ADR-001).
 */
export type CancelOutcome = 'stay' | 'leave'

/** Tamanho do lote de carga das listagens com scroll infinito (ADR-002). */
export const DEFAULT_PAGE_SIZE = 30

/**
 * BaseCrudStore — estende o BaseStore com estado comum de CRUD/listagem:
 * itens, **scroll infinito** (ADR-002), filtros, seleção e **edição com snapshot
 * imutável** (ADR-001). Composable, para uso em Pinia setup stores:
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

  // ── Listagem ────────────────────────────────────────────────────────────
  // shallowRef: a lista é substituída inteira (imutabilidade de models), não
  // mutada item a item — evita reatividade profunda desnecessária.
  const items = shallowRef<T[]>([])
  const totalItems = ref(0)
  const page = ref(1)
  const pageSize = ref(options.pageSize ?? DEFAULT_PAGE_SIZE)
  const filters = ref<F | null>(null)
  const selected = shallowRef<T | null>(null)

  // Scroll infinito (ADR-002): `loadingMore` controla o indicador de rodapé;
  // `hasMore` diz se ainda há registros além dos já carregados.
  const loadingMore = ref(false)
  const hasMore = computed(() => items.value.length < totalItems.value)

  const totalPages = computed(() =>
    pageSize.value > 0 ? Math.max(1, Math.ceil(totalItems.value / pageSize.value)) : 1,
  )
  const isEmpty = computed(() => !base.loading.value && items.value.length === 0)

  // ── Edição (snapshot imutável) ──────────────────────────────────────────
  // `editing` é a cópia manipulada pela tela (sempre via nova instância —
  // copyWith); `editingSnapshot` guarda o registro como entrou em edição, para
  // detectar alteração (dirty) e **restaurar ao cancelar** (ADR-001).
  const editing = shallowRef<T | null>(null)
  const editingSnapshot = shallowRef<T | null>(null)
  const isNewRecord = ref(false)

  const isDirty = computed(
    () =>
      editing.value !== null &&
      editingSnapshot.value !== null &&
      JSON.stringify(editing.value) !== JSON.stringify(editingSnapshot.value),
  )

  // ── Listagem: mutações ────────────────────────────────────────────────────
  function setItems(list: T[], total?: number): void {
    items.value = list
    totalItems.value = total ?? list.length
  }

  function appendItems(list: T[], total?: number): void {
    items.value = [...items.value, ...list]
    if (total !== undefined) totalItems.value = total
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

  // ── Edição: mutações ──────────────────────────────────────────────────────
  /** Entra em modo **inclusão** com um registro em branco (sem objeto anterior). */
  function beginCreate(blank: T): void {
    editing.value = blank
    editingSnapshot.value = blank
    isNewRecord.value = true
  }

  /** Entra em modo **edição**: guarda o snapshot imutável do registro carregado. */
  function beginEdit(record: T): void {
    editing.value = record
    editingSnapshot.value = record
    isNewRecord.value = false
  }

  /** Substitui o registro em edição (a tela passa uma nova instância — copyWith). */
  function setEditing(record: T): void {
    editing.value = record
  }

  /** Confirma o salvamento: o registro salvo vira o novo snapshot (zera o dirty). */
  function commitEditing(saved: T): void {
    editing.value = saved
    editingSnapshot.value = saved
    isNewRecord.value = false
  }

  function clearEditing(): void {
    editing.value = null
    editingSnapshot.value = null
    isNewRecord.value = false
  }

  /**
   * Cancela a edição (ADR-001):
   * - **edição** (havia registro anterior) → restaura o snapshot original em
   *   `editing` e devolve `'stay'` (a UI permanece na tela de detalhe);
   * - **inclusão** (registro novo, sem snapshot) → limpa a edição e devolve
   *   `'leave'` (a UI volta para a listagem/pesquisa).
   */
  function cancelEditing(): CancelOutcome {
    if (isNewRecord.value || editingSnapshot.value === null) {
      clearEditing()
      return 'leave'
    }
    editing.value = editingSnapshot.value
    return 'stay'
  }

  function resetCrud(): void {
    base.resetBase()
    items.value = []
    totalItems.value = 0
    page.value = 1
    filters.value = null
    selected.value = null
    loadingMore.value = false
    clearEditing()
  }

  // ── Carregamento ──────────────────────────────────────────────────────────
  /**
   * Carrega a **primeira página** (lote inicial) da listagem com os
   * filtros atuais, substituindo a lista. Usa a flag `loading` (skeleton).
   * O `operation` recebe página/tamanho/filtros e devolve `PageResult` via AsyncResult.
   */
  async function loadPage(
    operation: (page: number, pageSize: number, filters: F | null) => Promise<AsyncResult<PageResult<T>>>,
  ): Promise<void> {
    page.value = 1
    const result = await base.run(() => operation(page.value, pageSize.value, filters.value))
    if (result) setItems(result.items, result.total)
  }

  /**
   * Carrega o **próximo lote** e **anexa** à lista (scroll infinito — ADR-002).
   * Não dispara se já está carregando ou se não há mais registros. Usa a flag
   * própria `loadingMore` (indicador de rodapé), sem acionar o skeleton geral.
   */
  async function loadMore(
    operation: (page: number, pageSize: number, filters: F | null) => Promise<AsyncResult<PageResult<T>>>,
  ): Promise<void> {
    if (loadingMore.value || base.loading.value || !hasMore.value) return
    const nextPage = page.value + 1
    loadingMore.value = true
    try {
      const result = await operation(nextPage, pageSize.value, filters.value)
      if (isOk(result)) {
        page.value = nextPage
        appendItems(result.data.items, result.data.total)
      } else {
        base.setError(result.error.message)
      }
    } finally {
      loadingMore.value = false
    }
  }

  return {
    ...base,
    // estado — listagem
    items,
    totalItems,
    page,
    pageSize,
    filters,
    selected,
    totalPages,
    isEmpty,
    loadingMore,
    hasMore,
    // estado — edição
    editing,
    editingSnapshot,
    isNewRecord,
    isDirty,
    // ações — listagem
    setItems,
    appendItems,
    setPage,
    setPageSize,
    setFilters,
    select,
    clearSelection,
    resetCrud,
    loadPage,
    loadMore,
    // ações — edição
    beginCreate,
    beginEdit,
    setEditing,
    commitEditing,
    clearEditing,
    cancelEditing,
  }
}

export type BaseCrudStore = ReturnType<typeof useBaseCrudStore>
