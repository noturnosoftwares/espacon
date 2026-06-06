import type { AsyncResult } from '@/shared/result'
import type { AuthSession, Credentials } from '../models'

/**
 * AuthRepository — contrato de autenticação (camada `domain`).
 *
 * A implementação (`data/repositories`) decide o provider (mock agora, REST
 * depois) e converte o retorno em `AsyncResult` — a presentation nunca trata
 * exception crua (ver ADR-003).
 */
export interface AuthRepository {
  login(credentials: Credentials): Promise<AsyncResult<AuthSession>>
  /**
   * Recuperação de senha. Spec própria em
   * `docs/specifications/auth/password-recovery.md`; declarado aqui para manter
   * o contrato de auth coeso.
   */
  recoverPassword(email: string): Promise<AsyncResult<void>>
}
