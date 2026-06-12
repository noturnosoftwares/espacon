import type { AsyncResult } from '@/shared/result'
import type { City, RepresentativeSummary } from '../models'

/**
 * Contratos dos **lookups** type-to-search (spec `employee-registration` §12).
 * Cada um devolve uma lista curta de candidatos para o termo digitado. Os
 * cadastros próprios (Cidades, Representantes) ainda não existem — por ora,
 * `Mock*Provider`; a troca por REST não afeta store/usecase/widget.
 */
export interface CityLookupRepository {
  search(query: string): Promise<AsyncResult<City[]>>
}

export interface RepresentativeLookupRepository {
  search(query: string): Promise<AsyncResult<RepresentativeSummary[]>>
}
