import type { AsyncResult } from '@/shared/result'
import type { AuthRepository } from '../../domain/repositories'
import { AuthRepositoryImpl } from '../repositories/auth-repository-impl'
import { MockAuthProvider } from '../providers/mock-auth-provider'

export type RecoverPasswordUseCase = (email: string) => Promise<AsyncResult<void>>

/**
 * makeRecoverPasswordUseCase — compõe o fluxo de recuperação de senha por
 * **factory explícita** (sem DI global): UseCase → AuthRepository →
 * MockAuthProvider (ver `docs/specifications/auth/password-recovery.md`).
 *
 * Anti-enumeração: o provider mock sempre conclui com sucesso, sem revelar se o
 * e-mail existe. Trocar o mock pelo REST futuro é mudança local desta factory.
 */
export function makeRecoverPasswordUseCase(): RecoverPasswordUseCase {
  const provider = new MockAuthProvider()
  const repository: AuthRepository = new AuthRepositoryImpl(provider)
  return (email) => repository.recoverPassword(email)
}
