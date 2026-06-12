import type { AsyncResult } from '@/shared/result'
import type { BrazilianState } from '@/shared/models'
import type { City, RepresentativeSummary } from '../../domain/models'
import {
  CityLookupRepositoryImpl,
  RepresentativeLookupRepositoryImpl,
  StateLookupRepositoryImpl,
} from '../repositories/lookup-repositories-impl'
import { MockCityProvider } from '../providers/mock-city-provider'
import { MockRepresentativeProvider } from '../providers/mock-representative-provider'
import { MockStateProvider } from '../providers/mock-state-provider'

/**
 * UseCases dos **lookups** (spec §11): `SearchCities` e `SearchRepresentatives`.
 * Factory explícita; troca por REST não afeta store/widget.
 */
export interface LookupsUseCases {
  searchCities: (query: string) => Promise<AsyncResult<City[]>>
  searchRepresentatives: (query: string) => Promise<AsyncResult<RepresentativeSummary[]>>
  searchStates: (query: string) => Promise<AsyncResult<BrazilianState[]>>
}

export function makeLookupsUseCases(): LookupsUseCases {
  const cityRepository = new CityLookupRepositoryImpl(new MockCityProvider())
  const representativeRepository = new RepresentativeLookupRepositoryImpl(
    new MockRepresentativeProvider(),
  )
  const stateRepository = new StateLookupRepositoryImpl(new MockStateProvider())
  return {
    searchCities: (query) => cityRepository.search(query),
    searchRepresentatives: (query) => representativeRepository.search(query),
    searchStates: (query) => stateRepository.search(query),
  }
}
