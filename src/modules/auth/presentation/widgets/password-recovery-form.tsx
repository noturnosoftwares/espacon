// Scope: [M] module-auth
//
// Coluna esquerda da tela de recuperação de senha: formulário de e-mail e estado
// de confirmação. Conecta-se à PasswordRecoveryStore (criada na página) e dispara
// o fluxo. Sem regra de negócio aqui — apenas coleta de entrada, estados visuais
// e disparo da store.

"use client";

import { useState } from "react";
import Link from "next/link";
import { BaseButton } from "@/shared/widgets/base-button";
import { BaseTextField } from "@/shared/widgets/base-text-field";
import { BrandMark } from "@/shared/widgets/brand-mark";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  MailIcon,
} from "@/shared/design-system/icons";
import { useStore } from "@/shared/stores/base-store";
import type { PasswordRecoveryStore } from "../stores/password-recovery-store";

type PasswordRecoveryFormProps = {
  store: PasswordRecoveryStore;
};

export function PasswordRecoveryForm({ store }: PasswordRecoveryFormProps) {
  const loading = useStore(store, (s) => s.loading);
  const errorMessage = useStore(store, (s) => s.errorMessage);
  const completed = useStore(store, (s) => s.completed);
  const sentToEmail = useStore(store, (s) => s.sentToEmail);

  const [email, setEmail] = useState("");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    void store.recover(email);
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-8">
      <div className="lg:hidden">
        <BrandMark product="HelpDesk" size="md" />
      </div>

      {completed ? (
        <ConfirmationPanel email={sentToEmail} onRetry={() => store.reset()} />
      ) : (
        <>
          <header className="flex flex-col gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Recuperar senha
            </h1>
            <p className="text-sm text-noturno-grey-light">
              Informe o e-mail da sua conta. Enviaremos um link para você
              redefinir a senha.
            </p>
          </header>

          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-5"
            noValidate
          >
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
              leftIcon={<MailIcon size={18} />}
            >
              Enviar link de recuperação
            </BaseButton>
          </form>
        </>
      )}

      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm font-medium text-noturno-grey-light transition-colors hover:text-noturno-orange"
      >
        <ArrowLeftIcon size={16} />
        Voltar para o login
      </Link>
    </div>
  );
}

/** Painel de confirmação exibido após o envio bem-sucedido. */
function ConfirmationPanel({
  email,
  onRetry,
}: {
  email: string | null;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-noturno-green/10 text-noturno-green">
        <CheckCircleIcon size={28} />
      </span>

      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Verifique seu e-mail
        </h1>
        <p className="text-sm leading-relaxed text-noturno-grey-light">
          Se houver uma conta associada a{" "}
          <span className="font-medium text-noturno-grey-light-clean">
            {email}
          </span>
          , você receberá um link para redefinir a senha em alguns instantes.
        </p>
      </header>

      <button
        type="button"
        onClick={onRetry}
        className="self-start text-sm font-medium text-noturno-orange transition-opacity hover:opacity-80"
      >
        Tentar outro e-mail
      </button>
    </div>
  );
}
