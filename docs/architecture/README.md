# Arquitetura — HelpDesk

> Regras corporativas (camadas, mock-first, AsyncResult, mappers, stores,
> extensions/helpers, classificação de reuso) vivem no template
> `../noturno-web-template`. Este documento registra apenas a arquitetura
> **específica** do HelpDesk e como o template é aplicado aqui.

## Stack

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript (strict)
- Tailwind v4 (configuração CSS-first via `@theme` em `src/app/globals.css`)
- Sem backend no projeto (frontend desacoplado; comunicação futura via REST)

## Estrutura de pastas (`src/`)

A aplicação adota o layout corporativo sob `src/` (decisão ADR-004):

```txt
src/
  app/                      # entrada Next.js (rotas)
    page.tsx                # "/"          → tela inicial Landing/Login
    dashboard/page.tsx      # "/dashboard" → placeholder temporário
    layout.tsx · globals.css

  modules/
    auth/
      domain/               # models, enums, repositories (contratos)
      data/                 # application (usecases), repositories, providers, mocks
      presentation/         # pages, stores, widgets

  shared/                   # único local transversal
    result/                 # AsyncResult, AppError
    stores/                 # BaseStore (+ hook useStore)
    design-system/          # colors (paleta Noturno), icons
    widgets/                # BaseButton, BaseTextField, PasswordField, BaseCard, BrandMark
    helpers/                # delay, ...
```

`public/` e os arquivos de configuração permanecem na raiz (exigência do Next).

## Fluxo de navegação

O sistema **não abre direto no dashboard** (ADR-002):

```txt
Landing/Login (/)  →  Autenticação (mock)  →  Dashboard (/dashboard, placeholder)
```

## Fluxo de execução (login)

```txt
LoginPage → AuthStore → LoginUseCase → AuthRepositoryImpl → MockAuthProvider → AsyncResult
                                                                   ↑
                                          (trocar mock por API real = trocar provider + mapper)
```

- A presentation só conhece a `AuthStore`; nunca acessa provider/API diretamente.
- Toda chamada async retorna `AsyncResult`; exceções são capturadas em `data`.
- `AuthStore` estende apenas `BaseStore` (login não é CRUD) e é **instância por tela**.
- Composição via factory explícita `makeLoginUseCase()` — sem container global de DI.

## Multiempresa

O model `AuthenticatedUser` nasce com `role`, `accessScope`, `franchiseId?`,
`representativeId?` e `permissions[]`, mesmo no mock — para a rede de franquias
crescer sem refatoração estrutural. `accessScope` é o eixo de filtragem de dados.

## Pendências de evolução

- **Sessão real**: estratégia definitiva deferida (ADR-003). Hoje o login mockado
  apenas redireciona; não há sessão global persistida.
- **Mappers**: ainda não existem (sem contrato real de API). Entrarão em
  `modules/auth/data/mappers` quando houver JSON/Swagger de autenticação.
