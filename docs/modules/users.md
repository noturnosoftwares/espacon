# Módulo: Usuários, Perfis e Permissões

`src/modules/users` — cadastro de **usuários**, **perfis** (modelos de cadastro) e
a **matriz de permissões** (recurso × ação). Multiempresa via `role`/`accessScope`
(ADR-006). Autorização lê sempre `user.permissions`; o perfil é apenas modelo e
**nunca** é consultado em runtime.

Especificação completa: [`docs/specifications/users/users-and-permissions.md`](../specifications/users/users-and-permissions.md).

## Telas e rotas

| Rota | Nome | Tela |
| --- | --- | --- |
| `/usuarios` | `users` | Listagem de usuários |
| `/usuarios/novo` · `/usuarios/:id` | `user-new` · `user-edit` | Cadastro/edição de usuário |
| `/perfis` | `user-profiles` | Listagem de perfis (gestão × seleção) |
| `/perfis/novo` · `/perfis/:id` | `user-profile-new` · `user-profile-edit` | Cadastro/edição de perfil |

## Listagem de perfil: modo gestão × modo seleção (template ADR-003)

A listagem `/perfis` é a **única** tela de pesquisa/seleção de perfil. Opera em dois
modos, decididos por `?mode=select` na rota (via `useSelectionMode` de
`shared/selection`):

- **Gestão** (padrão): clique/Enter na linha → abrem **detalhes/edição**.
- **Seleção** (`?mode=select&req=<id>`): clique/Enter na linha → **confirmam e
  devolvem** o perfil à tela solicitante (não abrem detalhes).

Em ambos os modos a linha tem o botão **Ver detalhes** (em modo seleção é o único
caminho para abrir o registro) além de **Novo perfil**.

## Seleção de perfil no cadastro de usuário

O campo **Perfil** do formulário de usuário é um `LookupField` (DS §9.2, campo de
busca — nunca listbox). Fluxo (Page → Store → Application; sem API na page):

1. O form registra a requisição (`selectionStore.open({ resource: 'perfis', returnTo })`)
   e navega para `/perfis?mode=select&req=<id>`.
2. A listagem `resolve` a seleção e faz `router.back()`.
3. Como não há keep-alive, o form **remonta** ao voltar: recupera o resultado por
   `pendingFor(returnTo)` + `consume(id)`, **preservando** a edição em andamento
   (não reinicializa o formulário) e pedindo **confirmação** antes de aplicar.
4. Aplicar um perfil **redefine** toda a matriz do usuário (`applyProfileToUser`) e
   grava `sourceProfileId` (apenas rastro). O rótulo do campo é resolvido por
   `getUserProfileById` (busca pontual, sem cache em massa).

## Stores

- `useUsersStore` / `useUserProfilesStore` — CRUD via `BaseCrudStore` (listagem com
  scroll infinito — ADR-002; edição com snapshot/cancelar — ADR-001).
- `usePermissionCatalogStore` — catálogo de recursos × ações da matriz.
- Canal de seleção: `useSelectionStore` (`shared/selection`) — handoff entre o
  cadastro e a listagem; não guarda regra de negócio.
