# ADR-004 — Estado com Pinia, hierarquia de stores e AsyncResult

## Status

Aceito

## Data

2026-06-06

## Contexto

A regra corporativa pede hierarquia de stores (BaseStore → BaseCrudStore →
store específica) e retorno assíncrono padronizado (AsyncResult), inspirados no
padrão Flutter da Noturno. O Pinia não oferece herança de classes; precisamos de
um equivalente idiomático em Vue.

## Opções avaliadas

### Opção 1 — Classes com herança

Não é idiomático em Pinia/Vue; atrapalha reatividade e tree-shaking.

### Opção 2 — Repetir estado/ações em cada store

Gera duplicação e diverge do padrão corporativo.

### Opção escolhida — Composables base compostos em setup stores

`useBaseStore()` e `useBaseCrudStore<T,F>()` retornam estado reativo + ações; as
stores específicas (`defineStore` setup) compõem via spread. `AsyncResult<T>` +
`AppError` padronizam os retornos; o helper `run()` controla loading/erro.

## Decisão

- Estado global/por-tela com Pinia (setup stores).
- `BaseStore` (`src/shared/stores/base-store.ts`): loading, isSaving, isDeleting,
  isInitialized, errorMessage, successMessage, hasError, `run()`.
- `BaseCrudStore` (`base-crud-store.ts`): itens, paginação, filtros, seleção,
  `loadPage()`.
- Toda operação assíncrona de Application/UseCase/Repository/Provider retorna
  `AsyncResult<T>`; exceptions cruas são capturadas em `data`/`application`
  (helper `guard()`), nunca na presentation.
- Ciclo de vida da store decidido por contexto (por tela quando há estado de
  formulário/edição; singleton só para estado verdadeiramente global).

## Consequências

### Benefícios

- Sem duplicação de estado comum; padrão único de erro/loading.
- Reatividade idiomática e testável (mocks de UseCase).

### Riscos

- Composables base podem crescer → manter responsabilidade única e dividir se necessário.

### Impactos

`src/shared/stores`, `src/shared/result`, stores de todos os módulos.

## Quando revisar esta decisão

Se o padrão de stores não atender a um caso complexo, ou em mudança de biblioteca
de estado.

## Relação com outros ADRs

Independente; usado por todos os módulos (auth, customers, etc.).

## Observações

`AsyncResult` é equivalente ao do Flutter usado pela Noturno.
