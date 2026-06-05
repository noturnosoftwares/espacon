# Especificação — Login (Tela inicial institucional)

## Nome

Tela inicial institucional integrada ao login.

## Objetivo

Substituir a abertura direta no dashboard por uma porta de entrada institucional:
autenticar o usuário e, ao mesmo tempo, apresentar o portal e reforçar a marca
Noturno. Fluxo: `Landing/Login → Autenticação → Dashboard`.

## Contexto

Primeira funcionalidade real do HelpDesk. Também estabelece a fundação
arquitetural (estrutura `src/`, AsyncResult, BaseStore, design-system, mock-first).
Autenticação inicia mockada (ADR-003); o dashboard ainda não existe (ADR-002).

## Regras de Negócio

- E-mail e senha são obrigatórios; e-mail deve ter formato válido.
- Credencial válida (mock): `admin@noturno.com.br` / `noturno`.
- Credencial inválida → erro amigável via `AsyncResult`, sem travar a tela.
- Sucesso → redireciona para `/dashboard`.
- "Manter acesso" é coletado como intenção; o comportamento de sessão persistente
  será tratado quando houver sessão real.
- Não acessar API direto na tela; sem regra de negócio na presentation.

## Fluxo

1. Usuário acessa `/` (tela split: esquerda autenticação, direita apresentação).
2. Preenche e-mail/senha e envia.
3. `AuthStore.login()` → `LoginUseCase.execute()` (valida) → `AuthRepositoryImpl` → `MockAuthProvider`.
4. Sucesso: `authenticatedUser` populado → redireciona para `/dashboard`.
5. Erro: `errorMessage` exibido no formulário.

## Entradas

`LoginCredentials`: `email: string`, `password: string`, `keepSignedIn: boolean`.

## Saídas

`AsyncResult<AuthenticatedUser>`.

## Casos de Erro

| Caso                     | Mensagem                        | Code                       |
| ------------------------ | ------------------------------- | -------------------------- |
| Campos vazios            | Informe e-mail e senha.         | `auth/empty-fields`        |
| E-mail inválido          | Informe um e-mail válido.       | `auth/invalid-email`       |
| Credencial incorreta     | E-mail ou senha inválidos.      | `auth/invalid-credentials` |
| Falha inesperada         | Não foi possível concluir...    | `auth/unexpected`          |

## Contratos

Sem contrato de API real nesta fase (mock-first). O JSON de entrada/saída e o
mapper serão definidos quando existir a API de autenticação. Hoje o
`MockAuthProvider` produz o model interno diretamente.

## Models Envolvidos

- `AuthenticatedUser` (`id`, `name`, `email`, `role`, `accessScope`, `franchiseId?`,
  `representativeId?`, `permissions[]`) — nasce preparado para multiempresa.
- `LoginCredentials`.
- Enums `UserRole`, `AccessScope`.

## Mappers

Nenhum nesta fase. Entrará em `modules/auth/data/mappers` com o contrato real
(JSON externo → `AuthenticatedUser`).

## UseCases

- `LoginUseCase` — valida entrada e delega ao repositório.

## Repositories

- `AuthRepository` (contrato) / `AuthRepositoryImpl` (implementação).

## Providers

- `AuthProvider` (contrato) / `MockAuthProvider` (mock atual). Futuro:
  `ApiAuthProvider` (REST) + mapper.

## Mock Inicial

Credencial fixa `admin@noturno.com.br` / `noturno` → usuário admin de escopo
`global` (matriz), `permissions: ["*"]`. Latência simulada (~700 ms) para
exercitar o estado de loading.

## Integração Real

Substituir `MockAuthProvider` por um provider de API REST + mapper em
`auth-factory.ts`, sem impacto em Repository/UseCase/Store/Presentation. Definir
então a estratégia de sessão (token, persistência, guards de rota).

## Impactos

- Estabelece `src/` e a fundação `shared` (reutilizável por todos os módulos).
- Rota raiz `/` passa a ser a tela de login; `/dashboard` é placeholder.

## Base de Conhecimento

Entrada "Acesso ao portal / Login": como entrar (e-mail e senha), recursos
(mostrar/ocultar senha, manter acesso, recuperar senha), credencial mock de
desenvolvimento e mensagem de que o dashboard será disponibilizado em breve.
Atualizar quando a autenticação real entrar.

## Rota / Tela

- `/` — tela inicial Landing/Login (`src/modules/auth/presentation/pages/login-page.tsx`).
- `/dashboard` — placeholder temporário (`src/app/dashboard/page.tsx`).
