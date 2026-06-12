import { normalizeText } from '@/shared/extensions'
import type { CityJson } from '../../domain/models'
import { MOCK_CITIES } from '../mocks/mock-cities'

/**
 * MockCityProvider — CRUD + busca de Cidade na fase mock-first. Unicidade de
 * **cMun** (código IBGE). `remove` = inativação lógica. `search` aceita `stateId`
 * para o lookup filtrado por estado.
 */
const MOCK_LATENCY_MS = 300
const MAX_LOOKUP = 15

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const store: CityJson[] = clone(MOCK_CITIES)

export class MockCityProvider {
  async list(): Promise<CityJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store)
  }

  async getById(id: number): Promise<CityJson | null> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((c) => c.codigo === id)
    return found ? clone(found) : null
  }

  async search(query: string, stateId?: number | null): Promise<CityJson[]> {
    await delay(MOCK_LATENCY_MS)
    const term = normalizeText(query)
    const matches = store.filter(
      (c) =>
        c.ativo &&
        (stateId == null || c.estadoId === stateId) &&
        (!term ||
          normalizeText(c.nome).includes(term) ||
          normalizeText(c.uf).includes(term) ||
          c.codigoIbge.includes(term)),
    )
    return clone(matches.slice(0, MAX_LOOKUP))
  }

  async save(city: CityJson): Promise<CityJson> {
    await delay(MOCK_LATENCY_MS)
    const exceptId = city.codigo ?? 0
    if (city.codigoIbge && store.some((c) => c.codigo !== exceptId && c.codigoIbge === city.codigoIbge)) {
      throw new Error('DUPLICATE_CMUN')
    }
    if (city.codigo && city.codigo > 0) {
      const index = store.findIndex((c) => c.codigo === city.codigo)
      if (index === -1) throw new Error('NOT_FOUND')
      store[index] = clone(city)
      return clone(city)
    }
    const nextId = store.reduce((max, c) => Math.max(max, c.codigo ?? 0), 0) + 1
    const created = { ...clone(city), codigo: nextId }
    store.push(created)
    return clone(created)
  }

  async remove(id: number): Promise<void> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((c) => c.codigo === id)
    if (!found) throw new Error('NOT_FOUND')
    found.ativo = false
  }
}
