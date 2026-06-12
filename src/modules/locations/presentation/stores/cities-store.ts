import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseCrudStore, type CancelOutcome } from '@/shared/stores'
import { type City, copyCity, emptyCity } from '../../domain/models'
import type { CityFilters } from '../../domain/repositories'
import { makeCitiesUseCases } from '../../data/application'

/**
 * useCitiesStore — CRUD de Cidade (spec `locations`). Inativação lógica no
 * `remove` (§4.6); filtro opcional por estado.
 */
export const useCitiesStore = defineStore('locations-cities', () => {
  const crud = useBaseCrudStore<City, CityFilters>()
  const usecases = makeCitiesUseCases()

  const searched = ref(false)
  const currentSearch = computed(() => crud.filters.value?.search ?? '')
  const currentStatus = computed(() => crud.filters.value?.status ?? 'all')

  async function load(): Promise<void> {
    await crud.loadPage((page, pageSize, filters) =>
      usecases.getCities({ page, pageSize, filters }),
    )
  }
  async function loadNext(): Promise<void> {
    await crud.loadMore((page, pageSize, filters) =>
      usecases.getCities({ page, pageSize, filters }),
    )
  }
  function applyFilters(filters: CityFilters): void {
    searched.value = true
    crud.setFilters(filters)
    void load()
  }
  async function refresh(): Promise<void> {
    if (searched.value) await load()
  }

  function startNew(): void {
    crud.beginCreate(emptyCity())
  }
  async function loadForEdit(id: number): Promise<boolean> {
    crud.clearEditing()
    const city = await crud.run(() => usecases.getCityById(id))
    if (city) crud.beginEdit(city)
    return city !== null
  }
  function patch(changes: Partial<City>): void {
    if (crud.editing.value) crud.setEditing(copyCity(crud.editing.value, changes))
  }
  function cancelEdit(): CancelOutcome {
    return crud.cancelEditing()
  }

  async function save(): Promise<boolean> {
    if (!crud.editing.value) return false
    const saved = await crud.run(() => usecases.saveCity(crud.editing.value as City), {
      flag: 'saving',
    })
    if (saved) {
      crud.commitEditing(saved)
      crud.setSuccess('Cidade salva com sucesso.')
    }
    return saved !== null
  }
  async function remove(id: number): Promise<boolean> {
    await crud.run(() => usecases.deleteCity(id), { flag: 'deleting' })
    if (!crud.hasError.value) {
      crud.setSuccess('Cidade inativada.')
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
