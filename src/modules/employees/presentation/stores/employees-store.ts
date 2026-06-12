import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseCrudStore, type CancelOutcome } from '@/shared/stores'
import { type Employee, copyEmployee, emptyEmployee } from '../../domain/models'
import type { EmployeeFilters } from '../../domain/repositories'
import { makeEmployeesUseCases } from '../../data/application'

/**
 * useEmployeesStore — CRUD de funcionários (spec `employee-registration`). Mesmo
 * padrão dos demais módulos: lista via `useBaseCrudStore` com **scroll infinito**
 * (ADR-002), edição com **snapshot imutável** (cancelar restaura e permanece —
 * ADR-001) e **limpeza antes de carregar** (evita flash do registro anterior —
 * Design System §10.11).
 */
export const useEmployeesStore = defineStore('employees', () => {
  const crud = useBaseCrudStore<Employee, EmployeeFilters>()
  const usecases = makeEmployeesUseCases()

  // Preserva o contexto ao voltar de um registro (não zera a pesquisa/situação).
  const searched = ref(false)
  const currentSearch = computed(() => crud.filters.value?.search ?? '')
  const currentStatus = computed(() => crud.filters.value?.status ?? 'all')

  async function load(): Promise<void> {
    await crud.loadPage((page, pageSize, filters) =>
      usecases.getEmployees({ page, pageSize, filters }),
    )
  }

  /** Carrega o próximo lote (scroll infinito — ADR-002). */
  async function loadNext(): Promise<void> {
    await crud.loadMore((page, pageSize, filters) =>
      usecases.getEmployees({ page, pageSize, filters }),
    )
  }

  function applyFilters(filters: EmployeeFilters): void {
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
    crud.beginCreate(emptyEmployee())
  }

  async function loadForEdit(id: number): Promise<boolean> {
    // Limpa o registro anterior ANTES de carregar (store singleton): a tela mostra
    // o skeleton em vez do funcionário velho (§10.11).
    crud.clearEditing()
    const employee = await crud.run(() => usecases.getEmployeeById(id))
    if (employee) crud.beginEdit(employee)
    return employee !== null
  }

  /** Aplica uma alteração parcial ao funcionário em edição (imutável). */
  function patch(changes: Partial<Employee>): void {
    if (crud.editing.value) crud.setEditing(copyEmployee(crud.editing.value, changes))
  }

  /**
   * Cancela a edição (ADR-001): restaura o original e devolve `'stay'`
   * (permanecer no detalhe) ou `'leave'` (registro novo → voltar à listagem).
   */
  function cancelEdit(): CancelOutcome {
    return crud.cancelEditing()
  }

  // Save / Delete
  async function save(): Promise<boolean> {
    if (!crud.editing.value) return false
    const saved = await crud.run(() => usecases.saveEmployee(crud.editing.value as Employee), {
      flag: 'saving',
    })
    if (saved) {
      crud.commitEditing(saved)
      crud.setSuccess('Funcionário salvo com sucesso.')
    }
    return saved !== null
  }

  async function remove(id: number): Promise<boolean> {
    await crud.run(() => usecases.deleteEmployee(id), { flag: 'deleting' })
    if (!crud.hasError.value) {
      crud.setSuccess('Funcionário excluído.')
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
