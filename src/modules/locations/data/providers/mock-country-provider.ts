import { normalizeText } from '@/shared/extensions'
import type { CountryJson } from '../../domain/models'
import { MOCK_COUNTRIES } from '../mocks/mock-countries'

/**
 * MockCountryProvider — CRUD + busca de País na fase mock-first. Estado mutável em
 * memória, latência simulada, unicidade de **BACEN** e **ISO-2**. `remove` é
 * inativação lógica. TROCA POR API REAL: `RestCountryProvider`.
 */
const MOCK_LATENCY_MS = 300
const MAX_LOOKUP = 10

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

const store: CountryJson[] = clone(MOCK_COUNTRIES)

export class MockCountryProvider {
  async list(): Promise<CountryJson[]> {
    await delay(MOCK_LATENCY_MS)
    return clone(store)
  }

  async getById(id: number): Promise<CountryJson | null> {
    await delay(MOCK_LATENCY_MS)
    const found = store.find((c) => c.codigo === id)
    return found ? clone(found) : null
  }

  async search(query: string): Promise<CountryJson[]> {
    await delay(MOCK_LATENCY_MS)
    const term = normalizeText(query)
    const matches = store.filter(
      (c) =>
        c.ativo &&
        (!term ||
          normalizeText(c.nome).includes(term) ||
          normalizeText(c.iso2).includes(term) ||
          c.codigoBacen.includes(term)),
    )
    return clone(matches.slice(0, MAX_LOOKUP))
  }

  async save(country: CountryJson): Promise<CountryJson> {
    await delay(MOCK_LATENCY_MS)
    const exceptId = country.codigo ?? 0
    if (store.some((c) => c.codigo !== exceptId && c.codigoBacen === country.codigoBacen)) {
      throw new Error('DUPLICATE_BACEN')
    }
    if (
      store.some(
        (c) => c.codigo !== exceptId && normalizeText(c.iso2) === normalizeText(country.iso2),
      )
    ) {
      throw new Error('DUPLICATE_ISO2')
    }
    if (country.codigo && country.codigo > 0) {
      const index = store.findIndex((c) => c.codigo === country.codigo)
      if (index === -1) throw new Error('NOT_FOUND')
      store[index] = clone(country)
      return clone(country)
    }
    const nextId = store.reduce((max, c) => Math.max(max, c.codigo ?? 0), 0) + 1
    const created = { ...clone(country), codigo: nextId }
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
