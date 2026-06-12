import {
  type AsyncResult,
  guard,
  notFoundError,
  serverError,
  validationError,
} from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import { normalizeText } from '@/shared/extensions'
import { type Country, countryFromJson, countryToJson } from '../../domain/models'
import type { CountryRepository, ListCountriesParams } from '../../domain/repositories'
import { MockCountryProvider } from '../providers/mock-country-provider'

/** CRUD de País: mappers, filtro/ordenação/paginação client-side, `guard`. */
export class CountryRepositoryImpl implements CountryRepository {
  constructor(private readonly provider: MockCountryProvider) {}

  list(params: ListCountriesParams): Promise<AsyncResult<PageResult<Country>>> {
    return guard(
      async () => {
        const all = (await this.provider.list()).map(countryFromJson)
        const search = params.filters?.search ? normalizeText(params.filters.search) : ''
        const status = params.filters?.status ?? 'all'
        const filtered = all.filter((c) => {
          const matchesText =
            !search ||
            normalizeText(c.name).includes(search) ||
            normalizeText(c.iso2).includes(search) ||
            c.bacenCode.includes(search)
          const matchesStatus =
            status === 'all' || (status === 'active' ? c.active : !c.active)
          return matchesText && matchesStatus
        })
        const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        const start = (params.page - 1) * params.pageSize
        return { items: sorted.slice(start, start + params.pageSize), total: sorted.length }
      },
      (cause) => serverError('Não foi possível carregar os países.', { cause }),
    )
  }

  getById(id: number): Promise<AsyncResult<Country>> {
    return guard(
      async () => {
        const json = await this.provider.getById(id)
        if (!json) throw new Error('NOT_FOUND')
        return countryFromJson(json)
      },
      (cause) => this.mapError(cause, 'Não foi possível carregar o país.'),
    )
  }

  save(country: Country): Promise<AsyncResult<Country>> {
    return guard(
      async () => countryFromJson(await this.provider.save(countryToJson(country))),
      (cause) => this.mapError(cause, 'Não foi possível salvar o país.'),
    )
  }

  remove(id: number): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.remove(id),
      (cause) => this.mapError(cause, 'Não foi possível inativar o país.'),
    )
  }

  private mapError(cause: unknown, fallback: string) {
    if (cause instanceof Error && cause.message === 'NOT_FOUND') {
      return notFoundError('País não encontrado.', { cause })
    }
    if (cause instanceof Error && cause.message === 'DUPLICATE_BACEN') {
      return validationError('Já existe um país com este código BACEN.', { cause })
    }
    if (cause instanceof Error && cause.message === 'DUPLICATE_ISO2') {
      return validationError('Já existe um país com esta sigla ISO.', { cause })
    }
    return serverError(fallback, { cause })
  }
}
