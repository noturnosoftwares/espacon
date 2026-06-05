// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/ui)
//
// Card base do Design System (Dark First). Superfície elevada com borda sutil,
// usado para agrupar blocos de informação em todo o sistema.

import type { HTMLAttributes } from "react";

type BaseCardProps = HTMLAttributes<HTMLDivElement>;

export function BaseCard({ className = "", children, ...props }: BaseCardProps) {
  return (
    <div
      {...props}
      className={
        "rounded-2xl border border-white/8 bg-white/[0.03] backdrop-blur-sm " +
        "shadow-[0_1px_0_0_rgba(255,255,255,0.04)_inset] " +
        className
      }
    >
      {children}
    </div>
  );
}
