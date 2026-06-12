import { normalizeText } from '@/shared/extensions'
import type { CityJson } from '../../domain/models'
import { MOCK_CITIES } from '../mocks/mock-cities'

/**
 * MockCityProvider — lookup de cidade (spec §13). Filtra por nome/UF (sem acento,
 * case-insensitive) e devolve no máximo 10 candidatos. TROCA POR API REAL:
 * `RestCityProvider` (`GET /cities?q=`).
 */
const MOCK_LATENCY_MS = 250
const MAX_RESULTS = 10

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockCityProvider {
  async search(query: string): Promise<CityJson[]> {
    await delay(MOCK_LATENCY_MS)
    const term = normalizeText(query)
    const matches = term
      ? MOCK_CITIES.filter(
          (city) => normalizeText(city.name).includes(term) || normalizeText(city.uf).includes(term),
        )
      : MOCK_CITIES
    return matches.slice(0, MAX_RESULTS).map((city) => ({ ...city }))
  }
}
