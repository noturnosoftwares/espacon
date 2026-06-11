import {
  type AsyncResult,
  guard,
  notFoundError,
  serverError,
  validationError,
} from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import { normalizeText } from '@/shared/extensions'
import { type CashOperator, cashOperatorFromJson, cashOperatorToJson } from '../../domain/models'
import type { ListCashOperatorsParams, CashOperatorRepository } from '../../domain/repositories'
import { MockCashOperatorProvider } from '../providers/mock-cash-operator-provider'

/**
 * CashOperatorRepositoryImpl — CRUD do registro mestre. Mesmo padrão dos demais
 * repositórios: mappers, filtro/ordenação/paginação client-side e `guard` para
 * nunca vazar exception crua. Código duplicado vira **erro de validação**.
 */
export class CashOperatorRepositoryImpl implements CashOperatorRepository {
  constructor(private readonly provider: MockCashOperatorProvider) {}

  list(params: ListCashOperatorsParams): Promise<AsyncResult<PageResult<CashOperator>>> {
    return guard(
      async () => {
        const all = (await this.provider.list()).map(cashOperatorFromJson)
        const search = params.filters?.search ? normalizeText(params.filters.search) : ''
        const status = params.filters?.status ?? 'all'
        const filtered = all.filter((operator) => {
          const matchesText =
            !search ||
            normalizeText(operator.code).includes(search) ||
            normalizeText(operator.name).includes(search)
          const matchesStatus =
            status === 'all' ||
            (status === 'active' ? operator.active : !operator.active)
          return matchesText && matchesStatus
        })
        const sorted = filtered.sort((a, b) => a.code.localeCompare(b.code, 'pt-BR', { numeric: true }))
        const start = (params.page - 1) * params.pageSize
        return { items: sorted.slice(start, start + params.pageSize), total: sorted.length }
      },
      (cause) => serverError('Não foi possível carregar os operadores de caixa.', { cause }),
    )
  }

  getActive(): Promise<AsyncResult<CashOperator[]>> {
    return guard(
      async () =>
        (await this.provider.getActive())
          .map(cashOperatorFromJson)
          .sort((a, b) => a.code.localeCompare(b.code, 'pt-BR', { numeric: true })),
      (cause) => serverError('Não foi possível carregar os operadores ativos.', { cause }),
    )
  }

  getById(id: number): Promise<AsyncResult<CashOperator>> {
    return guard(
      async () => {
        const json = await this.provider.getById(id)
        if (!json) throw new Error('NOT_FOUND')
        return cashOperatorFromJson(json)
      },
      (cause) => this.mapError(cause, 'Não foi possível carregar o operador.'),
    )
  }

  save(operator: CashOperator): Promise<AsyncResult<CashOperator>> {
    return guard(
      async () => cashOperatorFromJson(await this.provider.save(cashOperatorToJson(operator))),
      (cause) => this.mapError(cause, 'Não foi possível salvar o operador.'),
    )
  }

  remove(id: number): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.remove(id),
      (cause) => this.mapError(cause, 'Não foi possível inativar o operador.'),
    )
  }

  private mapError(cause: unknown, fallback: string) {
    if (cause instanceof Error && cause.message === 'NOT_FOUND') {
      return notFoundError('Operador não encontrado.', { cause })
    }
    if (cause instanceof Error && cause.message === 'DUPLICATE_CODE') {
      return validationError('Já existe um operador com este código.', { cause })
    }
    return serverError(fallback, { cause })
  }
}
