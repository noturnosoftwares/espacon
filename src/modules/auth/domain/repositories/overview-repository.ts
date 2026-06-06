import type { AsyncResult } from '@/shared/result'
import type { LoginOverview } from '../models'

/**
 * OverviewRepository — contrato do panorama público do login
 * (`GET /public/login-overview`). Retorna apenas o recorte
 * público/agregado/anonimizado, **sem dados financeiros** (ver ADR-007).
 *
 * A falha nunca deve bloquear o login (tratada na presentation como estado
 * discreto).
 */
export interface OverviewRepository {
  getOverview(): Promise<AsyncResult<LoginOverview>>
}
