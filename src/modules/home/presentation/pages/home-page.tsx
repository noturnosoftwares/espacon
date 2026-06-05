// Scope: [M] module-home
//
// Tela principal (home) exibida após o login. Delega a moldura autenticada (menu
// + navbar + guard de sessão) ao AuthenticatedShell e renderiza o dashboard
// central. O conteúdo lê os dados da HomeStore já inicializada pelo shell
// (widgets filtrados por permissão + estado de loading).

"use client";

import { useStore } from "@/shared/stores/base-store";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { HomeStore } from "../stores/home-store";
import { AuthenticatedShell } from "../widgets/authenticated-shell";
import { DashboardGrid } from "../widgets/dashboard-grid";
import { DashboardToolbar } from "../widgets/dashboard-toolbar";
import { DashboardChartsSection } from "../widgets/dashboard-charts";

export function HomePage() {
  return (
    <AuthenticatedShell>
      {({ user, home }) => <DashboardContent user={user} home={home} />}
    </AuthenticatedShell>
  );
}

function DashboardContent({
  user,
  home,
}: {
  user: AuthenticatedUser;
  home: HomeStore;
}) {
  const state = useStore(home, (s) => s);

  return (
    <div className="flex w-full flex-col gap-6 animate-fade-in">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight text-white">
            Olá, {user.name.split(" ")[0]}
          </h1>
          <p className="text-sm text-noturno-grey-light">
            Visão geral da operação. Indicadores conforme o seu perfil de acesso.
          </p>
        </div>
        <DashboardToolbar />
      </header>

      <DashboardGrid widgets={state.widgets} loading={state.loading} />

      {state.charts && <DashboardChartsSection charts={state.charts} />}
    </div>
  );
}
