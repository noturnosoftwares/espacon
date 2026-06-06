import {
  type AuthSessionJson,
  type CredentialsJson,
} from '../../domain/models'

/**
 * MockAuthProvider — provider de autenticação na fase mock-first (ADR-001/003).
 *
 * Valida a credencial fixa documentada em `docs/app/authentication.md` e devolve
 * o **JSON da sessão** (contrato-alvo da futura API REST). Latência simulada para
 * exercitar o estado de loading da UI.
 *
 * Substituível por `RestAuthProvider` (via `HttpClient`) sem alterar repository,
 * application, stores ou pages.
 */

/** Credencial mockada aceita nesta fase (ver `authentication.md`). */
const MOCK_EMAIL = 'admin@noturno.com.br'
const MOCK_PASSWORD = 'noturno'
const MOCK_LATENCY_MS = 400

/** Erro de credencial inválida — sinalizado para o repository mapear em AppError. */
export class InvalidCredentialsError extends Error {
  constructor() {
    super('E-mail ou senha inválidos.')
    this.name = 'InvalidCredentialsError'
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockAuthProvider {
  async login(credentials: CredentialsJson): Promise<AuthSessionJson> {
    await delay(MOCK_LATENCY_MS)

    const email = credentials.email.trim().toLowerCase()
    const matches = email === MOCK_EMAIL && credentials.password === MOCK_PASSWORD
    if (!matches) {
      throw new InvalidCredentialsError()
    }

    return {
      user: {
        id: 'u-001',
        name: 'Administrador Noturno',
        email: MOCK_EMAIL,
        role: 'admin',
        accessScope: 'global',
        franchiseId: null,
        representativeId: null,
        permissions: ['*'],
      },
      // ISO fixo do contrato mock; a API real emitirá o instante do servidor.
      issuedAt: new Date().toISOString(),
    }
  }

  async recoverPassword(_email: string): Promise<void> {
    await delay(MOCK_LATENCY_MS)
    // Mock anti-enumeração: sempre "sucesso" (ver password-recovery.md).
  }
}
