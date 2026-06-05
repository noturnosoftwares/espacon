// Scope: [M] module-auth
//
// Coluna esquerda da tela inicial: formulário de autenticação. Conecta-se à
// AuthStore (criada na página) e dispara o fluxo de login. Sem regra de negócio
// aqui — apenas coleta de entrada, estados visuais e disparo da store.

"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { BaseButton } from "@/shared/widgets/base-button";
import { BaseTextField } from "@/shared/widgets/base-text-field";
import { PasswordField } from "@/shared/widgets/password-field";
import { BrandMark } from "@/shared/widgets/brand-mark";
import { ArrowRightIcon, MailIcon } from "@/shared/design-system/icons";
import { useStore } from "@/shared/stores/base-store";
import type { AuthStore } from "../stores/auth-store";

type LoginFormProps = {
  store: AuthStore;
};

export function LoginForm({ store }: LoginFormProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const loading = useStore(store, (s) => s.loading);
  const errorMessage = useStore(store, (s) => s.errorMessage);
  const authenticatedUser = useStore(store, (s) => s.authenticatedUser);

  // Pré-preenche com o e-mail lembrado da última sessão (salvar dados).
  const [email, setEmail] = useState(() => store.rememberedEmail());
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);

  // Restaura uma sessão salva ("Manter acesso") ao montar a tela.
  useEffect(() => {
    void store.restore();
  }, [store]);

  // Redireciona para o dashboard (placeholder) após autenticação bem-sucedida.
  useEffect(() => {
    if (authenticatedUser) {
      startTransition(() => router.push("/dashboard"));
    }
  }, [authenticatedUser, router]);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void store.login({ email, password, keepSignedIn });
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="lg:hidden">
        <BrandMark product="HelpDesk" size="md" />
      </div>

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Acesse o portal
        </h1>
        <p className="text-sm text-noturno-grey-light">
          Plataforma central de gestão da Noturno Softwares.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <BaseTextField
          label="E-mail"
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder="seu@email.com.br"
          leftIcon={<MailIcon size={18} />}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <PasswordField
          label="Senha"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <div className="flex items-center justify-between text-sm">
          <label className="flex cursor-pointer items-center gap-2 text-noturno-grey-light">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="size-4 accent-noturno-orange"
            />
            Manter acesso
          </label>
          <Link
            href="/recuperar-senha"
            className="font-medium text-noturno-orange transition-opacity hover:opacity-80"
          >
            Recuperar senha
          </Link>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="rounded-lg border border-noturno-red/30 bg-noturno-red/10 px-3.5 py-2.5 text-sm text-noturno-red"
          >
            {errorMessage}
          </p>
        )}

        <BaseButton
          type="submit"
          loading={loading}
          leftIcon={<ArrowRightIcon size={18} />}
        >
          Entrar
        </BaseButton>
      </form>

      <p className="text-xs text-noturno-grey-light/70">
        Acesso restrito a colaboradores, franquias e representantes autorizados.
      </p>
    </div>
  );
}
