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
    storage/      # KeyValueStore (local/session)
    http/         # contrato HttpClient (NotConfiguredHttpClient enquanto mock-first)
    extensions/   # formatters/validators (cpf, cnpj, cep, telefone, moeda, e-mail, texto)
  modules/        # módulos de negócio (auth, customers, ...) em domain/data/presentation
  router/         # Vue Router
  main.ts         # bootstrap (Pinia, Router, PrimeVue Aura dark-first)
```

Cada módulo segue a estrutura corporativa `domain / data / presentation`
(ver `../template/docs/architecture`).

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
