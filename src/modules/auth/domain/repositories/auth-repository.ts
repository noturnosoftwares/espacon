// Scope: [M] module-auth
//
// Contrato do repositório de autenticação (domain). A implementação vive em
// data/repositories e decide qual provider usar (mock ou API real).

import type { AsyncResult } from "@/shared/result/async-result";
import type { AuthenticatedUser } from "../models/authenticated-user";
import type { LoginCredentials } from "../models/login-credentials";
import type {
  PasswordRecoveryReceipt,
  PasswordRecoveryRequest,
} from "../models/password-recovery-request";

export interface AuthRepository {
  login(credentials: LoginCredentials): Promise<AsyncResult<AuthenticatedUser>>;

  /** Solicita o envio do link de recuperação de senha. */
  recoverPassword(
    request: PasswordRecoveryRequest,
  ): Promise<AsyncResult<PasswordRecoveryReceipt>>;
}
