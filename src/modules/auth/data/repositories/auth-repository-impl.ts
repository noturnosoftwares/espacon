// Scope: [M] module-auth
//
// Implementação do AuthRepository. Decide qual provider usar (recebido por
// injeção via construtor) e repassa o resultado já em model interno. Captura
// qualquer exceção inesperada do provider e a converte em AppError — a
// presentation nunca recebe exception crua.

import { fail, type AsyncResult } from "@/shared/result/async-result";
import type { AuthenticatedUser } from "../../domain/models/authenticated-user";
import type { LoginCredentials } from "../../domain/models/login-credentials";
import type {
  PasswordRecoveryReceipt,
  PasswordRecoveryRequest,
} from "../../domain/models/password-recovery-request";
import type { AuthRepository } from "../../domain/repositories/auth-repository";
import type { AuthProvider } from "../providers/auth-provider";

export class AuthRepositoryImpl implements AuthRepository {
  constructor(private readonly provider: AuthProvider) {}

  async login(
    credentials: LoginCredentials,
  ): Promise<AsyncResult<AuthenticatedUser>> {
    try {
      return await this.provider.login(credentials);
    } catch (error) {
      return fail({
        message: "Não foi possível concluir o login. Tente novamente.",
        code: "auth/unexpected",
        cause: error,
      });
    }
  }

  async recoverPassword(
    request: PasswordRecoveryRequest,
  ): Promise<AsyncResult<PasswordRecoveryReceipt>> {
    try {
      return await this.provider.recoverPassword(request);
    } catch (error) {
      return fail({
        message:
          "Não foi possível solicitar a recuperação. Tente novamente.",
        code: "auth/unexpected",
        cause: error,
      });
    }
  }
}
