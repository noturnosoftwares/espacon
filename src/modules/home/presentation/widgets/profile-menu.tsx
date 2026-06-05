// Scope: [M] module-home
//
// Menu de perfil da navbar (ver home-layout.md): avatar + nome do usuário e
// dropdown com as ações de conta. "Sair" encerra a sessão (callback). As demais
// ações (Meu Perfil, Alterar Senha, Preferências) ainda não têm tela — exibidas
// como "em breve" (inertes), sem criar navegação falsa.

"use client";

import { useRef, useState } from "react";
import { useClickOutside } from "@/shared/hooks/use-click-outside";
import {
  ChevronDownIcon,
  KeyIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from "@/shared/design-system/icons";
import type { IconProps } from "@/shared/design-system/icons";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { ComponentType } from "react";

type ProfileMenuProps = {
  user: AuthenticatedUser;
  onSignOut: () => void;
};

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  franqueado: "Franqueado",
  representante: "Representante",
  tecnico: "Técnico",
  cliente: "Cliente",
};

type AccountAction = {
  id: string;
  label: string;
  icon: ComponentType<IconProps>;
};

const ACCOUNT_ACTIONS: AccountAction[] = [
  { id: "profile", label: "Meu Perfil", icon: UserIcon },
  { id: "password", label: "Alterar Senha", icon: KeyIcon },
  { id: "preferences", label: "Preferências", icon: SettingsIcon },
];

export function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2.5 rounded-xl py-1.5 pl-1.5 pr-2.5 transition-colors hover:bg-white/5"
      >
        <Avatar name={user.name} />
        <span className="hidden text-left sm:flex sm:flex-col sm:leading-tight">
          <span className="max-w-[140px] truncate text-sm font-medium text-white">
            {user.name}
          </span>
          <span className="text-xs text-noturno-grey-light">
            {ROLE_LABELS[user.role] ?? user.role}
          </span>
        </span>
        <ChevronDownIcon
          size={16}
          className={
            "text-noturno-grey-light transition-transform " +
            (open ? "rotate-180" : "")
          }
        />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-xl border border-white/10 bg-noturno-black-secondary shadow-2xl shadow-black/50 animate-fade-in"
        >
          <div className="flex items-center gap-3 border-b border-white/8 p-4">
            <Avatar name={user.name} />
            <div className="flex flex-col leading-tight">
              <span className="truncate text-sm font-medium text-white">
                {user.name}
              </span>
              <span className="truncate text-xs text-noturno-grey-light">
                {user.email}
              </span>
            </div>
          </div>

          <ul className="p-1.5">
            {ACCOUNT_ACTIONS.map(({ id, label, icon: Icon }) => (
              <li key={id}>
                <span
                  className="flex cursor-default items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm text-noturno-grey-light/60"
                  title="Em breve"
                >
                  <span className="flex items-center gap-3">
                    <Icon size={17} />
                    {label}
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-noturno-grey-light/40">
                    em breve
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="border-t border-white/8 p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onSignOut();
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-noturno-red transition-colors hover:bg-noturno-red/10"
            >
              <LogOutIcon size={17} />
              Sair
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/** Avatar circular com as iniciais do usuário (sem asset de imagem no mock). */
function Avatar({ name }: { name: string }) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-noturno-orange/15 text-sm font-semibold text-noturno-orange">
      {initials || "?"}
    </span>
  );
}
