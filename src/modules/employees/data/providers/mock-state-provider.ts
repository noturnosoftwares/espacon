import { type BrazilianState, searchBrazilianStates } from '@/shared/models'

/**
 * MockStateProvider — lookup de **estado/UF** (naturalidade). Hoje sobre a lista
 * estática `BRAZILIAN_STATES` (compartilhada). TROCA POR API REAL:
 * `RestStateProvider` (`GET /states?q=`) quando o Cadastro de Estados existir.
 */
const MOCK_LATENCY_MS = 200
const MAX_RESULTS = 10

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockStateProvider {
  async search(query: string): Promise<BrazilianState[]> {
    await delay(MOCK_LATENCY_MS)
    return searchBrazilianStates(query).slice(0, MAX_RESULTS)
  }
}
