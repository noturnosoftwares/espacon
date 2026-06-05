// Scope: [M] module-auth
//
// UseCase de login. Valida a entrada (regra de aplicação) antes de chamar o
// repositório. Mantém a regra de negócio fora da presentation.

import { EmailExt } from "@/shared/extensions/email-ext";
import { fail, type AsyncResult } from "@/shared/result/async-result";
import type { AuthenticatedUser } from "../../domain/models/authenticated-user";
import type { LoginCredentials } from "../../domain/models/login-credentials";
import type { AuthRepository } from "../../domain/repositories/auth-repository";

export class LoginUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(
    credentials: LoginCredentials,
  ): Promise<AsyncResult<AuthenticatedUser>> {
    const email = credentials.email.trim();

    if (!email || !credentials.password) {
      return fail({
        message: "Informe e-mail e senha.",
        code: "auth/empty-fields",
      });
    }

    if (!EmailExt.isValid(email)) {
      return fail({
        message: "Informe um e-mail válido.",
        code: "auth/invalid-email",
      });
    }

    return this.repository.login({ ...credentials, email });
  }
}
