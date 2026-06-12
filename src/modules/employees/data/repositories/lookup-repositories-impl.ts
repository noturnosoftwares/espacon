import { type AsyncResult, guard, serverError } from '@/shared/result'
import type { BrazilianState } from '@/shared/models'
import {
  type City,
  type RepresentativeSummary,
  cityFromJson,
  representativeFromJson,
} from '../../domain/models'
import type {
  CityLookupRepository,
  RepresentativeLookupRepository,
  StateLookupRepository,
} from '../../domain/repositories'
import { MockCityProvider } from '../providers/mock-city-provider'
import { MockRepresentativeProvider } from '../providers/mock-representative-provider'
import { MockStateProvider } from '../providers/mock-state-provider'

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

/** Lookup de estado/UF — lista estática já é domínio (sem mapper). */
export class StateLookupRepositoryImpl implements StateLookupRepository {
  constructor(private readonly provider: MockStateProvider) {}

  search(query: string): Promise<AsyncResult<BrazilianState[]>> {
    return guard(
      async () => this.provider.search(query),
      (cause) => serverError('Não foi possível buscar estados.', { cause }),
    )
  }
}
