import type { HomeDashboardJson } from '../../domain/models'
import { MOCK_HOME_DASHBOARD } from '../mocks/mock-home-dashboard'

/**
 * MockHomeProvider — provider do painel inicial na fase mock-first (ADR-001).
 *
 * Devolve o JSON do contrato `GET /home/dashboard` com latência simulada.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ TROCA POR API REAL: criar `RestHomeProvider` que faça                       │
 * │ `httpClient.get('/home/dashboard')` e retorne o body. O contrato JSON é     │
 * │ idêntico — repository, usecase, store e widgets não mudam.                   │
 * └──────────────────────────────────────────────────────────────────────────┘
 */
const MOCK_LATENCY_MS = 500

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockHomeProvider {
  async getDashboard(): Promise<HomeDashboardJson> {
    await delay(MOCK_LATENCY_MS)
    return MOCK_HOME_DASHBOARD
  }
}
