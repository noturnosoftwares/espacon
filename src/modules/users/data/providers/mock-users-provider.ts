import type { UserJson } from '../../domain/models'
import { MOCK_USERS } from '../mocks/mock-users'

/**
 * MockUsersProvider — provider de usuários na fase mock-first (ADR-001).
 *
 * Mantém uma cópia mutável em memória (clonada do mock) para que criação/edição/
 * exclusão persistam durante a sessão do navegador. Devolve **JSON do contrato**
 * (alvo da futura API REST); filtro/ordenação/paginação ficam no repository.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ TROCA POR API REAL: `RestUsersProvider` chama o `HttpClient` nos endpoints │
 * │ de usuário. Repository, usecases, stores e telas não mudam.                 │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
const MOCK_LATENCY_MS = 400

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

/** Estado mutável da sessão (não compartilha referência com o mock original). */
const store: UserJson[] = clone(MOCK_USERS)

export class MockUsersProvider {
  async list(): Promise<UserJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store)
  }

  async getById(id: number): Promise<UserJson | null> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((user) => user.id === id)
    return found ? clone(found) : null
  }

  async save(user: UserJson): Promise<UserJson> {
    await delay(MOCK_LATENCY_MS)
    if (user.id && user.id > 0) {
      const index = store.findIndex((item) => item.id === user.id)
      if (index === -1) throw new Error('NOT_FOUND')
      store[index] = clone(user)
      return clone(user)
    }
    const nextId = store.reduce((max, item) => Math.max(max, item.id), 0) + 1
    const created = { ...clone(user), id: nextId }
    store.push(created)
    return clone(created)
  }

  async remove(id: number): Promise<void> {
    await delay(MOCK_LATENCY_MS)
    const index = store.findIndex((item) => item.id === id)
    if (index === -1) throw new Error('NOT_FOUND')
    store.splice(index, 1)
  }
}
