import { type AsyncResult, guard, serverError } from '@/shared/result'
import {
  type City,
  type RepresentativeSummary,
  cityFromJson,
  representativeFromJson,
} from '../../domain/models'
import type {
  CityLookupRepository,
  RepresentativeLookupRepository,
} from '../../domain/repositories'
import { MockCityProvider } from '../providers/mock-city-provider'
import { MockRepresentativeProvider } from '../providers/mock-representative-provider'

/** Lookup de cidade — mappers + `guard`. */
export class CityLookupRepositoryImpl implements CityLookupRepository {
  constructor(private readonly provider: MockCityProvider) {}

  search(query: string): Promise<AsyncResult<City[]>> {
    return guard(
      async () => (await this.provider.search(query)).map(cityFromJson),
      (cause) => serverError('Não foi possível buscar cidades.', { cause }),
    )
  }
}

/** Lookup de representante — mappers + `guard`. */
export class RepresentativeLookupRepositoryImpl implements RepresentativeLookupRepository {
  constructor(private readonly provider: MockRepresentativeProvider) {}

  search(query: string): Promise<AsyncResult<RepresentativeSummary[]>> {
    return guard(
      async () => (await this.provider.search(query)).map(representativeFromJson),
      (cause) => serverError('Não foi possível buscar representantes.', { cause }),
    )
  }
}
