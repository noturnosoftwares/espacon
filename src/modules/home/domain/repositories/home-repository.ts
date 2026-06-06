import type { AsyncResult } from '@/shared/result'
import type { HomeDashboard } from '../models'

/**
 * HomeRepository — contrato do painel inicial (`GET /home/dashboard`).
 *
 * Retorna apenas indicadores operacionais/não-financeiros (ver home spec). A
 * implementação converte JSON → model e devolve `AsyncResult` (a presentation
 * nunca trata exception crua).
 */
export interface HomeRepository {
  getDashboard(): Promise<AsyncResult<HomeDashboard>>
}
