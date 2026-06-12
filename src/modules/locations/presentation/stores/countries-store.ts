import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseCrudStore, type CancelOutcome } from '@/shared/stores'
import { type Country, copyCountry, emptyCountry } from '../../domain/models'
import type { CountryFilters } from '../../domain/repositories'
import { makeCountriesUseCases } from '../../data/application'

/**
 * useCountriesStore — CRUD de País (spec `locations`). Mesmo padrão dos demais
 * cadastros: lista via `useBaseCrudStore` com scroll infinito (ADR-002) e edição
 * com snapshot imutável (ADR-001). "Excluir" é **inativação lógica** (§4.6).
 */
export const useCountriesStore = defineStore('locations-countries', () => {
  const crud = useBaseCrudStore<Country, CountryFilters>()
  const usecases = makeCountriesUseCases()

  const searched = ref(false)
  const currentSearch = computed(() => crud.filters.value?.search ?? '')
  const currentStatus = computed(() => crud.filters.value?.status ?? 'all')

  async function load(): Promise<void> {
    await crud.loadPage((page, pageSize, filters) =>
      usecases.getCountries({ page, pageSize, filters }),
    )
  }
  async function loadNext(): Promise<void> {
    await crud.loadMore((page, pageSize, filters) =>
      usecases.getCountries({ page, pageSize, filters }),
    )
  }
  function applyFilters(filters: CountryFilters): void {
    searched.value = true
    crud.setFilters(filters)
    void load()
  }
  async function refresh(): Promise<void> {
    if (searched.value) await load()
  }

  function startNew(): void {
    crud.beginCreate(emptyCountry())
  }
  async function loadForEdit(id: number): Promise<boolean> {
    crud.clearEditing()
    const country = await crud.run(() => usecases.getCountryById(id))
    if (country) crud.beginEdit(country)
    return country !== null
  }
  function patch(changes: Partial<Country>): void {
    if (crud.editing.value) crud.setEditing(copyCountry(crud.editing.value, changes))
  }
  function cancelEdit(): CancelOutcome {
    return crud.cancelEditing()
  }

  async function save(): Promise<boolean> {
    if (!crud.editing.value) return false
    const saved = await crud.run(() => usecases.saveCountry(crud.editing.value as Country), {
      flag: 'saving',
    })
    if (saved) {
      crud.commitEditing(saved)
      crud.setSuccess('País salvo com sucesso.')
    }
    return saved !== null
  }
  async function remove(id: number): Promise<boolean> {
    await crud.run(() => usecases.deleteCountry(id), { flag: 'deleting' })
    if (!crud.hasError.value) {
      crud.setSuccess('País inativado.')
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
