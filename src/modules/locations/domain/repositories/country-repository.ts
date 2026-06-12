import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { Country } from '../models'
import type { LocationStatusFilter } from './repository-types'

export interface CountryFilters {
  /** Casa por nome, sigla ISO ou código BACEN. */
  search?: string
  status?: LocationStatusFilter
}

export interface ListCountriesParams {
  page: number
  pageSize: number
  filters: CountryFilters | null
}

/**
 * CountryRepository — CRUD do cadastro de País. `remove` é **inativação lógica**
 * (RESTRICT na presença de referências — spec §4.6); o padrão `AsyncResult` vale
 * para todos.
 */
export interface CountryRepository {
  list(params: ListCountriesParams): Promise<AsyncResult<PageResult<Country>>>
  getById(id: number): Promise<AsyncResult<Country>>
  save(country: Country): Promise<AsyncResult<Country>>
  remove(id: number): Promise<AsyncResult<void>>
}
