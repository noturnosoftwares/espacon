import { type AsyncResult, guard, serverError } from '@/shared/result'
import {
  type CitySummary,
  type CountrySummary,
  type StateSummary,
  cityFromJson,
  countryFromJson,
  stateFromJson,
  toCitySummary,
  toCountrySummary,
  toStateSummary,
} from '../../domain/models'
import type {
  CityLookupRepository,
  CountryLookupRepository,
  StateLookupRepository,
} from '../../domain/repositories'
import { MockCountryProvider } from '../providers/mock-country-provider'
import { MockStateProvider } from '../providers/mock-state-provider'
import { MockCityProvider } from '../providers/mock-city-provider'

/** Lookup de País → `CountrySummary`. */
export class CountryLookupRepositoryImpl implements CountryLookupRepository {
  constructor(private readonly provider: MockCountryProvider) {}

  search(query: string): Promise<AsyncResult<CountrySummary[]>> {
    return guard(
      async () => (await this.provider.search(query)).map(countryFromJson).map(toCountrySummary),
      (cause) => serverError('Não foi possível buscar países.', { cause }),
    )
  }
}

/** Lookup de Estado → `StateSummary` (filtro opcional por país). */
export class StateLookupRepositoryImpl implements StateLookupRepository {
  constructor(private readonly provider: MockStateProvider) {}

  search(query: string, countryId?: number | null): Promise<AsyncResult<StateSummary[]>> {
    return guard(
      async () =>
        (await this.provider.search(query, countryId)).map(stateFromJson).map(toStateSummary),
      (cause) => serverError('Não foi possível buscar estados.', { cause }),
    )
  }
}

/** Lookup de Cidade → `CitySummary` (filtro opcional por estado). */
export class CityLookupRepositoryImpl implements CityLookupRepository {
  constructor(private readonly provider: MockCityProvider) {}

  search(query: string, stateId?: number | null): Promise<AsyncResult<CitySummary[]>> {
    return guard(
      async () => (await this.provider.search(query, stateId)).map(cityFromJson).map(toCitySummary),
      (cause) => serverError('Não foi possível buscar cidades.', { cause }),
    )
  }
}
