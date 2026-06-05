// Scope: [M] module-home
//
// Navbar superior (ver home-layout.md): botão de expandir/recolher o menu,
// pesquisa rápida, central de notificações e menu de perfil. Sem regra de
// negócio — apenas dispara ações de layout/store recebidas por props.

"use client";

import { useStore } from "@/shared/stores/base-store";
import { MenuIcon, SearchIcon } from "@/shared/design-system/icons";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { AppNotification } from "../../domain/models/notification";
import type { LayoutStore } from "../stores/layout-store";
import { NotificationCenter } from "./notification-center";
import { ProfileMenu } from "./profile-menu";

type TopNavbarProps = {
  user: AuthenticatedUser;
  notifications: AppNotification[];
  unreadCount: number;
  layout: LayoutStore;
  onSignOut: () => void;
  onMarkNotificationsRead: () => void;
};

export function TopNavbar({
  user,
  notifications,
  unreadCount,
  layout,
  onSignOut,
  onMarkNotificationsRead,
}: TopNavbarProps) {
  // Assina o layout para manter a navbar reativa (ex.: aria-expanded do toggle).
  const expanded = useStore(layout, (s) => s.expanded);

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-white/8 bg-noturno-black-secondary/80 px-4 backdrop-blur-md sm:px-6">
      <button
        type="button"
        onClick={() => layout.toggle()}
        aria-label={expanded ? "Recolher menu" : "Expandir menu"}
        className="flex size-10 items-center justify-center rounded-xl text-noturno-grey-light transition-colors hover:bg-white/5 hover:text-white"
      >
        <MenuIcon size={20} />
      </button>

      {/* Pesquisa rápida */}
      <div className="flex max-w-md flex-1 items-center gap-3 rounded-xl border border-white/10 bg-noturno-black/40 px-3.5 focus-within:border-noturno-orange/60">
        <SearchIcon size={18} className="shrink-0 text-noturno-grey-light" />
        <input
          type="search"
          placeholder="Pesquisar..."
          aria-label="Pesquisa rápida"
          className="h-10 w-full bg-transparent text-sm text-white placeholder:text-noturno-grey-light/60 focus:outline-none"
        />
      </div>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <NotificationCenter
          notifications={notifications}
          unreadCount={unreadCount}
          onMarkAllRead={onMarkNotificationsRead}
        />
        <span aria-hidden className="mx-1 hidden h-7 w-px bg-white/8 sm:block" />
        <ProfileMenu user={user} onSignOut={onSignOut} />
      </div>
    </header>
  );
}
