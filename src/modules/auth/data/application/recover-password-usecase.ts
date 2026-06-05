// Scope: [M] module-auth
//
// UseCase de recuperação de senha. Valida a entrada (regra de aplicação) antes
// de delegar ao repositório, mantendo a regra fora da presentation.

import { EmailExt } from "@/shared/extensions/email-ext";
import { fail, type AsyncResult } from "@/shared/result/async-result";
import type {
  PasswordRecoveryReceipt,
  PasswordRecoveryRequest,
} from "../../domain/models/password-recovery-request";
import type { AuthRepository } from "../../domain/repositories/auth-repository";

export class RecoverPasswordUseCase {
  constructor(private readonly repository: AuthRepository) {}

  async execute(
    request: PasswordRecoveryRequest,
  ): Promise<AsyncResult<PasswordRecoveryReceipt>> {
    const email = request.email.trim();

    if (!email) {
      return fail({
        message: "Informe o e-mail.",
        code: "auth/empty-email",
      });
    }

    if (!EmailExt.isValid(email)) {
      return fail({
        message: "Informe um e-mail válido.",
        code: "auth/invalid-email",
      });
    }

    return this.repository.recoverPassword({ email });
  }
}
