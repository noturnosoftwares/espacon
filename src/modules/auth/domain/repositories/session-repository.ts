// Scope: [M] module-auth
//
// Contrato de persistência de sessão (domain). Provisório (ver ADR-005): hoje a
// implementação guarda o usuário autenticado em armazenamento local do navegador.
// Quando houver autenticação real (token/cookie via API), basta uma nova
// implementação deste contrato — as camadas acima (Store/Presentation) não mudam.
//
// As operações de sessão são assíncronas (AsyncResult) para já acomodar uma
// futura sessão baseada em API. As de "e-mail lembrado" são síncronas: são uma
// preferência local trivial usada para pré-preencher o formulário.

import type { AsyncResult } from "@/shared/result/async-result";
import type { AuthenticatedUser } from "../models/authenticated-user";

export interface SessionRepository {
  // ----- Session -----

  /**
   * Persiste a sessão do usuário autenticado.
   * @param keepSignedIn `true` → persiste entre fechamentos do navegador
   *   (localStorage); `false` → válida apenas enquanto a aba estiver aberta
   *   (sessionStorage). Materializa a opção "Manter acesso".
   */
  save(
    user: AuthenticatedUser,
    keepSignedIn: boolean,
  ): Promise<AsyncResult<void>>;

  /** Restaura a sessão salva, se houver (null quando não há sessão). */
  restore(): Promise<AsyncResult<AuthenticatedUser | null>>;

  /** Encerra a sessão (logout): remove de ambos os armazenamentos. */
  clear(): Promise<AsyncResult<void>>;

  // ----- Remembered email (preferência local) -----

  /** Memoriza o último e-mail usado, para pré-preencher o login. */
  rememberEmail(email: string): void;

  /** Último e-mail lembrado (null quando não há). */
  lastEmail(): string | null;
}
