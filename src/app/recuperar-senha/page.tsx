// Rota "/recuperar-senha" — solicitação de redefinição de senha (fluxo mock).
// Acessível a partir do link "Recuperar senha" na tela de login.

import { PasswordRecoveryPage } from "@/modules/auth/presentation/pages/password-recovery-page";

export default function RecoverPassword() {
  return <PasswordRecoveryPage />;
}
