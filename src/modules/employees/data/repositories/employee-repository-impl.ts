import {
  type AsyncResult,
  appError,
  guard,
  notFoundError,
  serverError,
} from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import { normalizeText, onlyDigits } from '@/shared/extensions'
import { type Employee, employeeFromJson, employeeToJson } from '../../domain/models'
import type { ListEmployeesParams, EmployeeRepository } from '../../domain/repositories'
import { MockEmployeeProvider } from '../providers/mock-employee-provider'

/**
 * EmployeeRepositoryImpl — CRUD de funcionários. Mappers, filtro/ordenação/
 * paginação client-side e `guard` para nunca vazar exception crua. CPF duplicado
 * vira **erro de conflito** (decisão P6 / spec §8).
 */
export class EmployeeRepositoryImpl implements EmployeeRepository {
  constructor(private readonly provider: MockEmployeeProvider) {}

  list(params: ListEmployeesParams): Promise<AsyncResult<PageResult<Employee>>> {
    return guard(
      async () => {
        const all = (await this.provider.list()).map(employeeFromJson)
        const term = params.filters?.search ? normalizeText(params.filters.search) : ''
        const digits = params.filters?.search ? onlyDigits(params.filters.search) : ''
        const status = params.filters?.status ?? 'all'

        const filtered = all.filter((employee) => {
          const matchesText =
            !term ||
            normalizeText(employee.name).includes(term) ||
            normalizeText(employee.nickname).includes(term) ||
            (digits.length > 0 && employee.cpf.includes(digits))
          const matchesStatus = status === 'all' || employee.status === status
          return matchesText && matchesStatus
        })

        const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        const start = (params.page - 1) * params.pageSize
        return { items: sorted.slice(start, start + params.pageSize), total: sorted.length }
      },
      (cause) => serverError('Não foi possível carregar os funcionários.', { cause }),
    )
  }

  getById(id: number): Promise<AsyncResult<Employee>> {
    return guard(
      async () => {
        const json = await this.provider.getById(id)
        if (!json) throw new Error('NOT_FOUND')
        return employeeFromJson(json)
      },
      (cause) => this.mapError(cause, 'Não foi possível carregar o funcionário.'),
    )
  }

  save(employee: Employee): Promise<AsyncResult<Employee>> {
    return guard(
      async () => employeeFromJson(await this.provider.save(employeeToJson(employee))),
      (cause) => this.mapError(cause, 'Não foi possível salvar o funcionário.'),
    )
  }

  remove(id: number): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.remove(id),
      (cause) => this.mapError(cause, 'Não foi possível excluir o funcionário.'),
    )
  }

  private mapError(cause: unknown, fallback: string) {
    if (cause instanceof Error && cause.message === 'NOT_FOUND') {
      return notFoundError('Funcionário não encontrado.', { cause })
    }
    if (cause instanceof Error && cause.message === 'CONFLICT_CPF') {
      return appError('conflict', 'CPF já cadastrado para outro funcionário.', { cause })
    }
    return serverError(fallback, { cause })
  }
}
