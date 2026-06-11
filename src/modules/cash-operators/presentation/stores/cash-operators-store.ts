import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseCrudStore, type CancelOutcome } from '@/shared/stores'
import {
  type CashOperator,
  copyCashOperator,
  emptyCashOperator,
} from '../../domain/models'
import type { CashOperatorFilters } from '../../domain/repositories'
import { makeCashOperatorsUseCases } from '../../data/application'

/**
 * useCashOperatorsStore — CRUD do registro mestre de operadores de caixa. Mesmo
 * padrão da `useUserProfilesStore`: lista via `useBaseCrudStore` com **scroll
 * infinito** (ADR-002) e edição com **snapshot imutável** (cancelar restaura e
 * permanece — ADR-001). "Excluir" é **inativação lógica** (spec — "inativar, não
 * apagar"): o registro permanece, com `active = false`.
 */
export const useCashOperatorsStore = defineStore('cash-operators', () => {
  const crud = useBaseCrudStore<CashOperator, CashOperatorFilters>()
  const usecases = makeCashOperatorsUseCases()

  // Preserva o contexto ao voltar de um registro (não zera a pesquisa/situação).
  const searched = ref(false)
  const currentSearch = computed(() => crud.filters.value?.search ?? '')
  const currentStatus = computed(() => crud.filters.value?.status ?? 'all')

  // Load
  async function load(): Promise<void> {
    await crud.loadPage((page, pageSize, filters) =>
      usecases.getCashOperators({ page, pageSize, filters }),
    )
  }

  /** Carrega o próximo lote (scroll infinito — ADR-002). */
  async function loadNext(): Promise<void> {
    await crud.loadMore((page, pageSize, filters) =>
      usecases.getCashOperators({ page, pageSize, filters }),
    )
  }

  function applyFilters(filters: CashOperatorFilters): void {
    searched.value = true
    crud.setFilters(filters)
    void load()
  }

  /** Recarrega a listagem com os filtros atuais (ex.: ao voltar da edição). */
  async function refresh(): Promise<void> {
    if (searched.value) await load()
  }

  // Edição (estado de formulário) — delega o snapshot ao BaseCrudStore
  function startNew(): void {
    crud.beginCreate(emptyCashOperator())
  }

  async function loadForEdit(id: number): Promise<boolean> {
    const operator = await crud.run(() => usecases.getCashOperatorById(id))
    if (operator) crud.beginEdit(operator)
    return operator !== null
  }

  function patch(changes: Partial<CashOperator>): void {
    if (crud.editing.value) crud.setEditing(copyCashOperator(crud.editing.value, changes))
  }

  /**
   * Cancela a edição (ADR-001): restaura o operador original e devolve `'stay'`
   * (permanecer no detalhe) ou `'leave'` (registro novo → voltar à listagem).
   */
  function cancelEdit(): CancelOutcome {
    return crud.cancelEditing()
  }

  // Save / Inativar
  async function save(): Promise<boolean> {
    if (!crud.editing.value) return false
    const saved = await crud.run(() => usecases.saveCashOperator(crud.editing.value as CashOperator), {
      flag: 'saving',
    })
    if (saved) {
      crud.commitEditing(saved)
      crud.setSuccess('Operador salvo com sucesso.')
    }
    return saved !== null
  }

  /** Inativação lógica (spec): marca `active = false`; o registro permanece. */
  async function remove(id: number): Promise<boolean> {
    await crud.run(() => usecases.deleteCashOperator(id), { flag: 'deleting' })
    if (!crud.hasError.value) {
      crud.setSuccess('Operador inativado.')
      await load()
      return true
    }
    return false
  }

  return {
    ...crud,
    searched,
    currentSearch,
    currentStatus,
    load,
    loadNext,
    applyFilters,
    refresh,
    startNew,
    loadForEdit,
    patch,
    cancelEdit,
    save,
    remove,
  }
})
