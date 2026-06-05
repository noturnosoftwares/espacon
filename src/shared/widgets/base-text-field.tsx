// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/ui)
//
// Campo de texto base do Design System (flat design, Dark First). Suporta ícone
// à esquerda, slot à direita (ex.: botão de mostrar/ocultar senha) e label
// acessível. Evita recodificar campos repetitivos em cada cadastro.

"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

export type BaseTextFieldProps = Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className"
> & {
  label: string;
  leftIcon?: ReactNode;
  rightSlot?: ReactNode;
};

export function BaseTextField({
  label,
  leftIcon,
  rightSlot,
  id,
  ...props
}: BaseTextFieldProps) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={fieldId}
        className="text-xs font-medium uppercase tracking-wider text-noturno-grey-light"
      >
        {label}
      </label>
      <div
        className="group flex items-center gap-3 rounded-xl border border-white/10 bg-noturno-black-secondary px-3.5 transition-colors focus-within:border-noturno-orange/70"
      >
        {leftIcon && (
          <span className="text-noturno-grey-light transition-colors group-focus-within:text-noturno-orange">
            {leftIcon}
          </span>
        )}
        <input
          id={fieldId}
          {...props}
          className="h-12 w-full bg-transparent text-sm text-white placeholder:text-noturno-grey-light/60 focus:outline-none"
        />
        {rightSlot}
      </div>
    </div>
  );
}
