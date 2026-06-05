// Scope: [M] module-auth
//
// Store da tela de login. Estende apenas BaseStore (login não é CRUD). Orquestra
// o fluxo Page → Store → UseCase/Repository e expõe o estado para a UI. Instância
// POR TELA (não singleton): guarda estado de formulário/fluxo que não pode vazar
// entre telas ou usuários.
//
// Concentra também a sessão (salvar dados): ao logar, persiste a sessão e lembra
// o e-mail; ao montar, restaura uma sessão salva; e expõe o logout.

import { BaseStore, type BaseState } from "@/shared/stores/base-store";
import type { AuthenticatedUser } from "../../domain/models/authenticated-user";
import type { LoginCredentials } from "../../domain/models/login-credentials";
import type { SessionRepository } from "../../domain/repositories/session-repository";
import type { LoginUseCase } from "../../data/application/login-usecase";

type AuthState = BaseState & {
  /** Usuário autenticado após sucesso (gatilho de redirecionamento). */
  authenticatedUser: AuthenticatedUser | null;
};

export class AuthStore extends BaseStore<AuthState> {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly sessionRepository: SessionRepository,
  ) {
    super({ ...BaseStore.baseState(), authenticatedUser: null });
  }

  // ----- Session -----

  /** E-mail lembrado da última sessão — usado para pré-preencher o formulário. */
  rememberedEmail(): string {
    return this.sessionRepository.lastEmail() ?? "";
  }

  /**
   * Restaura uma sessão previamente salva ("Manter acesso"). Em caso de sessão
   * existente, popula authenticatedUser (gatilho de redirecionamento). Marca
   * isInitialized ao final para indicar que a verificação foi concluída.
   */
  async restore(): Promise<void> {
    const result = await this.sessionRepository.restore();

    if (result.success && result.data) {
      this.setState({ authenticatedUser: result.data, isInitialized: true });
      return;
    }

    this.setState({ isInitialized: true });
  }

  /** Encerra a sessão (logout): limpa persistência e estado. */
  async signOut(): Promise<void> {
    await this.sessionRepository.clear();
    this.setState({ authenticatedUser: null });
  }

  // ----- Authentication -----

  /** Executa o login. Em sucesso, salva a sessão, lembra o e-mail e popula
   *  authenticatedUser; em erro, errorMessage. */
  async login(credentials: LoginCredentials): Promise<void> {
    this.setState({ loading: true, errorMessage: null });

    const result = await this.loginUseCase.execute(credentials);

    if (result.success) {
      // Salvar dados: persiste a sessão (conforme "Manter acesso") e lembra o e-mail.
      await this.sessionRepository.save(result.data, credentials.keepSignedIn);
      this.sessionRepository.rememberEmail(result.data.email);

      this.setState({ loading: false, authenticatedUser: result.data });
      return;
    }

    this.setState({ loading: false, errorMessage: result.error.message });
  }
}
