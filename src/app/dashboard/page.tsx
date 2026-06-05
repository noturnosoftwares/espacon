// Rota "/dashboard" — tela principal (home) exibida após o login.
// Shell (menu lateral + navbar) + dashboard central, controlado por permissões.
// Ver especificação em docs/screens/home-layout.md e docs/specifications/home.

import { HomePage } from "@/modules/home/presentation/pages/home-page";

export default function Dashboard() {
  return <HomePage />;
}
