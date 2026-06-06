import { type AsyncResult, authError, guard, networkError } from '@/shared/result'
import {
  type AuthSession,
  type Credentials,
  authSessionFromJson,
  credentialsToJson,
} from '../../domain/models'
import type { AuthRepository } from '../../domain/repositories'
import { InvalidCredentialsError, MockAuthProvider } from '../providers/mock-auth-provider'

/**
 * AuthRepositoryImpl — implementação do contrato de autenticação.
 *
 * Orquestra o provider (mock nesta fase), converte JSON → model via mapper e
 * traduz qualquer exception crua em `AppError` (`guard`). A presentation nunca
 * vê exception (ver ADR-003).
 *
 * O provider é injetado para permitir troca (mock → REST) e testes.
 */
export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly provider: MockAuthProvider) {}

  login(credentials: Credentials): Promise<AsyncResult<AuthSession>> {
    return guard(
      async () => {
        const json = await this.provider.login(credentialsToJson(credentials))
        return authSessionFromJson(json)
      },
      (cause) => this.mapLoginError(cause),
    )
  }

  recoverPassword(email: string): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.recoverPassword(email),
      () => networkError(),
    )
  }

  /** Converte a exception do provider na categoria de erro adequada da UI. */
  private mapLoginError(cause: unknown) {
    if (cause instanceof InvalidCredentialsError) {
      return authError('E-mail ou senha inválidos.', { cause })
    }
    return networkError(undefined, { cause })
  }
}
