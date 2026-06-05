# Especificação — Sessão (Manter acesso + E-mail lembrado)

## Nome

Persistência de sessão provisória e e-mail lembrado ("salvar dados").

## Objetivo

Dar efeito real à opção "Manter acesso" e pré-preencher o e-mail no próximo
acesso, salvando esses dados localmente — sem depender ainda da API real.

## Contexto

Provisório (ADR-005), refina o ADR-003. Não há token/sessão real do backend; a
sessão é guardada no armazenamento local do navegador, isolada pelo contrato
`SessionRepository`.

## Regras de Negócio

- **Manter acesso = ligado** → sessão em `localStorage` (sobrevive ao fechamento
  do navegador).
- **Manter acesso = desligado** → sessão em `sessionStorage` (some ao fechar a
  aba).
- Ao alternar a opção, a sessão é mantida em apenas um meio (o outro é limpo).
- O último e-mail logado é lembrado em `localStorage` e pré-preenche o login.
- Ao montar a tela de login, uma sessão salva é restaurada → redireciona ao
  dashboard.
- O logout (`SignOutButton`, no dashboard) limpa a sessão de ambos os meios.
- **Não é autenticação segura:** dados locais, sem token/assinatura. Não
  substitui a sessão real (a ser definida com a API).

## Fluxo

```txt
Login bem-sucedido
  → AuthStore.login()
  → SessionRepository.save(user, keepSignedIn)  // local ou session
  → SessionRepository.rememberEmail(email)      // local

Abertura da tela de login
  → AuthStore.restore() → SessionRepository.restore() → (se houver) redireciona

Logout (dashboard)
  → AuthStore.signOut() → SessionRepository.clear()
```

## Entradas / Saídas

- `save(user: AuthenticatedUser, keepSignedIn: boolean): AsyncResult<void>`
- `restore(): AsyncResult<AuthenticatedUser | null>`
- `clear(): AsyncResult<void>`
- `rememberEmail(email): void` / `lastEmail(): string | null` (preferência local)

## Casos de Erro

| Caso              | Mensagem                            | Code                   |
| ----------------- | ----------------------------------- | ---------------------- |
| Falha ao salvar   | Não foi possível salvar a sessão.   | `session/save-failed`  |
| Falha ao limpar   | Não foi possível encerrar a sessão. | `session/clear-failed` |
| Sessão corrompida | (silencioso) tratada como ausência  | —                      |

Web Storage indisponível (SSR/modo privado) → operações são best-effort
(`KeyValueStore` SSR-safe com fallback em memória), sem quebrar a UI.

## Armazenamento

- `noturno.helpdesk.session` — usuário autenticado serializado (local **ou**
  session).
- `noturno.helpdesk.last-email` — último e-mail (local).

## Integração Real

Criar nova implementação de `SessionRepository` baseada em token/cookie via API,
trocando-a em `auth-factory.ts`. Store/Presentation não mudam. Avaliar então
guard de rota para `/dashboard`.

## Impactos

- `@/shared/storage/key-value-store.ts` (`KeyValueStore`, SSR-safe) — reutilizável
  por qualquer módulo (preferências, rascunhos, etc.).
- `AuthStore` passa a depender de `SessionRepository`.
- Dashboard usa `SignOutButton` (logout real).

## Rota / Tela

- `/` (login) — restauração + lembrar e-mail.
- `/dashboard` — logout via `SignOutButton`.

## Base de Conhecimento

Entrada "Manter acesso": o que faz (permanecer logado entre acessos), diferença
entre marcado/desmarcado, e-mail lembrado e como sair (logout limpa a sessão).
