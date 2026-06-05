// Rota raiz "/" — tela inicial institucional integrada ao login.
// O sistema NÃO abre direto no dashboard: o fluxo é Landing/Login → Auth → Dashboard.

import { LoginPage } from "@/modules/auth/presentation/pages/login-page";

export default function Home() {
  return <LoginPage />;
}
