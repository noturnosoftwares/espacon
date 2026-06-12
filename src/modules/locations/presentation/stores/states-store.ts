import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseCrudStore, type CancelOutcome } from '@/shared/stores'
import { type State, copyState, emptyState } from '../../domain/models'
import type { StateFilters } from '../../domain/repositories'
import { makeStatesUseCases } from '../../data/application'

/**
 * useStatesStore — CRUD de Estado/UF (spec `locations`). Inativação lógica no
 * `remove` (§4.6); filtro opcional por país.
 */
export const useStatesStore = defineStore('locations-states', () => {
  const crud = useBaseCrudStore<State, StateFilters>()
  const usecases = makeStatesUseCases()

  const searched = ref(false)
  const currentSearch = computed(() => crud.filters.value?.search ?? '')
  const currentStatus = computed(() => crud.filters.value?.status ?? 'all')

  async function load(): Promise<void> {
    await crud.loadPage((page, pageSize, filters) =>
      usecases.getStates({ page, pageSize, filters }),
    )
  }
  async function loadNext(): Promise<void> {
    await crud.loadMore((page, pageSize, filters) =>
      usecases.getStates({ page, pageSize, filters }),
    )
  }
  function applyFilters(filters: StateFilters): void {
    searched.value = true
    crud.setFilters(filters)
    void load()
  }
  async function refresh(): Promise<void> {
    if (searched.value) await load()
  }

  function startNew(): void {
    crud.beginCreate(emptyState())
  }
  async function loadForEdit(id: number): Promise<boolean> {
    crud.clearEditing()
    const state = await crud.run(() => usecases.getStateById(id))
    if (state) crud.beginEdit(state)
    return state !== null
  }
  function patch(changes: Partial<State>): void {
    if (crud.editing.value) crud.setEditing(copyState(crud.editing.value, changes))
  }
  function cancelEdit(): CancelOutcome {
    return crud.cancelEditing()
  }

  async function save(): Promise<boolean> {
    if (!crud.editing.value) return false
    const saved = await crud.run(() => usecases.saveState(crud.editing.value as State), {
      flag: 'saving',
    })
    if (saved) {
      crud.commitEditing(saved)
      crud.setSuccess('Estado salvo com sucesso.')
    }
    return saved !== null
  }
  async function remove(id: number): Promise<boolean> {
    await crud.run(() => usecases.deleteState(id), { flag: 'deleting' })
    if (!crud.hasError.value) {
      crud.setSuccess('Estado inativado.')
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
