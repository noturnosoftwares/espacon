import type { AsyncResult } from '@/shared/result'
import type { City, RepresentativeSummary } from '../../domain/models'
import {
  CityLookupRepositoryImpl,
  RepresentativeLookupRepositoryImpl,
} from '../repositories/lookup-repositories-impl'
import { MockCityProvider } from '../providers/mock-city-provider'
import { MockRepresentativeProvider } from '../providers/mock-representative-provider'

/**
 * UseCases dos **lookups** (spec §11): `SearchCities` e `SearchRepresentatives`.
 * Factory explícita; troca por REST não afeta store/widget.
 */
export interface LookupsUseCases {
  searchCities: (query: string) => Promise<AsyncResult<City[]>>
  searchRepresentatives: (query: string) => Promise<AsyncResult<RepresentativeSummary[]>>
}

export function makeLookupsUseCases(): LookupsUseCases {
  const cityRepository = new CityLookupRepositoryImpl(new MockCityProvider())
  const representativeRepository = new RepresentativeLookupRepositoryImpl(
    new MockRepresentativeProvider(),
  )
  return {
    searchCities: (query) => cityRepository.search(query),
    searchRepresentatives: (query) => representativeRepository.search(query),
  }
}
