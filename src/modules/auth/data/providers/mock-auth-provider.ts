// Scope: [M] module-auth
//
// Provider mockado de autenticação (mock-first). Valida a credencial fixa e
// simula latência de rede. Quando existir contrato real de API, criar um
// ApiAuthProvider + mapper (data/mappers) e trocar o provider injetado no
// repository — sem impacto nas camadas acima.

import { EmailExt } from "@/shared/extensions/email-ext";
import { delay } from "@/shared/helpers/delay";
import { fail, ok, type AsyncResult } from "@/shared/result/async-result";
import type { AuthenticatedUser } from "../../domain/models/authenticated-user";
import type { LoginCredentials } from "../../domain/models/login-credentials";
import type {
  PasswordRecoveryReceipt,
  PasswordRecoveryRequest,
} from "../../domain/models/password-recovery-request";
import { MOCK_ADMIN_USER, MOCK_CREDENTIAL } from "../mocks/mock-users";
import type { AuthProvider } from "./auth-provider";

export class MockAuthProvider implements AuthProvider {
  async login(
    credentials: LoginCredentials,
  ): Promise<AsyncResult<AuthenticatedUser>> {
    // Simula latência de rede para exercitar estados de loading na UI.
    await delay(700);

    const emailMatches =
      credentials.email.trim().toLowerCase() === MOCK_CREDENTIAL.email;
    const passwordMatches = credentials.password === MOCK_CREDENTIAL.password;

    if (!emailMatches || !passwordMatches) {
      return fail({
        message: "E-mail ou senha inválidos.",
        code: "auth/invalid-credentials",
      });
    }

    return ok(MOCK_ADMIN_USER);
  }

  /**
   * Recuperação de senha (mock). Por segurança (anti-enumeração de contas) o
   * resultado é sempre de sucesso para um e-mail de formato válido — não revela
   * se existe ou não uma conta associada. O envio real do e-mail/link será
   * tratado pelo backend quando houver API.
   */
  async recoverPassword(
    request: PasswordRecoveryRequest,
  ): Promise<AsyncResult<PasswordRecoveryReceipt>> {
    await delay(700);
    return ok({ email: EmailExt.normalize(request.email) });
  }
}
