// Scope: [M] module-home
//
// Central de notificações da navbar (ver home-layout.md): sino com badge de não
// lidas e dropdown com a lista. O tipo define o tom/ícone. "Marcar todas como
// lidas" atualiza o estado local da tela (a sincronização com o backend virá com
// a API).

"use client";

import { useRef, useState } from "react";
import { useClickOutside } from "@/shared/hooks/use-click-outside";
import {
  BellIcon,
  CreditCardIcon,
  FileTextIcon,
  HeadsetIcon,
  ShieldIcon,
  type IconProps,
} from "@/shared/design-system/icons";
import type {
  AppNotification,
  NotificationType,
} from "../../domain/models/notification";
import type { ComponentType } from "react";

type NotificationCenterProps = {
  notifications: AppNotification[];
  unreadCount: number;
  onMarkAllRead: () => void;
};

type TypeStyle = {
  icon: ComponentType<IconProps>;
  className: string;
};

const TYPE_STYLES: Record<NotificationType, TypeStyle> = {
  "ticket-new": {
    icon: HeadsetIcon,
    className: "bg-noturno-blue-light/10 text-noturno-blue-light",
  },
  "ticket-overdue": {
    icon: HeadsetIcon,
    className: "bg-noturno-orange/10 text-noturno-orange",
  },
  "invoice-overdue": {
    icon: CreditCardIcon,
    className: "bg-noturno-red/10 text-noturno-red",
  },
  "contract-expiring": {
    icon: FileTextIcon,
    className: "bg-noturno-yellow/10 text-noturno-yellow",
  },
  "license-expiring": {
    icon: ShieldIcon,
    className: "bg-noturno-yellow/10 text-noturno-yellow",
  },
  "admin-notice": {
    icon: BellIcon,
    className: "bg-white/5 text-noturno-grey-light-clean",
  },
};

export function NotificationCenter({
  notifications,
  unreadCount,
  onMarkAllRead,
}: NotificationCenterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false), open);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notificações"
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex size-10 items-center justify-center rounded-xl text-noturno-grey-light transition-colors hover:bg-white/5 hover:text-white"
      >
        <BellIcon size={20} />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex min-w-4 items-center justify-center rounded-full bg-noturno-red px-1 text-[10px] font-bold leading-4 text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Central de notificações"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/10 bg-noturno-black-secondary shadow-2xl shadow-black/50 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-white/8 px-4 py-3">
            <span className="text-sm font-semibold text-white">
              Notificações
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={onMarkAllRead}
                className="text-xs font-medium text-noturno-orange transition-opacity hover:opacity-80"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <ul className="max-h-[60vh] overflow-y-auto">
            {notifications.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-noturno-grey-light">
                Nenhuma notificação.
              </li>
            ) : (
              notifications.map((item) => {
                const style = TYPE_STYLES[item.type];
                const Icon = style.icon;
                return (
                  <li
                    key={item.id}
                    className={
                      "flex gap-3 border-b border-white/5 px-4 py-3 last:border-b-0 " +
                      (item.read ? "" : "bg-white/[0.025]")
                    }
                  >
                    <span
                      className={
                        "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg " +
                        style.className
                      }
                    >
                      <Icon size={18} />
                    </span>
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-2 text-sm font-medium text-white">
                        {item.title}
                        {!item.read && (
                          <span className="size-1.5 rounded-full bg-noturno-orange" />
                        )}
                      </span>
                      <span className="text-xs leading-relaxed text-noturno-grey-light">
                        {item.description}
                      </span>
                      <span className="mt-0.5 text-[11px] text-noturno-grey-light/60">
                        {item.createdAtLabel}
                      </span>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
