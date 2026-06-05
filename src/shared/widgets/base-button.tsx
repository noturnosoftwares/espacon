// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/ui)
//
// Botão base do Design System. Variantes seguem a paleta Noturno. Encapsula
// estado de loading (spinner próprio em CSS) e acessibilidade básica.

"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "ghost";

type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  leftIcon?: ReactNode;
};

const VARIANT_CLASSES: Record<Variant, string> = {
  primary:
    "bg-noturno-orange text-noturno-black hover:bg-noturno-orange-dark " +
    "shadow-[0_8px_24px_-8px_rgba(255,182,33,0.55)]",
  ghost:
    "bg-transparent text-noturno-grey-light-clean border border-white/10 " +
    "hover:border-noturno-orange/50 hover:text-white",
};

export function BaseButton({
  variant = "primary",
  loading = false,
  leftIcon,
  children,
  disabled,
  className = "",
  ...props
}: BaseButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      {...props}
      disabled={isDisabled}
      aria-busy={loading}
      className={
        "inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl px-5 " +
        "text-sm font-semibold tracking-wide transition-all duration-200 " +
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noturno-orange/60 " +
        "disabled:cursor-not-allowed disabled:opacity-60 " +
        VARIANT_CLASSES[variant] +
        " " +
        className
      }
    >
      {loading ? (
        <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : (
        leftIcon
      )}
      {children}
    </button>
  );
}
