import type { AsyncResult } from '@/shared/result'
import type { CitySummary, CountrySummary, StateSummary } from '../models'

/**
 * Lookups read-only (spec §12) expostos para **outros cadastros** (Funcionário,
 * Cliente, Fornecedor…). Devolvem **resumos** (`*Summary`) — payload leve para os
 * campos de referência (`*LookupField`). País/Estado/Cidade são a fonte única.
 */
export interface CountryLookupRepository {
  search(query: string): Promise<AsyncResult<CountrySummary[]>>
}

export interface StateLookupRepository {
  /** `countryId` opcional restringe ao país (cadastro de Cidade/Estado). */
  search(query: string, countryId?: number | null): Promise<AsyncResult<StateSummary[]>>
}

export interface CityLookupRepository {
  /** `stateId` opcional restringe ao estado. */
  search(query: string, stateId?: number | null): Promise<AsyncResult<CitySummary[]>>
}
