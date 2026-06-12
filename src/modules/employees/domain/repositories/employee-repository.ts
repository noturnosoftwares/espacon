import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { Employee } from '../models'
import type { EmployeeStatus } from '../enums/employee-status'

/** Filtro de situação da listagem (todas | uma situação específica). */
export type EmployeeStatusFilter = 'all' | EmployeeStatus

/** Filtros da pesquisa de funcionários (aba Buscar). */
export interface EmployeeFilters {
  /** Casa por **nome OU apelido OU CPF** (busca textual). */
  search?: string
  /** Situação: todas ou ATIVO/AFASTADO/DEMITIDO. */
  status?: EmployeeStatusFilter
}

export interface ListEmployeesParams {
  page: number
  pageSize: number
  filters: EmployeeFilters | null
}

/**
 * EmployeeRepository — contrato de CRUD de funcionários (spec
 * `employee-registration` §12). Mesmo padrão `AsyncResult` dos demais módulos.
 */
export interface EmployeeRepository {
  list(params: ListEmployeesParams): Promise<AsyncResult<PageResult<Employee>>>
  getById(id: number): Promise<AsyncResult<Employee>>
  save(employee: Employee): Promise<AsyncResult<Employee>>
  remove(id: number): Promise<AsyncResult<void>>
}
