import {
  type KeyValueStore,
  localKeyValueStore,
  sessionKeyValueStore,
} from '@/shared/storage'
import {
  type AuthSession,
  type AuthSessionJson,
  authSessionFromJson,
  authSessionToJson,
} from '../../domain/models'
import type { SessionRepository } from '../../domain/repositories'

/**
 * SessionRepositoryImpl — persistência provisória da sessão e do e-mail lembrado
 * (ver ADR-005). Abstrai `localStorage`/`sessionStorage` via `KeyValueStore`.
 *
 * - "Manter acesso" marcado → `localKeyValueStore` (entre sessões do navegador).
 * - desmarcado → `sessionKeyValueStore` (cai ao fechar a aba); a cópia em
 *   `localStorage` é sempre removida para não "ressuscitar" a sessão.
 * - O e-mail lembrado fica em `localStorage` (independente da sessão) e **nunca**
 *   acompanha a senha.
 */
const SESSION_KEY = 'espacon.auth.session'
const REMEMBERED_EMAIL_KEY = 'espacon.auth.rememberedEmail'

export class SessionRepositoryImpl implements SessionRepository {
  constructor(
    private readonly localStore: KeyValueStore = localKeyValueStore,
    private readonly sessionStore: KeyValueStore = sessionKeyValueStore,
  ) {}

  // -- Session --------------------------------------------------------------

  save(session: AuthSession, keepSignedIn: boolean): void {
    const json = authSessionToJson(session)
    if (keepSignedIn) {
      this.localStore.set(SESSION_KEY, json)
      this.sessionStore.remove(SESSION_KEY)
    } else {
      this.sessionStore.set(SESSION_KEY, json)
      this.localStore.remove(SESSION_KEY)
    }
  }

  read(): AuthSession | null {
    const json =
      this.localStore.get<AuthSessionJson>(SESSION_KEY) ??
      this.sessionStore.get<AuthSessionJson>(SESSION_KEY)
    return json ? authSessionFromJson(json) : null
  }

  clear(): void {
    this.localStore.remove(SESSION_KEY)
    this.sessionStore.remove(SESSION_KEY)
  }

  // -- Remembered email -----------------------------------------------------

  rememberEmail(email: string): void {
    this.localStore.set(REMEMBERED_EMAIL_KEY, email.trim())
  }

  readEmail(): string | null {
    return this.localStore.get<string>(REMEMBERED_EMAIL_KEY)
  }

  clearEmail(): void {
    this.localStore.remove(REMEMBERED_EMAIL_KEY)
  }
}
