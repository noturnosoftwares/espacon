// Scope: [M] module-auth
//
// Implementação provisória da persistência de sessão (ver ADR-005). Guarda o
// usuário autenticado no armazenamento local do navegador, escolhendo o meio
// conforme a opção "Manter acesso":
//
//   keepSignedIn = true  → localStorage   (sobrevive ao fechamento do navegador)
//   keepSignedIn = false → sessionStorage (some ao fechar a aba)
//
// É a única camada que conhece o formato serializado (JSON) da sessão local.
// Trocar por sessão real (token/cookie via API) significa criar outra
// implementação de SessionRepository — sem impacto em Store/Presentation.

import { EmailExt } from "@/shared/extensions/email-ext";
import { fail, ok, type AsyncResult } from "@/shared/result/async-result";
import type { KeyValueStore } from "@/shared/storage/key-value-store";
import type { AuthenticatedUser } from "../../domain/models/authenticated-user";
import type { SessionRepository } from "../../domain/repositories/session-repository";

const SESSION_KEY = "noturno.helpdesk.session";
const LAST_EMAIL_KEY = "noturno.helpdesk.last-email";

export class SessionRepositoryImpl implements SessionRepository {
  /**
   * @param local   armazenamento persistente (localStorage).
   * @param session armazenamento por aba (sessionStorage).
   */
  constructor(
    private readonly local: KeyValueStore,
    private readonly session: KeyValueStore,
  ) {}

  // ----- Session -----

  async save(
    user: AuthenticatedUser,
    keepSignedIn: boolean,
  ): Promise<AsyncResult<void>> {
    try {
      const raw = JSON.stringify(user);
      const target = keepSignedIn ? this.local : this.session;
      const other = keepSignedIn ? this.session : this.local;

      target.set(SESSION_KEY, raw);
      // Evita sessão duplicada/obsoleta no outro meio ao alternar a opção.
      other.remove(SESSION_KEY);

      return ok(undefined);
    } catch (error) {
      return fail({
        message: "Não foi possível salvar a sessão.",
        code: "session/save-failed",
        cause: error,
      });
    }
  }

  async restore(): Promise<AsyncResult<AuthenticatedUser | null>> {
    try {
      const raw = this.local.get(SESSION_KEY) ?? this.session.get(SESSION_KEY);
      if (!raw) return ok(null);

      const user = JSON.parse(raw) as AuthenticatedUser;
      return ok(user);
    } catch {
      // Sessão corrompida: limpa e trata como ausência de sessão.
      this.local.remove(SESSION_KEY);
      this.session.remove(SESSION_KEY);
      return ok(null);
    }
  }

  async clear(): Promise<AsyncResult<void>> {
    try {
      this.local.remove(SESSION_KEY);
      this.session.remove(SESSION_KEY);
      return ok(undefined);
    } catch (error) {
      return fail({
        message: "Não foi possível encerrar a sessão.",
        code: "session/clear-failed",
        cause: error,
      });
    }
  }

  // ----- Remembered email (preferência local persistente) -----

  rememberEmail(email: string): void {
    const normalized = EmailExt.normalize(email);
    if (!normalized) return;
    this.local.set(LAST_EMAIL_KEY, normalized);
  }

  lastEmail(): string | null {
    return this.local.get(LAST_EMAIL_KEY);
  }
}
