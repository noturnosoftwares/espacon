# Especificação — Tela Principal (Home / Main Layout)

> Layout-base detalhado em `docs/screens/home-layout.md`. Esta especificação
> registra o que foi implementado (mock-first) seguindo aquele desenho.

## Nome

Tela principal (home) — shell autenticado + dashboard central.

## Objetivo

Ponto central do sistema após a autenticação: acesso rápido aos módulos (menu
lateral), indicadores conforme o perfil (dashboard), notificações e ações de
conta. É a moldura reutilizável das telas internas.

## Contexto

Primeira tela pós-login real. Mock-first (sem API): widgets e notificações vêm de
provider mock; o menu é configuração de produto local. Permissões vêm do usuário
autenticado (hoje o admin mock tem `["*"]`). Rota: `/dashboard` (destino do
login).

## Estrutura

- **Navbar superior:** toggle do menu, pesquisa rápida, central de notificações,
  nome/avatar do usuário, menu de perfil (Meu Perfil, Alterar Senha, Preferências
  — "em breve"; Sair — ativo).
- **Menu lateral:** cabeçalho (logo + nome + versão) e grupos (Dashboard,
  Clientes, Atendimento, Financeiro, Administração, Ajuda). **Cada item tem
  ícone próprio.** Responsivo: expandido/recolhido (desktop, com rail só de
  ícones) e drawer (mobile). A **largura é ajustável por arrasto** na borda
  direita (`LayoutStore.menuWidth`, limitada a 220–360 px) e o scroll usa
  barra fina (`.nav-scroll`).
- **Dashboard central:** ocupa toda a largura disponível (sem `max-width`).
  Cabeçalho com saudação + **toolbar** (seletor de data com calendário e botão
  de filtros/período — UI local enquanto mock). Widgets em **seções ordenadas**
  com tamanhos variados (hierarquia visual):
  - **Contadores** (`sm`) — KPIs compactos no topo;
  - **Contratos** — cards em destaque;
  - **Financeiro** — cards, alguns `lg` (ocupam 2 colunas).
  Cards com `detailHref` exibem o link **"Ver detalhes"** para a página da
  informação (ex.: `/clientes`).
- **Gráficos do dashboard** (rodapé, financeiros — só com `financial.summary.view`):
  **Fluxo de Caixa** (barras agrupadas entradas/saídas + linha de saldo) e
  **Resumo financeiro do mês** (donut + legenda). Componentes SVG reutilizáveis
  `shared/widgets/bar-line-chart` e `donut-chart`. Espelham
  `docs/screens/home_screen.png`.

## Regras de Negócio (controle por permissão — ADR-006)

- Um **grupo de menu** só aparece se o usuário tiver a permissão do grupo; itens
  com permissão própria também são filtrados.
- Cada **widget** do dashboard tem permissão própria; só é exibido se concedida.
- Coringa `"*"` libera tudo (admin de matriz); coringa por prefixo `"area.*"`
  cobre `"area.x"`.
- A filtragem é **regra de aplicação** (UseCase / `buildNavigation`), nunca na
  presentation.
- Itens de módulos ainda inexistentes são exibidos sem navegação (placeholder),
  evitando rotas 404.

## Fluxo

```txt
HomePage (monta HomeStore + LayoutStore)
  → HomeStore.init()
    → SessionRepository.restore()         // guard: sem sessão → redireciona "/"
    → buildNavigation(user)               // menu filtrado por permissão
    → GetDashboardUseCase.execute(user)   // widgets filtrados por permissão
    → GetNotificationsUseCase.execute()
```

## Entradas / Saídas

- Entrada: usuário autenticado (sessão) — `AuthenticatedUser` (`permissions[]`).
- Saídas: `AsyncResult<DashboardWidget[]>`, `AsyncResult<AppNotification[]>`.

## Casos de Erro

| Caso                       | Mensagem                                | Code                            |
| -------------------------- | --------------------------------------- | ------------------------------- |
| Falha ao carregar widgets  | Não foi possível carregar o dashboard...| `home/dashboard-load-failed`    |
| Falha em notificações      | (silenciosa) lista vazia, não bloqueia  | `home/notifications-load-failed`|
| Sem sessão                 | redireciona para o login (`/`)          | —                               |

## Models

- `NavGroup` / `NavItem` (menu + permissão + `IconKey`; **item agora tem `icon`
  obrigatório**).
- `DashboardWidget` (`id`, `title`, `permission`, `order`, `value`, `hint`,
  `tone`, `icon`) + layout: `section` (`counters`/`contracts`/`financial`),
  `size` (`sm`/`md`/`lg`), `detailHref`/`detailLabel`; + dados de apresentação
  ricos: `subtitle`, `trend` (`label`/`direction`/`positive` → pílula verde/
  vermelha), `spark` (série do mini-gráfico) e `featured` (acento no topo +
  glow). Tons reutilizáveis em `shared/design-system/tones`
  (`TONE_HEX`/`TONE_BADGE`/`TONE_SOFT`).
- `AppNotification` (`type`, `title`, `description`, `createdAtLabel`, `read`).

## Contratos / Mappers

Sem contrato real nesta fase. Widgets/notificações virão da API → conversão em
`modules/home/data/mappers` e `ApiHomeProvider`, sem impacto nas camadas acima.
O menu permanece local (produto).

## Mock Inicial

`MockHomeProvider` (latência ~500 ms) sobre `mock-dashboard-widgets`,
`mock-notifications` e `mock-nav`.

## Responsividade

- Desktop: menu expandido + grid em múltiplas colunas.
- Tablet: grid reorganizado (2 colunas).
- Mobile: menu em drawer + grid em coluna única.

## Integração Real

Trocar `MockHomeProvider` por `ApiHomeProvider` + mapper em `home-factory.ts`.
Avaliar guard de rota no servidor com a sessão real (hoje o guard é client-side,
ADR-005).

## Impactos

- Novo módulo `src/modules/home`.
- `/dashboard` deixa de ser placeholder e passa a renderizar a home.
- Novos compartilhados: `PermissionExt`, `useClickOutside`, registro `IconKey`,
  `tones` (tons reutilizáveis) e `Sparkline` (mini-gráfico SVG).
- Moldura autenticada extraída para `AuthenticatedShell` (sessão + guard + menu +
  navbar), reutilizada pela Central de Ajuda (`/ajuda`).

## Rota / Tela

- `/dashboard` — `src/modules/home/presentation/pages/home-page.tsx`.

## Base de Conhecimento

Entrada "Tela principal": áreas (navbar, menu, dashboard), como o menu/indicadores
variam por permissão/perfil, central de notificações e ações de perfil (incl.
Sair). Atualizar quando a API real entrar.
