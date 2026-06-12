import {
  type AsyncResult,
  guard,
  notFoundError,
  serverError,
  validationError,
} from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import { normalizeText } from '@/shared/extensions'
import { type City, cityFromJson, cityToJson } from '../../domain/models'
import type { CityRepository, ListCitiesParams } from '../../domain/repositories'
import { MockCityProvider } from '../providers/mock-city-provider'

/** CRUD de Cidade: mappers, filtro/ordenação/paginação client-side, `guard`. */
export class CityRepositoryImpl implements CityRepository {
  constructor(private readonly provider: MockCityProvider) {}

  list(params: ListCitiesParams): Promise<AsyncResult<PageResult<City>>> {
    return guard(
      async () => {
        const all = (await this.provider.list()).map(cityFromJson)
        const search = params.filters?.search ? normalizeText(params.filters.search) : ''
        const status = params.filters?.status ?? 'all'
        const stateId = params.filters?.stateId ?? null
        const filtered = all.filter((c) => {
          const matchesText =
            !search ||
            normalizeText(c.name).includes(search) ||
            normalizeText(c.uf).includes(search) ||
            c.ibgeCode.includes(search)
          const matchesStatus =
            status === 'all' || (status === 'active' ? c.active : !c.active)
          const matchesState = stateId == null || c.stateId === stateId
          return matchesText && matchesStatus && matchesState
        })
        const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        const start = (params.page - 1) * params.pageSize
        return { items: sorted.slice(start, start + params.pageSize), total: sorted.length }
      },
      (cause) => serverError('Não foi possível carregar as cidades.', { cause }),
    )
  }

  getById(id: number): Promise<AsyncResult<City>> {
    return guard(
      async () => {
        const json = await this.provider.getById(id)
        if (!json) throw new Error('NOT_FOUND')
        return cityFromJson(json)
      },
      (cause) => this.mapError(cause, 'Não foi possível carregar a cidade.'),
    )
  }

  save(city: City): Promise<AsyncResult<City>> {
    return guard(
      async () => cityFromJson(await this.provider.save(cityToJson(city))),
      (cause) => this.mapError(cause, 'Não foi possível salvar a cidade.'),
    )
  }

  remove(id: number): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.remove(id),
      (cause) => this.mapError(cause, 'Não foi possível inativar a cidade.'),
    )
  }

  private mapError(cause: unknown, fallback: string) {
    if (cause instanceof Error && cause.message === 'NOT_FOUND') {
      return notFoundError('Cidade não encontrada.', { cause })
    }
    if (cause instanceof Error && cause.message === 'DUPLICATE_CMUN') {
      return validationError('Já existe uma cidade com este código IBGE.', { cause })
    }
    return serverError(fallback, { cause })
  }
}
