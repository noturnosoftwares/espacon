import { normalizeText } from '@/shared/extensions'
import type { RepresentativeSummaryJson } from '../../domain/models'
import { MOCK_REPRESENTATIVES } from '../mocks/mock-representatives'

/**
 * MockRepresentativeProvider — lookup de representante (spec §13). TROCA POR API
 * REAL: `RestRepresentativeProvider` (`GET /representatives?q=`).
 */
const MOCK_LATENCY_MS = 250
const MAX_RESULTS = 10

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockRepresentativeProvider {
  async search(query: string): Promise<RepresentativeSummaryJson[]> {
    await delay(MOCK_LATENCY_MS)
    const term = normalizeText(query)
    const matches = term
      ? MOCK_REPRESENTATIVES.filter((rep) => normalizeText(rep.name).includes(term))
      : MOCK_REPRESENTATIVES
    return matches.slice(0, MAX_RESULTS).map((rep) => ({ ...rep }))
  }
}
