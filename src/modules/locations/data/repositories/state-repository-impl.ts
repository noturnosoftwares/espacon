import {
  type AsyncResult,
  guard,
  notFoundError,
  serverError,
  validationError,
} from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import { normalizeText } from '@/shared/extensions'
import { type State, stateFromJson, stateToJson } from '../../domain/models'
import type { ListStatesParams, StateRepository } from '../../domain/repositories'
import { MockStateProvider } from '../providers/mock-state-provider'

/** CRUD de Estado/UF: mappers, filtro/ordenação/paginação client-side, `guard`. */
export class StateRepositoryImpl implements StateRepository {
  constructor(private readonly provider: MockStateProvider) {}

  list(params: ListStatesParams): Promise<AsyncResult<PageResult<State>>> {
    return guard(
      async () => {
        const all = (await this.provider.list()).map(stateFromJson)
        const search = params.filters?.search ? normalizeText(params.filters.search) : ''
        const status = params.filters?.status ?? 'all'
        const countryId = params.filters?.countryId ?? null
        const filtered = all.filter((s) => {
          const matchesText =
            !search ||
            normalizeText(s.name).includes(search) ||
            normalizeText(s.uf).includes(search) ||
            s.ibgeCode.includes(search)
          const matchesStatus =
            status === 'all' || (status === 'active' ? s.active : !s.active)
          const matchesCountry = countryId == null || s.countryId === countryId
          return matchesText && matchesStatus && matchesCountry
        })
        const sorted = filtered.sort((a, b) => a.uf.localeCompare(b.uf, 'pt-BR'))
        const start = (params.page - 1) * params.pageSize
        return { items: sorted.slice(start, start + params.pageSize), total: sorted.length }
      },
      (cause) => serverError('Não foi possível carregar os estados.', { cause }),
    )
  }

  getById(id: number): Promise<AsyncResult<State>> {
    return guard(
      async () => {
        const json = await this.provider.getById(id)
        if (!json) throw new Error('NOT_FOUND')
        return stateFromJson(json)
      },
      (cause) => this.mapError(cause, 'Não foi possível carregar o estado.'),
    )
  }

  save(state: State): Promise<AsyncResult<State>> {
    return guard(
      async () => stateFromJson(await this.provider.save(stateToJson(state))),
      (cause) => this.mapError(cause, 'Não foi possível salvar o estado.'),
    )
  }

  remove(id: number): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.remove(id),
      (cause) => this.mapError(cause, 'Não foi possível inativar o estado.'),
    )
  }

  private mapError(cause: unknown, fallback: string) {
    if (cause instanceof Error && cause.message === 'NOT_FOUND') {
      return notFoundError('Estado não encontrado.', { cause })
    }
    if (cause instanceof Error && cause.message === 'DUPLICATE_UF') {
      return validationError('Já existe um estado com esta sigla neste país.', { cause })
    }
    if (cause instanceof Error && cause.message === 'DUPLICATE_CUF') {
      return validationError('Já existe um estado com este código IBGE neste país.', { cause })
    }
    return serverError(fallback, { cause })
  }
}
