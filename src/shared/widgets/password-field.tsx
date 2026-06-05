// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/ui)
//
// Campo de senha com botão mostrar/ocultar. Reusa BaseTextField e mantém o
// estado de visibilidade local (comportamento visual isolado — estado local
// permitido pela regra de gerenciamento de estado).

"use client";

import { useState } from "react";
import { BaseTextField, type BaseTextFieldProps } from "./base-text-field";
import { EyeIcon, EyeOffIcon, LockIcon } from "../design-system/icons";

type PasswordFieldProps = Omit<BaseTextFieldProps, "type" | "rightSlot" | "leftIcon">;

export function PasswordField(props: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  return (
    <BaseTextField
      {...props}
      type={visible ? "text" : "password"}
      leftIcon={<LockIcon size={18} />}
      rightSlot={
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Ocultar senha" : "Mostrar senha"}
          className="text-noturno-grey-light transition-colors hover:text-noturno-orange focus-visible:outline-none focus-visible:text-noturno-orange"
        >
          {visible ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      }
    />
  );
}
