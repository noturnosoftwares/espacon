# Arquitetura — EspaçoN

> Regras corporativas (camadas, mock-first, AsyncResult, mappers, stores,
> extensions/helpers, classificação de reuso) vivem no template
> `../template`. Este documento registra apenas a arquitetura
> **específica** do EspaçoN e como o template é aplicado aqui.

## Stack

- Vue.js 3.5
- Vite
- TypeScript
- PrimeVue UI
- Tailwind CSS
- Composition API
- Pinia
- Vue Router
- Tailwind v4 (configuração CSS-first via `@theme` em `src/app/globals.css`)

- Sem backend no projeto (frontend desacoplado; comunicação futura via REST)

## Estrutura de pastas

```txt
src/
  app/            # shell do app, estilos globais (globals.css), páginas de nível app
  shared/         # kernel reutilizável (sem regra de negócio de módulo)
    result/       # AsyncResult<T>, AppError, guard()
    stores/       # BaseStore, BaseCrudStore (composables p/ Pinia setup stores)
    selection/    # canal de seleção: listagem como consulta reutilizável (template ADR-003)
    storage/      # KeyValueStore (local/session)
    http/         # contrato HttpClient (NotConfiguredHttpClient enquanto mock-first)
    extensions/   # formatters/validators (cpf, cnpj, cep, telefone, moeda, e-mail, texto)
  modules/        # módulos de negócio (auth, customers, ...) em domain/data/presentation
  router/         # Vue Router
  main.ts         # bootstrap (Pinia, Router, PrimeVue Aura dark-first)
```

Cada módulo segue a estrutura corporativa `domain / data / presentation`
(ver `../template/docs/architecture`).

## Canal de seleção (`shared/selection`)

Implementa o padrão do **template ADR-003** ("Tela de listagem como consulta
reutilizável: modo gestão × modo seleção"): a própria tela de listagem de um dado
serve como tela de **pesquisa e retorno**, em vez de uma segunda tela só para
selecionar.

- `selection-types.ts` — `SelectionRequest` (`id`, `resource`, `returnTo`,
  `multiple?`) e `SelectionResult<T>` (`selected` | `cancelled`).
- `selection-store.ts` — `useSelectionStore` (Pinia): `open(req): id`,
  `resolve(id, data)`, `cancel(id)`, `get(id)`, `pendingFor(returnTo)`,
  `consume(id)`. **Apenas canal de handoff** — sem regra de negócio.
- `use-selection-mode.ts` — composable para a **listagem**: lê
  `?mode=select&req=<id>` da rota e expõe `isSelectMode`, `confirmSelection(record)`
  e `cancelSelection()`. Qualquer listagem futura herda os dois modos sem reescrever.

**Convenção de rota:** a tela solicitante chama `open({ resource, returnTo })`,
navega para a listagem com `?mode=select&req=<id>`; a listagem `resolve`/`cancel` e
faz `router.back()`. Como não há keep-alive, a solicitante **remonta** ao voltar e
recupera o resultado por `pendingFor(returnTo)` + `consume(id)`, preservando a
edição em andamento (não reinicializa o formulário). Primeira aplicação: cadastro
de usuário selecionando perfil (`/perfis?mode=select`).

## Fundação (Fase 0) — estabelecida

- Stack instalada: Vue 3.5, Vite, TS, **PrimeVue v4** (preset Aura), **Tailwind v4**
  (CSS-first), Pinia, Vue Router, PrimeIcons. Ver ADR-002.
- Tema **dark-first** via `.dark` no `<html>`; paleta oficial em `@theme`
  (`--color-noturno-*`). Ordem de camadas CSS: `tailwind-base, primevue, tailwind-utilities`.
- Kernel `shared/` criado: `AsyncResult`/`AppError` (ADR-004), `BaseStore`/`BaseCrudStore`
  (ADR-004), `KeyValueStore` (ADR-005), contrato `HttpClient` (ADR-001), extensions.
- Scaffold padrão do Vue removido; rota `/` exibe um placeholder temporário até o
  login (Fase 2).

> Próximas fases (ver `docs/app` e `docs/specifications`): Fase 1 Design System,
> Fase 2 Autenticação, Fase 3 Shell/Home + permissões, Fase 4+ módulos de negócio.
