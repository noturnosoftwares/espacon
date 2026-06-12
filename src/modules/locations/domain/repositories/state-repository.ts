import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { State } from '../models'
import type { LocationStatusFilter } from './repository-types'

export interface StateFilters {
  /** Casa por nome, sigla (UF) ou código IBGE. */
  search?: string
  status?: LocationStatusFilter
  /** Restringe a um país (lookup filtrado). */
  countryId?: number | null
}

export interface ListStatesParams {
  page: number
  pageSize: number
  filters: StateFilters | null
}

export interface StateRepository {
  list(params: ListStatesParams): Promise<AsyncResult<PageResult<State>>>
  getById(id: number): Promise<AsyncResult<State>>
  save(state: State): Promise<AsyncResult<State>>
  remove(id: number): Promise<AsyncResult<void>>
}
