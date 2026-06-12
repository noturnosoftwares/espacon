import { normalizeText } from '@/shared/extensions'
import type { StateJson } from '../../domain/models'
import { MOCK_STATES } from '../mocks/mock-states'

/**
 * MockStateProvider — CRUD + busca de Estado/UF na fase mock-first. Unicidade de
 * **sigla (UF)** e **cUF** dentro do mesmo país. `remove` = inativação lógica.
 * `search` aceita `countryId` para o lookup filtrado por país.
 */
const MOCK_LATENCY_MS = 300
const MAX_LOOKUP = 15

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const store: StateJson[] = clone(MOCK_STATES)

export class MockStateProvider {
  async list(): Promise<StateJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store)
  }

  async getById(id: number): Promise<StateJson | null> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((s) => s.codigo === id)
    return found ? clone(found) : null
  }

  async search(query: string, countryId?: number | null): Promise<StateJson[]> {
    await delay(MOCK_LATENCY_MS)
    const term = normalizeText(query)
    const matches = store.filter(
      (s) =>
        s.ativo &&
        (countryId == null || s.paisId === countryId) &&
        (!term ||
          normalizeText(s.nome).includes(term) ||
          normalizeText(s.uf).includes(term) ||
          s.codigoIbge.includes(term)),
    )
    return clone(matches.slice(0, MAX_LOOKUP))
  }

  async save(state: StateJson): Promise<StateJson> {
    await delay(MOCK_LATENCY_MS)
    const exceptId = state.codigo ?? 0
    const sameCountry = (s: StateJson) => s.codigo !== exceptId && s.paisId === state.paisId
    if (store.some((s) => sameCountry(s) && normalizeText(s.uf) === normalizeText(state.uf))) {
      throw new Error('DUPLICATE_UF')
    }
    if (state.codigoIbge && store.some((s) => sameCountry(s) && s.codigoIbge === state.codigoIbge)) {
      throw new Error('DUPLICATE_CUF')
    }
    if (state.codigo && state.codigo > 0) {
      const index = store.findIndex((s) => s.codigo === state.codigo)
      if (index === -1) throw new Error('NOT_FOUND')
      store[index] = clone(state)
      return clone(state)
    }
    const nextId = store.reduce((max, s) => Math.max(max, s.codigo ?? 0), 0) + 1
    const created = { ...clone(state), codigo: nextId }
    store.push(created)
    return clone(created)
  }

  async remove(id: number): Promise<void> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((s) => s.codigo === id)
    if (!found) throw new Error('NOT_FOUND')
    found.ativo = false
  }
}
