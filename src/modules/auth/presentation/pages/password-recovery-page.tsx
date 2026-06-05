// Scope: [M] module-auth
//
// Tela de recuperação de senha. Layout split (Dark First) reaproveitando a
// apresentação institucional do portal, como na tela de login. A
// PasswordRecoveryStore é criada UMA vez por montagem da tela (instância por
// tela), ligada ao RecoverPasswordUseCase via factory explícita.

"use client";

import { useState } from "react";
import { makeRecoverPasswordUseCase } from "../../data/auth-factory";
import { PasswordRecoveryStore } from "../stores/password-recovery-store";
import { PasswordRecoveryForm } from "../widgets/password-recovery-form";
import { PortalShowcase } from "../widgets/portal-showcase";

export function PasswordRecoveryPage() {
  // useState com inicializador preguiçoso garante uma única instância por tela.
  const [store] = useState(
    () => new PasswordRecoveryStore(makeRecoverPasswordUseCase()),
  );

  return (
    <main className="grid min-h-dvh w-full lg:grid-cols-[1fr_1.1fr]">
      {/* Esquerda: recuperação de senha */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <PasswordRecoveryForm store={store} />
      </section>

      {/* Direita: apresentação institucional (oculta em telas estreitas) */}
      <section className="relative hidden overflow-hidden border-l border-white/5 bg-gradient-to-br from-noturno-black-3 via-noturno-black-secondary to-noturno-black lg:block">
        <PortalShowcase />
      </section>
    </main>
  );
}
