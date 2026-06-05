// Scope: [M] module-auth
//
// Contrato do provider de autenticação. O provider é a única camada que conhece
// o formato externo (API REST ou mock). Trocar mock por API real não pode exigir
// mudança fora de Provider/Mapper.

import type { AsyncResult } from "@/shared/result/async-result";
import type { AuthenticatedUser } from "../../domain/models/authenticated-user";
import type { LoginCredentials } from "../../domain/models/login-credentials";
import type {
  PasswordRecoveryReceipt,
  PasswordRecoveryRequest,
} from "../../domain/models/password-recovery-request";

export interface AuthProvider {
  login(credentials: LoginCredentials): Promise<AsyncResult<AuthenticatedUser>>;

  recoverPassword(
    request: PasswordRecoveryRequest,
  ): Promise<AsyncResult<PasswordRecoveryReceipt>>;
}
