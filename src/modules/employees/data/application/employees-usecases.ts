import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { Employee } from '../../domain/models'
import type { ListEmployeesParams, EmployeeRepository } from '../../domain/repositories'
import { EmployeeRepositoryImpl } from '../repositories/employee-repository-impl'
import { MockEmployeeProvider } from '../providers/mock-employee-provider'

/**
 * UseCases de funcionário: `GetEmployees`, `GetEmployeeById`, `SaveEmployee`,
 * `DeleteEmployee` (spec §11). Factory explícita (UseCases → Repository → Provider).
 *
 * TROCA POR API REAL: trocar `MockEmployeeProvider` por `RestEmployeeProvider`.
 */
export interface EmployeesUseCases {
  getEmployees: (params: ListEmployeesParams) => Promise<AsyncResult<PageResult<Employee>>>
  getEmployeeById: (id: number) => Promise<AsyncResult<Employee>>
  saveEmployee: (employee: Employee) => Promise<AsyncResult<Employee>>
  deleteEmployee: (id: number) => Promise<AsyncResult<void>>
}

export function makeEmployeeRepository(): EmployeeRepository {
  return new EmployeeRepositoryImpl(new MockEmployeeProvider())
}

export function makeEmployeesUseCases(): EmployeesUseCases {
  const repository = makeEmployeeRepository()
  return {
    getEmployees: (params) => repository.list(params),
    getEmployeeById: (id) => repository.getById(id),
    saveEmployee: (employee) => repository.save(employee),
    deleteEmployee: (id) => repository.remove(id),
  }
}
