import type { AsyncResult } from '@/shared/result'
import type { CitySummary, CountrySummary, StateSummary } from '../../domain/models'
import {
  CityLookupRepositoryImpl,
  CountryLookupRepositoryImpl,
  StateLookupRepositoryImpl,
} from '../repositories/lookup-repositories-impl'
import { MockCountryProvider } from '../providers/mock-country-provider'
import { MockStateProvider } from '../providers/mock-state-provider'
import { MockCityProvider } from '../providers/mock-city-provider'

/**
 * Lookups de localização (spec §5.4) consumidos por **outros cadastros**. Cada um
 * devolve uma lista curta de resumos para os `*LookupField`. Factory explícita;
 * troca por REST não afeta widget/store.
 */
export interface LocationLookupsUseCases {
  searchCountries: (query: string) => Promise<AsyncResult<CountrySummary[]>>
  searchStates: (query: string, countryId?: number | null) => Promise<AsyncResult<StateSummary[]>>
  searchCities: (query: string, stateId?: number | null) => Promise<AsyncResult<CitySummary[]>>
}

export function makeLocationLookupsUseCases(): LocationLookupsUseCases {
  const countries = new CountryLookupRepositoryImpl(new MockCountryProvider())
  const states = new StateLookupRepositoryImpl(new MockStateProvider())
  const cities = new CityLookupRepositoryImpl(new MockCityProvider())
  return {
    searchCountries: (query) => countries.search(query),
    searchStates: (query, countryId) => states.search(query, countryId),
    searchCities: (query, stateId) => cities.search(query, stateId),
  }
}
