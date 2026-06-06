import type { SessionRepository } from '../../domain/repositories'
import { SessionRepositoryImpl } from '../repositories/session-repository-impl'

/**
 * makeSessionRepository — factory explícita da persistência de sessão.
 *
 * A persistência de sessão/e-mail é síncrona (storage local) e não constitui um
 * UseCase assíncrono; expô-la como `SessionRepository` (tipo do `domain`) mantém
 * a presentation desacoplada da implementação `data` e permite trocar o storage
 * provisório por token/cookie no futuro (ver ADR-005) sem mudar stores/router.
 */
export function makeSessionRepository(): SessionRepository {
  return new SessionRepositoryImpl()
}
