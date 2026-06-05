// Scope: [M] module-auth
//
// Botão de logout. Encapsula o encerramento da sessão persistida (salvar dados)
// e o redirecionamento para o login, para que telas fora do módulo (ex.: o
// dashboard) não precisem conhecer AuthStore/repositories. Cria a AuthStore via
// factory explícita (instância por uso).

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  makeLoginUseCase,
  makeSessionRepository,
} from "../../data/auth-factory";
import { AuthStore } from "../stores/auth-store";

type SignOutButtonProps = {
  className?: string;
  children?: React.ReactNode;
};

export function SignOutButton({ className, children }: SignOutButtonProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [store] = useState(
    () => new AuthStore(makeLoginUseCase(), makeSessionRepository()),
  );

  async function handleSignOut() {
    await store.signOut();
    startTransition(() => router.push("/"));
  }

  return (
    <button type="button" onClick={handleSignOut} className={className}>
      {children ?? "Sair"}
    </button>
  );
}
