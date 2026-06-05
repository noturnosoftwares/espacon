// Scope: [M] module-home
//
// Menu lateral responsivo (ver home-layout.md): cabeçalho (logo + nome + versão)
// e grupos de navegação já filtrados por permissão. Cada item tem ícone próprio.
//
//  - desktop (lg+): sempre visível. `expanded` alterna entre rótulos+ícones e um
//    rail apenas de ícones (rótulos/títulos recebem `lg:hidden` quando recolhido).
//    A largura é ajustável por arrasto na borda direita (LayoutStore.menuWidth);
//  - mobile (<lg): drawer deslizante controlado por `drawerOpen`, sempre exibindo
//    rótulos; backdrop fecha o drawer.
//
// Itens sem `href` são módulos ainda não implementados → exibidos, porém inertes.

"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/shared/stores/base-store";
import { BrandMark } from "@/shared/widgets/brand-mark";
import { IconByKey } from "@/shared/design-system/icon-key";
import type { NavGroup } from "../../domain/models/nav";
import type { LayoutStore } from "../stores/layout-store";

const APP_VERSION = "v0.1.0";

type SideMenuProps = {
  nav: NavGroup[];
  layout: LayoutStore;
};

function isActive(pathname: string, href?: string): boolean {
  if (!href) return false;
  const [base] = href.split("#");
  return pathname === base || pathname.startsWith(base + "/");
}

export function SideMenu({ nav, layout }: SideMenuProps) {
  const expanded = useStore(layout, (s) => s.expanded);
  const drawerOpen = useStore(layout, (s) => s.drawerOpen);
  const menuWidth = useStore(layout, (s) => s.menuWidth);
  const pathname = usePathname();
  const [dragging, setDragging] = useState(false);

  // Rótulos/títulos ocultos no desktop quando recolhido; visíveis no mobile.
  const collapsed = expanded ? "" : "lg:hidden";
  const railCenter = expanded ? "" : "lg:justify-center lg:px-0";

  function startResize(event: React.PointerEvent) {
    event.preventDefault();
    setDragging(true);
    document.body.style.userSelect = "none";
    document.body.style.cursor = "col-resize";

    const onMove = (e: PointerEvent) => layout.setMenuWidth(e.clientX);
    const onUp = () => {
      setDragging(false);
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  }

  return (
    <>
      {/* Backdrop do drawer (apenas mobile). */}
      {drawerOpen && (
        <div
          aria-hidden="true"
          onClick={() => layout.closeDrawer()}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        style={
          { "--mw": expanded ? `${menuWidth}px` : "76px" } as React.CSSProperties
        }
        className={
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-white/8 " +
          "bg-noturno-black-secondary lg:relative lg:z-auto lg:translate-x-0 lg:w-[var(--mw)] " +
          (dragging ? "" : "transition-[transform,width] duration-300 ease-out ") +
          (drawerOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")
        }
      >
        {/* Cabeçalho do menu */}
        <div className="flex h-16 shrink-0 items-center border-b border-white/8 px-4">
          <span className={expanded ? "" : "lg:hidden"}>
            <BrandMark product="HelpDesk" size="sm" />
          </span>
          {/* Glifo compacto quando recolhido (desktop) */}
          <span
            className={
              "mx-auto hidden size-9 items-center justify-center rounded-lg bg-noturno-orange " +
              (expanded ? "lg:hidden" : "lg:flex")
            }
            aria-hidden="true"
          >
            <span className="text-base font-bold text-noturno-black">N</span>
          </span>
        </div>

        {/* Grupos de navegação */}
        <nav className="nav-scroll flex-1 overflow-y-auto px-3 py-4">
          <ul className="flex flex-col gap-5">
            {nav.map((group) => (
              <li key={group.id} className="flex flex-col gap-1">
                <span
                  className={
                    "px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-noturno-grey-light/60 " +
                    collapsed
                  }
                >
                  {group.label}
                </span>

                <ul className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = isActive(pathname, item.href);
                    const base =
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors " +
                      railCenter;

                    const icon = (
                      <span className="flex size-5 shrink-0 items-center justify-center">
                        <IconByKey name={item.icon} size={18} />
                      </span>
                    );
                    const label = (
                      <span className={"truncate " + collapsed}>{item.label}</span>
                    );

                    if (!item.href) {
                      return (
                        <li key={item.id}>
                          <span
                            className={
                              base +
                              " cursor-default text-noturno-grey-light/40"
                            }
                            title={expanded ? "Em breve" : item.label}
                          >
                            {icon}
                            {label}
                          </span>
                        </li>
                      );
                    }

                    return (
                      <li key={item.id}>
                        <Link
                          href={item.href}
                          onClick={() => layout.closeDrawer()}
                          aria-current={active ? "page" : undefined}
                          title={item.label}
                          className={
                            base +
                            (active
                              ? " bg-noturno-orange/10 font-medium text-noturno-orange"
                              : " text-noturno-grey-light-clean hover:bg-white/5 hover:text-white")
                          }
                        >
                          {icon}
                          {label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        {/* Rodapé: versão */}
        <div className="shrink-0 border-t border-white/8 px-4 py-3">
          <span className={"text-xs text-noturno-grey-light/60 " + collapsed}>
            HelpDesk {APP_VERSION}
          </span>
        </div>

        {/* Borda de redimensionamento (desktop, expandido). */}
        {expanded && (
          <div
            onPointerDown={startResize}
            role="separator"
            aria-orientation="vertical"
            aria-label="Ajustar largura do menu"
            className="absolute inset-y-0 -right-1 hidden w-2 cursor-col-resize lg:block"
          >
            <span
              className={
                "absolute inset-y-0 right-1 w-px transition-colors " +
                (dragging ? "bg-noturno-orange" : "bg-transparent hover:bg-white/15")
              }
            />
          </div>
        )}
      </aside>
    </>
  );
}
