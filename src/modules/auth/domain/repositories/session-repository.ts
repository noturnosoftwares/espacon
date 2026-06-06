import type { AuthSession } from '../models'

/**
 * SessionRepository — persistência **provisória** da sessão e do e-mail lembrado
 * (ver ADR-005). Operações síncronas por usarem storage local do navegador.
 *
 * Regras de storage (`docs/specifications/auth/login.md`):
 * - `save(session, keepSignedIn)`: grava em `localStorage` quando `keepSignedIn`
 *   (persiste entre sessões do navegador) ou em `sessionStorage` caso contrário
 *   (cai ao fechar a aba), sempre removendo a cópia do outro storage.
 * - e-mail lembrado é independente da sessão e nunca acompanha a senha.
 */
export interface SessionRepository {
  // Session
  save(session: AuthSession, keepSignedIn: boolean): void
  read(): AuthSession | null
  clear(): void

  // Remembered email (prefill do próximo acesso — nunca a senha)
  rememberEmail(email: string): void
  readEmail(): string | null
  clearEmail(): void
}
