# Especificação — Recuperação de Senha

> Produto: **EspaçoN** · herda regras do template `../template`.
> Status: **Implementado v1 — mock-first** (frontend lidera o contrato).
> Relacionada: **login** (`auth/login.md`), **sessão** (`auth/session.md`) e
> **ADR-005** (sessão provisória).

---

## Nome

Recuperação de senha (esqueci minha senha) — rota `/recuperar-senha`.

---

## Objetivo

Permitir que o usuário solicite a redefinição da senha informando o e-mail da
conta, recebendo as instruções por e-mail. Nesta fase **mock-first** o envio é
simulado; o contrato (`recoverPassword(email)`) já existe para a API real.

---

## Contexto

Acessível a partir do login pelo link **"Esqueci minha senha"**. É uma tela
**standalone** (fora do `AppShell`, `guestOnly`), no mesmo padrão visual do login
(marca + card sobre `surface-canvas`). Nenhuma sessão é criada aqui.

---

## Regras de Negócio

1. **Anti-enumeração.** O sistema **nunca** revela se o e-mail existe. Em sucesso
   a confirmação é sempre genérica ("se houver uma conta associada a …, você
   receberá as instruções"). O provider mock conclui sempre com sucesso.
2. **Validação de formato.** O e-mail é validado (`isValidEmail`) antes do envio;
   formato inválido mostra erro inline e **não** dispara a requisição.
3. **Sem persistência.** A tela não grava sessão nem e-mail lembrado.
4. **Reenvio.** Após a confirmação, o usuário pode **reenviar para outro e-mail**
   (volta ao formulário) ou **voltar ao login**.

---

## Fluxo

```txt
Page → Store (usePasswordRecoveryStore) → UseCase (recoverPassword)
     → AuthRepository → Provider (Mock) → AsyncResult<void>
```

- A page só orquestra (sem regra de negócio): `init()` no mount, `submit()` no
  envio, navegação de volta ao login.
- A store valida o formato, executa o UseCase via `useBaseStore.run` e, em
  sucesso (sem erro), marca `sent` para a UI trocar para a confirmação.

---

## Casos de Erro

- **Formato inválido** → "Informe um e-mail válido." (inline, sem requisição).
- **Falha de rede** → `networkError` (mensagem padrão no topo do formulário).
- **E-mail inexistente** → **não** é um erro visível (anti-enumeração): mostra a
  mesma confirmação de sucesso.

---

## Models / UseCases / Providers

- **UseCase:** `makeRecoverPasswordUseCase()` → `recoverPassword(email): AsyncResult<void>`.
- **Repository:** `AuthRepository.recoverPassword` (impl em `data/repositories`).
- **Provider:** `MockAuthProvider.recoverPassword` — latência simulada, sucesso
  sempre (anti-enumeração). Substituível por `RestAuthProvider` sem tocar store/page.
- **Store:** `usePasswordRecoveryStore` (`presentation/stores`) — estende
  `useBaseStore`; estado `email`/`sent`; ações `init`/`submit`/`reset`.

---

## Telas (rotas)

- `/recuperar-senha` — `password-recovery-page.vue` (guestOnly). Dois estados:
  **formulário** (e-mail + "Enviar instruções") e **confirmação** (ícone de
  envelope + mensagem genérica + "Reenviar para outro e-mail"). Link **Voltar ao
  login** em ambos. Aberta pelo link **"Esqueci minha senha"** do login.

---

## Integração Real (depois)

A API definirá o endpoint de recuperação e o template do e-mail. Manter a regra
**anti-enumeração** no backend (resposta uniforme). A conversão vive no provider
REST; store e page não mudam.

---

## Impactos

`modules/auth` (`data/application/recover-password-usecase`, `presentation/stores/
password-recovery-store`, `presentation/pages/password-recovery-page`), `router`
(rota `/recuperar-senha` deixa de ser placeholder), `login-panel` (rótulo do link).

---

## Base de Conhecimento

Verbete em `docs/specifications/ajuda/README.md` (Recuperação de Senha).
