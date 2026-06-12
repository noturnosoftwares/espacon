import { onlyDigits } from '@/shared/extensions'
import type { EmployeeJson } from '../../domain/models'
import { MOCK_EMPLOYEES } from '../mocks/mock-employees'

/**
 * MockEmployeeProvider — CRUD em memória (spec §13). Estado mutável persistente na
 * sessão, latência simulada (~padrão do projeto) e **unicidade de CPF** (decisão
 * P6) verificada no save. Devolve JSON do contrato.
 *
 * TROCA POR API REAL: `RestEmployeeProvider` (`/employees`).
 */
const MOCK_LATENCY_MS = 500

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const store: EmployeeJson[] = clone(MOCK_EMPLOYEES)

/** Sinaliza CPF duplicado (decisão P6) para o repositório mapear a mensagem. */
function hasDuplicateCpf(cpf: string, exceptId: number | null): boolean {
  const target = onlyDigits(cpf)
  return store.some((item) => item.codigo !== exceptId && onlyDigits(item.cpf) === target)
}

export class MockEmployeeProvider {
  async list(): Promise<EmployeeJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store)
  }

  async getById(id: number): Promise<EmployeeJson | null> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((employee) => employee.codigo === id)
    return found ? clone(found) : null
  }

  async save(employee: EmployeeJson): Promise<EmployeeJson> {
    await delay(MOCK_LATENCY_MS)
    if (employee.codigo && employee.codigo > 0) {
      const index = store.findIndex((item) => item.codigo === employee.codigo)
      if (index === -1) throw new Error('NOT_FOUND')
      if (hasDuplicateCpf(employee.cpf, employee.codigo)) throw new Error('CONFLICT_CPF')
      store[index] = clone(employee)
      return clone(employee)
    }
    if (hasDuplicateCpf(employee.cpf, null)) throw new Error('CONFLICT_CPF')
    const nextId = store.reduce((max, item) => Math.max(max, item.codigo ?? 0), 0) + 1
    const created = { ...clone(employee), codigo: nextId }
    store.push(created)
    return clone(created)
  }

  async remove(id: number): Promise<void> {
    await delay(MOCK_LATENCY_MS)
    const index = store.findIndex((item) => item.codigo === id)
    if (index === -1) throw new Error('NOT_FOUND')
    store.splice(index, 1)
  }
}
