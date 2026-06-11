import type { CashOperatorJson } from '../../domain/models'
import { MOCK_CASH_OPERATORS } from '../mocks/mock-cash-operators'

/**
 * MockCashOperatorProvider — provider do registro mestre de operadores na fase
 * mock-first. Mesmo padrão dos demais mocks: estado mutável em memória, latência
 * simulada, devolve JSON do contrato. Mantém a **unicidade de `code`** em memória.
 *
 * `remove` faz **inativação lógica** (`active = false`): operador referenciado por
 * usuários/lançamentos não é apagado fisicamente (spec — "inativar, não apagar").
 *
 * TROCA POR API REAL: `RestCashOperatorProvider` (`/financial/cash-operators`).
 */
const MOCK_LATENCY_MS = 350

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const store: CashOperatorJson[] = clone(MOCK_CASH_OPERATORS)

/** Sinaliza código duplicado para o repositório mapear a mensagem de validação. */
function hasDuplicateCode(code: string, exceptId: number): boolean {
  const target = code.trim().toLowerCase()
  return store.some((item) => item.id !== exceptId && item.code.trim().toLowerCase() === target)
}

export class MockCashOperatorProvider {
  async list(): Promise<CashOperatorJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store)
  }

  async getActive(): Promise<CashOperatorJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store.filter((item) => item.active))
  }

  async getById(id: number): Promise<CashOperatorJson | null> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((operator) => operator.id === id)
    return found ? clone(found) : null
  }

  async save(operator: CashOperatorJson): Promise<CashOperatorJson> {
    await delay(MOCK_LATENCY_MS)
    if (operator.id && operator.id > 0) {
      const index = store.findIndex((item) => item.id === operator.id)
      if (index === -1) throw new Error('NOT_FOUND')
      if (hasDuplicateCode(operator.code, operator.id)) throw new Error('DUPLICATE_CODE')
      store[index] = clone(operator)
      return clone(operator)
    }
    if (hasDuplicateCode(operator.code, 0)) throw new Error('DUPLICATE_CODE')
    const nextId = store.reduce((max, item) => Math.max(max, item.id), 0) + 1
    const created = { ...clone(operator), id: nextId }
    store.push(created)
    return clone(created)
  }

  /** Inativação lógica: marca `active = false` (não remove fisicamente). */
  async remove(id: number): Promise<void> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((item) => item.id === id)
    if (!found) throw new Error('NOT_FOUND')
    found.active = false
  }
}
