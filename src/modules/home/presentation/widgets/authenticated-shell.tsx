// Scope: [M] module-home
//
// Moldura das telas internas autenticadas. Encapsula o que toda tela pós-login
// precisa: restaura a sessão (guard ADR-005), monta a navegação por permissão e
// a central de notificações, e renderiza o AppShell (menu + navbar). O conteúdo
// específico de cada tela é recebido via render-prop, que recebe o usuário e a
// HomeStore já inicializada (telas como o dashboard leem seus dados dela).
//
// Reuso: HomePage (dashboard) e HelpPage (Ajuda) compartilham este shell, sem
// duplicar o boilerplate de sessão/guard/loading.

"use client";

import { useEffect, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/shared/stores/base-store";
import { makeSessionRepository } from "@/modules/auth/data/auth-factory";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import {
  makeGetDashboardUseCase,
  makeGetDashboardChartsUseCase,
  makeGetNotificationsUseCase,
} from "../../data/home-factory";
import { HomeStore } from "../stores/home-store";
import { LayoutStore } from "../stores/layout-store";
import { AppShell } from "./app-shell";

type ShellContext = { user: AuthenticatedUser; home: HomeStore };

type AuthenticatedShellProps = {
  children: (ctx: ShellContext) => ReactNode;
};

export function AuthenticatedShell({ children }: AuthenticatedShellProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [home] = useState(
    () =>
      new HomeStore(
        makeSessionRepository(),
        makeGetDashboardUseCase(),
        makeGetDashboardChartsUseCase(),
        makeGetNotificationsUseCase(),
      ),
  );
  const [layout] = useState(() => new LayoutStore());

  const state = useStore(home, (s) => s);

  // Inicializa (restaura sessão + carrega dados) uma vez por montagem.
  useEffect(() => {
    void home.init();
  }, [home]);

  // Guard: sem sessão → volta ao login.
  useEffect(() => {
    if (state.unauthenticated) {
      startTransition(() => router.replace("/"));
    }
  }, [state.unauthenticated, router]);

  // Enquanto restaura a sessão (ou redirecionando), evita flash de conteúdo.
  if (!state.currentUser) {
    return (
      <main className="flex h-dvh items-center justify-center bg-noturno-black">
        <span
          className="size-6 animate-spin rounded-full border-2 border-noturno-grey-light/40 border-t-noturno-orange"
          aria-label="Carregando"
        />
      </main>
    );
  }

  return (
    <AppShell
      user={state.currentUser}
      nav={state.nav}
      notifications={state.notifications}
      unreadCount={home.unreadCount}
      layout={layout}
      onSignOut={() => void home.signOut()}
      onMarkNotificationsRead={() => home.markAllNotificationsRead()}
    >
      {children({ user: state.currentUser, home })}
    </AppShell>
  );
}
