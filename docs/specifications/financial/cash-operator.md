# Especificação — Operador de Caixa (cadastro + vínculo com Usuário)

> Repositório: **EspaçoN** (produto) · herda regras do template `../template`.
> Caminho no repositório: `docs/specifications/financial/cash-operator.md`
> Status: **Implementado v1 — mock-first** (frontend lidera o contrato).

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
LookupField (consumidor) → abre /operadores-de-caixa?mode=select (canal shared/selection)
→ listagem lista os ativos (getActiveCashOperators na abertura)
→ usuário escolhe → canal devolve o CashOperator à tela solicitante
→ módulo consumidor grava apenas o `code`
```

Não há **widget** seletor dedicado: reusa-se a **própria listagem** em modo
seleção (template ADR-003), evitando uma segunda tela de busca.

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
  search?: string                              // casa por código OU nome
  status?: 'all' | 'active' | 'inactive'       // filtro de Situação (tri-state)
}
```

> **Nota de naming (ver ADR-008) — feito:** o VO do usuário foi renomeado para
> `CashOperatorAssignment` (`isOperator`, `type`, `operatorCode`), liberando o nome
> `CashOperator` para esta **entidade** (`modules/cash-operators`).

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
| Seleção de operador ativo               | **listagem `/operadores-de-caixa` em modo seleção** (`shared/selection`) | Reusa a própria listagem (ADR-003); sem widget/tela duplicada |
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

### Seleção reutilizável — listagem em **modo seleção**

Não há componente seletor dedicado: a **própria listagem** abre em
`?mode=select` (canal `shared/selection`, template ADR-003), lista os operadores
**ativos** e devolve o `CashOperator` escolhido. Usada no bloco "Caixa" do
cadastro de Usuário (quando LIMITADO) e, futuramente, nas telas financeiras —
sempre gravando apenas o `code`. A coluna **Ver detalhes** (botão de ícone) só
aparece nesse modo.

---

## Permissões e Rota (ADR-006)

- **Recurso permissionável** no catálogo: "Operador de Caixa" (`FIN-007`, sessão
  **Financeiro**), com as 9 ações padrão.
- Rota: `/operadores-de-caixa` (+ `/novo` e `/:id`), dentro do `AppShell`. Mantida
  **plana** por consistência com `/usuarios` e `/perfis` (não `/financeiro/...`).
- Item de menu sob **Financeiro** (`available`); guard de rota por sessão
  (`requiresAuth`). O gate por `can('OPERADOR DE CAIXA', 'abrir')` entra quando o
  contrato de login carregar `Permission[]` (ver ADR-008).

---

## Vínculo com o módulo de Usuários (implementado)

1. ✅ **VO renomeado** `CashOperator` → `CashOperatorAssignment` (libera o nome
   para a entidade). Ver ADR-008.
2. ✅ No bloco "Caixa" do formulário de usuário, o `operatorCode` (quando
   `type = limited`) é um **`LookupField`** que abre a **listagem de operadores em
   modo seleção** (`/operadores-de-caixa?mode=select`), pelo **canal de seleção
   compartilhado** (`shared/selection`, template ADR-003) — em vez de um
   `CashOperatorPicker` dedicado, reusa a própria listagem (não há tela de busca
   duplicada). Só **ativos** são selecionáveis. O rótulo "código — nome" é
   resolvido pela store de usuários via `getActiveCashOperators`.
3. **Validação parcial:** a obrigatoriedade de `operatorCode` quando
   `type = limited` é validada no form; a seleção só oferece operadores **ativos**
   (logo, ativo-na-seleção). A reconferência "existe e está ativo" **no save** fica
   para o backend (autoridade de segurança) — ver Pendências.
4. **Integridade na inativação:** ver Pendências — o mock faz **inativação lógica**
   simples (`active = false`), sem checagem cruzada de referências (essa direção
   exigiria o módulo de operadores conhecer Usuários/Financeiro).

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

Verbete **"Operadores de Caixa"** adicionado em
`docs/specifications/ajuda/README.md`: o que é; onde acessar (Financeiro →
Operador de Caixa); pesquisa/filtro de situação; criar/editar; código único e
imutável; **inativação** (soft) e reativação; **modo seleção** a partir do
usuário; permissões (`FIN-007`).

---

## Decisões tomadas nesta implementação

- ✅ **`code`:** manual, alfanumérico, único e **imutável após a criação** (o campo
      fica `disabled` na edição). A unicidade é validada no save (mock em memória →
      erro de validação "Já existe um operador com este código.").
- ✅ **Exclusão = inativação (soft):** "Inativar" marca `active = false`; o registro
      permanece e é preservado em históricos. Não há remoção física na UI.
- ✅ **Agrupamento/rota:** menu sob **Financeiro**; rota **plana**
      `/operadores-de-caixa` (consistência com `/usuarios`, `/perfis`).
- ✅ **Referência por `code`** (consistente com `operatorCode`); imutabilidade do
      código preserva os vínculos.

## Pendências (evolução futura, não bloqueiam)

- [ ] **Validação "existe e está ativo" no save do usuário** (backend como
      autoridade): hoje a seleção já restringe a ativos; falta a reconferência
      server-side ao gravar.
- [ ] **Integridade referencial na inativação/remoção:** bloquear remoção física e
      avisar na inativação quando referenciado — exige consulta cruzada (Usuários,
      Financeiro). Fora do escopo do mock atual.
- [ ] **Escopo multiempresa:** operador **global** vs **franquia** (`franchiseId`).
      Assumido global/simples por ora (impacto em filtros e ADR-006).

---

## Relação com ADRs

- Usa **ADR-001** (mock-first), **ADR-004** (stores/AsyncResult).
- Refina **ADR-006** e a spec `users-and-permissions.md` (referência tipada ao
  registro de operadores).
- Introduz **ADR-008** (proposto): "Operador de caixa como entidade própria,
  referenciada pelo usuário e pelos módulos financeiros".
