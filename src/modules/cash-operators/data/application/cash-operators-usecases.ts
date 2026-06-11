import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { CashOperator } from '../../domain/models'
import type { ListCashOperatorsParams, CashOperatorRepository } from '../../domain/repositories'
import { CashOperatorRepositoryImpl } from '../repositories/cash-operator-repository-impl'
import { MockCashOperatorProvider } from '../providers/mock-cash-operator-provider'

/**
 * UseCases do operador de caixa: lista paginada, lista de ativos (para os
 * seletores de outros módulos), busca por id, salvar (create/update) e inativar.
 * Factory explícita (UseCases → Repository → Provider), padrão do projeto.
 *
 * TROCA POR API REAL: trocar `MockCashOperatorProvider` por `RestCashOperatorProvider`.
 */
export interface CashOperatorsUseCases {
  getCashOperators: (params: ListCashOperatorsParams) => Promise<AsyncResult<PageResult<CashOperator>>>
  getActiveCashOperators: () => Promise<AsyncResult<CashOperator[]>>
  getCashOperatorById: (id: number) => Promise<AsyncResult<CashOperator>>
  saveCashOperator: (operator: CashOperator) => Promise<AsyncResult<CashOperator>>
  deleteCashOperator: (id: number) => Promise<AsyncResult<void>>
}

export function makeCashOperatorRepository(): CashOperatorRepository {
  return new CashOperatorRepositoryImpl(new MockCashOperatorProvider())
}

export function makeCashOperatorsUseCases(): CashOperatorsUseCases {
  const repository = makeCashOperatorRepository()
  return {
    getCashOperators: (params) => repository.list(params),
    getActiveCashOperators: () => repository.getActive(),
    getCashOperatorById: (id) => repository.getById(id),
    saveCashOperator: (operator) => repository.save(operator),
    deleteCashOperator: (id) => repository.remove(id),
  }
}
