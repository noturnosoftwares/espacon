// Scope: [M] module-home
//
// Shell da aplicação autenticada: menu lateral + navbar superior + área de
// conteúdo. Reutilizável como moldura das telas internas (recebe `children`).
// Mantém o LayoutStore por instância de tela e repassa os dados/handlers vindos
// da store da página (sem regra de negócio aqui).

"use client";

import type { ReactNode } from "react";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { NavGroup } from "../../domain/models/nav";
import type { AppNotification } from "../../domain/models/notification";
import type { LayoutStore } from "../stores/layout-store";
import { SideMenu } from "./side-menu";
import { TopNavbar } from "./top-navbar";

type AppShellProps = {
  user: AuthenticatedUser;
  nav: NavGroup[];
  notifications: AppNotification[];
  unreadCount: number;
  layout: LayoutStore;
  onSignOut: () => void;
  onMarkNotificationsRead: () => void;
  children: ReactNode;
};

export function AppShell({
  user,
  nav,
  notifications,
  unreadCount,
  layout,
  onSignOut,
  onMarkNotificationsRead,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-dvh w-full overflow-hidden bg-noturno-black">
      <SideMenu nav={nav} layout={layout} />

      <div className="flex min-w-0 flex-1 flex-col">
        <TopNavbar
          user={user}
          notifications={notifications}
          unreadCount={unreadCount}
          layout={layout}
          onSignOut={onSignOut}
          onMarkNotificationsRead={onMarkNotificationsRead}
        />
        <main className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
