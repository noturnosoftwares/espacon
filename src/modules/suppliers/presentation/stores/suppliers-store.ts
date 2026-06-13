import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseCrudStore, type CancelOutcome } from '@/shared/stores'
import { isOk } from '@/shared/result'
import { type Supplier, copySupplier, emptySupplier } from '../../domain/models'
import type { SupplierFilters, SupplierTotals } from '../../domain/repositories'
import { makeSuppliersUseCases } from '../../data/application'

/**
 * useSuppliersStore — CRUD do fornecedor. Lista via `useBaseCrudStore` com scroll
 * infinito (ADR-002) e edição com snapshot imutável (ADR-001). "Apagar" é
 * **inativação soft** (§4.6). Mantém os **totais** para o dashboard de pesquisa
 * (§14.5).
 */
export const useSuppliersStore = defineStore('suppliers', () => {
  const crud = useBaseCrudStore<Supplier, SupplierFilters>()
  const usecases = makeSuppliersUseCases()

  const searched = ref(false)
  const currentSearch = computed(() => crud.filters.value?.search ?? '')
  const currentStatus = computed(() => crud.filters.value?.status ?? 'all')
  const currentType = computed(() => crud.filters.value?.type ?? 'all')

  // Dashboard de totalizadores (§14.5) — independente da paginação.
  const totals = ref<SupplierTotals | null>(null)
  async function loadTotals(): Promise<void> {
    const result = await usecases.getSupplierTotals()
    if (isOk(result)) totals.value = result.data
  }

  async function load(): Promise<void> {
    await crud.loadPage((page, pageSize, filters) =>
      usecases.getSuppliers({ page, pageSize, filters }),
    )
  }
  async function loadNext(): Promise<void> {
    await crud.loadMore((page, pageSize, filters) =>
      usecases.getSuppliers({ page, pageSize, filters }),
    )
  }
  function applyFilters(filters: SupplierFilters): void {
    searched.value = true
    crud.setFilters(filters)
    void load()
  }
  async function refresh(): Promise<void> {
    if (searched.value) await load()
    await loadTotals()
  }

  function startNew(): void {
    crud.beginCreate(emptySupplier())
  }
  async function loadForEdit(id: number): Promise<boolean> {
    crud.clearEditing()
    const supplier = await crud.run(() => usecases.getSupplierById(id))
    if (supplier) crud.beginEdit(supplier)
    return supplier !== null
  }
  function patch(changes: Partial<Supplier>): void {
    if (crud.editing.value) crud.setEditing(copySupplier(crud.editing.value, changes))
  }
  function cancelEdit(): CancelOutcome {
    return crud.cancelEditing()
  }

  async function save(): Promise<boolean> {
    if (!crud.editing.value) return false
    const saved = await crud.run(() => usecases.saveSupplier(crud.editing.value as Supplier), {
      flag: 'saving',
    })
    if (saved) {
      crud.commitEditing(saved)
      crud.setSuccess('Fornecedor salvo com sucesso.')
      void loadTotals()
    }
    return saved !== null
  }

  /** "Apagar" = inativação soft (§4.6): marca INATIVO; o registro permanece. */
  async function inactivate(id: number): Promise<boolean> {
    await crud.run(() => usecases.inactivateSupplier(id), { flag: 'deleting' })
    if (!crud.hasError.value) {
      crud.setSuccess('Fornecedor inativado.')
      await load()
      await loadTotals()
      return true
    }
    return false
  }

  return {
    ...crud,
    searched,
    currentSearch,
    currentStatus,
    currentType,
    totals,
    loadTotals,
    load,
    loadNext,
    applyFilters,
    refresh,
    startNew,
    loadForEdit,
    patch,
    cancelEdit,
    save,
    inactivate,
  }
})
