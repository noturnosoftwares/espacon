// Scope: [M] module-auth
//
// Tela inicial institucional integrada ao login. Layout split (Dark First):
// esquerda = autenticação; direita = apresentação do portal. A AuthStore é
// criada UMA vez por montagem da tela (instância por tela, não singleton),
// ligada ao LoginUseCase via factory explícita.

"use client";

import { useState } from "react";
import {
  makeLoginUseCase,
  makeSessionRepository,
} from "../../data/auth-factory";
import { AuthStore } from "../stores/auth-store";
import { LoginForm } from "../widgets/login-form";
import { PortalShowcase } from "../widgets/portal-showcase";

export function LoginPage() {
  // useState com inicializador preguiçoso garante uma única instância por tela.
  const [store] = useState(
    () => new AuthStore(makeLoginUseCase(), makeSessionRepository()),
  );

  return (
    <main className="grid min-h-dvh w-full lg:grid-cols-[1fr_1.1fr]">
      {/* Esquerda: autenticação */}
      <section className="flex items-center justify-center px-6 py-12 sm:px-10 lg:px-16">
        <LoginForm store={store} />
      </section>

      {/* Direita: apresentação institucional (oculta em telas estreitas) */}
      <section className="relative hidden overflow-hidden border-l border-white/5 bg-gradient-to-br from-noturno-black-3 via-noturno-black-secondary to-noturno-black lg:block">
        <PortalShowcase />
      </section>
    </main>
  );
}
