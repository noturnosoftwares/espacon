import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { CashOperator } from '../models'

/** Filtro de situação da listagem (espelha o filtro de Situação dos usuários). */
export type CashOperatorStatusFilter = 'all' | 'active' | 'inactive'

/** Filtros da listagem de operadores de caixa. */
export interface CashOperatorFilters {
  /** Casa por **código OU nome** (busca textual). */
  search?: string
  /** Situação: todas | só ativos | só inativos. */
  status?: CashOperatorStatusFilter
}

export interface ListCashOperatorsParams {
  page: number
  pageSize: number
  filters: CashOperatorFilters | null
}

/**
 * CashOperatorRepository — contrato de CRUD do registro mestre de operadores de
 * caixa (spec `financial/cash-operator`). Mesmo padrão `AsyncResult` dos demais
 * repositórios.
 *
 * `getActive` alimenta os **seletores** de outros módulos (usuário, financeiro) —
 * só operadores `active`. A `remove` faz **inativação lógica** (`active = false`),
 * preservando a integridade de registros históricos que referenciam o `code`.
 */
export interface CashOperatorRepository {
  list(params: ListCashOperatorsParams): Promise<AsyncResult<PageResult<CashOperator>>>
  getActive(): Promise<AsyncResult<CashOperator[]>>
  getById(id: number): Promise<AsyncResult<CashOperator>>
  save(operator: CashOperator): Promise<AsyncResult<CashOperator>>
  /** Inativação lógica (`active = false`) — ver spec, princípio "inativar, não apagar". */
  remove(id: number): Promise<AsyncResult<void>>
}
