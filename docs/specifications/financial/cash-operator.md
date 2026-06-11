# Especificação — Operador de Caixa (cadastro + vínculo com Usuário)

> Repositório: **EspaçoN** (produto) · herda regras do template `../template`.
> Caminho no repositório: `docs/specifications/financial/cash-operator.md`
> Status: **Rascunho v1 — mock-first; pendente de confirmações (ver "Pendências").**

---

## Nome

Cadastro e manutenção de **Operadores de Caixa**.

---

## Objetivo

Manter um **registro mestre** de operadores de caixa (`código` + `nome`) que serve
de fonte única para todos os módulos do Financeiro e para o vínculo opcional no
cadastro de Usuário.

O cadastro em si é **simples** (CRUD). A relevância está em ser uma entidade
**transversal**: o mesmo operador é referenciado por usuários e, futuramente, por
Contas a Receber, Contas a Pagar, Lançamentos no Caixa, Baixas de Pedidos e outros.

---

## Contexto

- Hoje o conceito de operador existe **apenas** como dado embutido no usuário
  (`users-and-permissions.md`): `isOperator`, `type` (`unlimited | limited`) e
  `operatorCode` — uma **string livre**, sem cadastro por trás.
- Esta spec cria a **entidade própria** `CashOperator` (registro mestre) e passa a
  tratar `operatorCode` como **referência** a um operador existente e ativo, não
  mais texto livre.
- Mock-first (ADR-001): nasce com `data/mocks` + `MockCashOperatorProvider`, atrás
  do contrato `CashOperatorRepository`. A API real entra depois só na camada `data`.
- Multiempresa (ADR-006): o produto não assume ambiente único. Esta spec mantém o
  cadastro **simples** e trata o escopo por franquia como decisão a confirmar
  (ver "Pendências" e ADR-008).

---

## Princípios

1. **Entidade dumb.** O operador carrega apenas `code` + `name` + `active`. A
   semântica de `limitado | ilimitado` **não** é do operador — é do **vínculo no
   usuário** (permanece em `modules/users`).
2. **Referência, não cópia.** O usuário (e módulos financeiros) referenciam o
   operador por `code`; não duplicam nome/dados do operador.
3. **Inativar, não apagar.** Operador referenciado nunca é removido fisicamente;
   usa-se `active = false` para preservar integridade do histórico.
4. **Frontend lidera o contrato** (mock é a fonte da verdade; conversão futura na
   camada `data`). Models em inglês (padrão do template).
5. **Mock-first.**

---

## Regras de Negócio

### Operador de Caixa (entidade)

- Campos: `code` (código de negócio, **único**, obrigatório), `name`
  (nome do operador, obrigatório), `active` (ativo/inativo).
- `code` é a **chave de vínculo** usada por usuários e módulos financeiros.
  Recomenda-se que `code` seja **imutável após a criação** (ver Pendências), para
  não quebrar referências existentes.
- **Inativação (exclusão lógica):** "excluir" na UI marca `active = false`. Um
  operador inativo não aparece nos seletores de novos lançamentos, mas continua
  válido em registros históricos que já o referenciam.
- **Bloqueio de remoção/inativação quando referenciado:** se houver usuário (ou,
  futuramente, lançamento financeiro) apontando para o `code`, a remoção física é
  proibida; a inativação é permitida com aviso.

### Vínculo no Usuário (regra que cruza com `modules/users`)

- O usuário possui o bloco de caixa (hoje `CashOperator` no users; ver ADR-008
  para renomeação): `isOperator`, `type` (`unlimited | limited`), `operatorCode`.
- **Opcional por padrão.** Sem operador, o vínculo é nulo.
- **Obrigatório quando `type = limited` (LIMITADO):** exige `operatorCode`
  preenchido **e** correspondente a um operador **ativo** do cadastro.
- `unlimited` (ILIMITADO): não fixa operador; o usuário escolhe/filtra qualquer
  operador no momento da operação (comportamento já descrito em
  `users-and-permissions.md`).
- A validação "código existe e está ativo" é feita na camada `data`/`application`
  do módulo de usuários, consumindo o `CashOperatorRepository`.

---

## Fluxo

### CRUD (assíncrono)

```txt
CashOperatorsPage
→ useCashOperatorStore (BaseCrudStore)
→ UseCase (makeGetCashOperators / makeSaveCashOperator / ...)
→ CashOperatorRepository
→ MockCashOperatorProvider
→ AsyncResult<T>
```

### Seleção em outro módulo (usuário e financeiro)

```txt
CashOperatorPicker (widget)
→ makeGetActiveCashOperators()  // somente active = true
→ devolve lista para o seletor
→ módulo consumidor grava apenas o `code`
```

---

## Entradas / Saídas

- **Entradas:** `code`, `name`, `active` (formulário); filtros da listagem
  (texto por código/nome, status ativo/inativo).
- **Saídas:** operador persistido; listagem paginada com filtro/ordenação; lista
  de operadores ativos para os seletores de outros módulos.

---

## Casos de Erro

Sempre via `AsyncResult`/`AppError` (a presentation nunca vê exception crua):

| Caso                                            | Categoria      | Mensagem (exemplo)                                  |
| ----------------------------------------------- | -------------- | --------------------------------------------------- |
| `code` vazio                                    | `validation`   | "Informe o código do operador."                     |
| `name` vazio                                    | `validation`   | "Informe o nome do operador."                       |
| `code` duplicado                                | `validation`   | "Já existe um operador com este código."            |
| Remover operador referenciado                   | `validation`   | "Operador em uso; inative em vez de excluir."       |
| Operador não encontrado (edição)                | `notFound`     | "Operador não encontrado."                          |
| Falha de rede (integração futura)               | `network`      | "Falha de conexão. Tente novamente."                |

---

## Contratos

> Mock-first: o JSON abaixo é o contrato-alvo do mock e da futura API REST.
> Models do frontend em **inglês**; conversão na camada `data` por mapper.

### JSON — Operador de Caixa

```json
{
  "id": 1,
  "code": "001",
  "name": "Caixa Principal",
  "active": true
}
```

### JSON — Listagem (PageResult)

```json
{
  "items": [
    { "id": 1, "code": "001", "name": "Caixa Principal", "active": true },
    { "id": 2, "code": "002", "name": "Caixa Loja Centro", "active": true }
  ],
  "total": 2
}
```

### Models (TypeScript)

```ts
// src/modules/cash-operators/domain/models/cash-operator.ts
export interface CashOperator {
  id: number
  code: string      // código de negócio (único) — chave de vínculo
  name: string
  active: boolean
}

export interface CashOperatorJson {
  id: number
  code: string
  name: string
  active: boolean
}

export function cashOperatorFromJson(json: CashOperatorJson): CashOperator { /* mapper */ }
export function cashOperatorToJson(model: CashOperator): CashOperatorJson { /* mapper */ }
export function cashOperatorCopyWith(
  base: CashOperator,
  changes: Partial<CashOperator>,
): CashOperator { /* imutabilidade */ }

// filtros da listagem (tipo F do BaseCrudStore)
export interface CashOperatorFilters {
  search?: string          // casa por código OU nome
  onlyActive?: boolean
}
```

> **Nota de naming (ver ADR-008):** o value object atual do usuário também se chama
> `CashOperator`. Para liberar o nome para a **entidade**, o VO do usuário deve ser
> renomeado para `CashOperatorAssignment` (`isOperator`, `type`, `operatorCode`).

---

## UseCases

Em `src/modules/cash-operators/data/application`. Composição por **factory
explícita** (`makeXUseCase()`), padrão do projeto.

| UseCase                              | Assinatura                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------- |
| `makeGetCashOperatorsUseCase()`      | `(page, size, filters) => Promise<AsyncResult<PageResult<CashOperator>>>` |
| `makeGetActiveCashOperatorsUseCase()`| `() => Promise<AsyncResult<CashOperator[]>>` (para os seletores)          |
| `makeGetCashOperatorByIdUseCase()`   | `(id) => Promise<AsyncResult<CashOperator>>`                              |
| `makeSaveCashOperatorUseCase()`      | `(CashOperator) => Promise<AsyncResult<CashOperator>>` (create/update)    |
| `makeDeleteCashOperatorUseCase()`    | `(id) => Promise<AsyncResult<void>>` (inativa; remove só se não referenciado) |

---

## Repositories / Providers

- Contrato em `domain/repositories/cash-operator-repository.ts`:
  `getPage`, `getActive`, `getById`, `save`, `delete`.
- `data/repositories/cash-operator-repository-impl.ts`: orquestra o provider,
  converte JSON → model (mapper) e protege a presentation com `guard()`.
- Providers: `MockCashOperatorProvider` agora; `RestCashOperatorProvider`
  (via `HttpClient`) depois — **sem alterar** domain/application/presentation.

---

## Mock Inicial

`MockCashOperatorProvider` com alguns operadores (ex.: `001 Caixa Principal`,
`002 Caixa Loja Centro`, `003 Caixa Eventos` inativo) e latência simulada para
exercitar o loading. Tudo em `AsyncResult`. Mantém a unicidade de `code` em
memória para validar duplicidade.

---

## Reuso e localização (classificação obrigatória)

| Item                                    | Onde                                              | Por quê                                              |
| --------------------------------------- | ------------------------------------------------- | ---------------------------------------------------- |
| Entidade `CashOperator` + CRUD + telas  | **`modules/cash-operators`**                      | Registro mestre próprio                              |
| `CashOperatorPicker` (seletor de ativos)| **`modules/cash-operators/presentation/widgets`** (exportado) | Reusado por Usuários **e** módulos financeiros |
| `CashOperatorRepository` / UseCases     | `modules/cash-operators/{domain,data}`            | Consumidos por outros módulos via factory            |
| Campos genéricos (texto, busca)         | **`shared/widgets`** (BaseTextField, SearchField) | Verificar/reusar antes de criar (regra do template)  |

Justificativa de módulo independente: a entidade é referenciada por múltiplos
módulos (usuários, contas a receber/pagar, caixa, baixas), então não pode nascer
presa a uma única feature financeira.

---

## Telas (UX)

### Listagem — `CashOperatorsPage`

Grid com padrões do produto: filtro (código/nome), ordenação, paginação, loading,
estado vazio, estado de erro. Ações por linha: editar, inativar. Botão "Novo".

### Formulário — `CashOperatorForm` (dialog ou página)

Campos: `código`, `nome`, switch `ativo`. Validação inline (código/nome
obrigatórios, código único). Salvar via store → UseCase.

### Seletor reutilizável — `CashOperatorPicker`

Componente que lista apenas operadores **ativos** e devolve o `code` escolhido.
Usado no bloco "Caixa" do cadastro de Usuário (quando LIMITADO) e, futuramente,
nas telas financeiras.

---

## Permissões e Rota (ADR-006)

- **Recurso permissionável** no catálogo: "Operador de Caixa" (sessão **Financeiro**
  ou **Cadastros** — confirmar), com as 9 ações padrão.
- Rota sugerida: `/financeiro/operadores-de-caixa` (confirmar agrupamento/menu).
- Item de menu e guard de rota gated por `can('OPERADOR DE CAIXA', 'abrir')`.

---

## Vínculo com o módulo de Usuários (tarefa do Claude Code, pós-criação)

Após criar `modules/cash-operators`, vincular ao Usuário (já especificado em
`users-and-permissions.md`):

1. **Renomear** o VO do usuário `CashOperator` → `CashOperatorAssignment`
   (libera o nome para a entidade). Ver ADR-008.
2. No bloco "Caixa" do formulário de usuário, **substituir o campo livre** de
   `operatorCode` por `CashOperatorPicker` quando `type = limited`.
3. **Validar no save do usuário:** `type = limited` ⇒ `operatorCode` obrigatório
   e correspondente a operador **ativo** (consulta ao `CashOperatorRepository`).
4. **Proteger integridade:** inativar/remover operador referenciado por algum
   usuário deve ser bloqueado (remoção) ou avisado (inativação).

> Pré-requisito a confirmar: ver Pendência sobre o estado atual do módulo de
> Usuários (spec existe; é preciso confirmar se já há código implementado).

---

## Integração Real (futura)

`RestCashOperatorProvider` consumindo o `HttpClient`. Endpoints-alvo a definir no
backend (ex.: `GET/POST/PUT /financial/cash-operators`, `GET .../active`). A
conversão JSON ↔ model fica na camada `data`. Definir no backend a unicidade de
`code` e a política de inativação.

---

## Impactos

`modules/cash-operators` (novo: domain/data/presentation), `modules/users`
(rename do VO + picker + validação), `modules/home` (item de menu + permissão),
`router` (rota + guard), catálogo de permissões — relação com **ADR-006** e
**ADR-008** (novo, proposto).

---

## Base de Conhecimento

Documentar: o que é o operador de caixa; onde cadastrar (rota/menu); como criar,
editar e inativar; a regra de vínculo no usuário (opcional / obrigatório quando
LIMITADO); que módulos consomem o operador; permissões da tela; impacto da
inativação em registros históricos.

---

## Pendências (precisam de confirmação)

- [ ] **Estado do módulo de Usuários:** a spec existe (Rascunho v2), mas é preciso
      confirmar se já há **código** implementado em `src/modules/users`. Isso
      define se o passo de vínculo é "ligar a um módulo pronto" ou "considerar no
      momento da implementação do usuário".
- [ ] **`code`:** manual ou gerado automático? Numérico ou alfanumérico?
      Imutável após criação? (assumido: manual, alfanumérico, único, imutável).
- [ ] **Exclusão:** confirmar **inativação (soft)** como padrão, com remoção física
      apenas quando nunca referenciado (assumido aqui).
- [ ] **Escopo multiempresa:** o operador é **global** ou pertence a uma
      **franquia** (`franchiseId`)? (assumido global/simples por ora; abrir campo
      se necessário — impacto em filtros e ADR-006).
- [ ] **Agrupamento/rota:** menu sob **Financeiro** ou **Cadastros**?
- [ ] **Referência por `code` vs `id`:** mantida por `code` (consistente com o
      atual `operatorCode`); confirmar a imutabilidade do código para preservar
      vínculos.

---

## Relação com ADRs

- Usa **ADR-001** (mock-first), **ADR-004** (stores/AsyncResult).
- Refina **ADR-006** e a spec `users-and-permissions.md` (referência tipada ao
  registro de operadores).
- Introduz **ADR-008** (proposto): "Operador de caixa como entidade própria,
  referenciada pelo usuário e pelos módulos financeiros".
