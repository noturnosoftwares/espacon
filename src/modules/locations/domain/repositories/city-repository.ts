import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { City } from '../models'
import type { LocationStatusFilter } from './repository-types'

export interface CityFilters {
  /** Casa por nome, UF ou código IBGE. */
  search?: string
  status?: LocationStatusFilter
  /** Restringe a um estado (lookup filtrado). */
  stateId?: number | null
}

export interface ListCitiesParams {
  page: number
  pageSize: number
  filters: CityFilters | null
}

export interface CityRepository {
  list(params: ListCitiesParams): Promise<AsyncResult<PageResult<City>>>
  getById(id: number): Promise<AsyncResult<City>>
  save(city: City): Promise<AsyncResult<City>>
  remove(id: number): Promise<AsyncResult<void>>
}
