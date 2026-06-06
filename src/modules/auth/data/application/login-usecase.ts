import type { AsyncResult } from '@/shared/result'
import type { AuthSession, Credentials } from '../../domain/models'
import type { AuthRepository } from '../../domain/repositories'
import { AuthRepositoryImpl } from '../repositories/auth-repository-impl'
import { MockAuthProvider } from '../providers/mock-auth-provider'

export type LoginUseCase = (credentials: Credentials) => Promise<AsyncResult<AuthSession>>

/**
 * makeLoginUseCase — compõe o fluxo de login por **factory explícita**
 * (sem DI global): UseCase → AuthRepository → MockAuthProvider.
 *
 * Trocar o provider mock pelo REST futuro é uma mudança local desta factory —
 * stores e pages não mudam (ver ADR-003).
 */
export function makeLoginUseCase(): LoginUseCase {
  const provider = new MockAuthProvider()
  const repository: AuthRepository = new AuthRepositoryImpl(provider)
  return (credentials) => repository.login(credentials)
}
