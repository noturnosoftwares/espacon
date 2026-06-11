import type { UserProfileJson } from '../../domain/models'
import { MOCK_USER_PROFILES } from '../mocks/mock-user-profiles'

/**
 * MockUserProfilesProvider — provider de perfis (modelos de cadastro) na fase
 * mock-first. Mesmo padrão do `MockUsersProvider`: estado mutável em memória,
 * devolve JSON do contrato.
 *
 * TROCA POR API REAL: `RestUserProfilesProvider` (`/user-profiles`).
 */
const MOCK_LATENCY_MS = 350

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const store: UserProfileJson[] = clone(MOCK_USER_PROFILES)

export class MockUserProfilesProvider {
  async list(): Promise<UserProfileJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store)
  }

  async getById(id: number): Promise<UserProfileJson | null> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((profile) => profile.id === id)
    return found ? clone(found) : null
  }

  async save(profile: UserProfileJson): Promise<UserProfileJson> {
    await delay(MOCK_LATENCY_MS)
    if (profile.id && profile.id > 0) {
      const index = store.findIndex((item) => item.id === profile.id)
      if (index === -1) throw new Error('NOT_FOUND')
      store[index] = clone(profile)
      return clone(profile)
    }
    const nextId = store.reduce((max, item) => Math.max(max, item.id), 0) + 1
    const created = { ...clone(profile), id: nextId }
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
