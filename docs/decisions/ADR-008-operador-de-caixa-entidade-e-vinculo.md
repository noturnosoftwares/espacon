# ADR-008 — Operador de caixa como entidade própria, referenciada pelo usuário e pelos módulos financeiros

## Status

Proposto

## Data

2026-06-11

## Contexto

O conceito de "operador de caixa" já aparece em `users-and-permissions.md`, porém
apenas como **value object embutido no usuário** (`CashOperator`: `isOperator`,
`type`, `operatorCode`), onde `operatorCode` é uma **string livre**, sem cadastro
por trás. Vários módulos do Financeiro (Contas a Receber, Contas a Pagar,
Lançamentos no Caixa, Baixas de Pedidos, entre outros) precisarão referenciar o
mesmo operador. Sem um registro mestre, cada módulo dependeria de códigos digitados
à mão, sem unicidade nem integridade — divergindo da visão de patrimônio duradouro
do EspaçoN.

Há ainda uma colisão de nomes: o VO do usuário ocupa o nome `CashOperator`, que é
o nome natural da entidade.

## Opções avaliadas

### Opção 1 — Manter `operatorCode` como string livre

Simples no curtíssimo prazo, mas sem unicidade, sem nome associado, sem integridade
referencial; gera divergência entre módulos e retrabalho quando a API real chegar.

### Opção 2 — Embutir o cadastro de operadores dentro de um módulo financeiro

Acopla um registro **transversal** a uma única feature; os demais módulos passariam
a depender de um módulo financeiro específico para algo que é compartilhado.

### Opção escolhida — Entidade própria em módulo dedicado

Criar `modules/cash-operators` com a entidade `CashOperator` (`id`, `code`, `name`,
`active`) e CRUD. O usuário e os módulos financeiros **referenciam** o operador
pelo `code`. O VO do usuário é renomeado para `CashOperatorAssignment`.

## Decisão

- Criar `modules/cash-operators` (domain/data/presentation), mock-first.
- Entidade `CashOperator`: `id`, `code` (único, chave de vínculo), `name`,
  `active`. A semântica `limited | unlimited` **não** pertence à entidade — fica no
  vínculo do usuário.
- Renomear o VO do usuário `CashOperator` → `CashOperatorAssignment`
  (`isOperator`, `type`, `operatorCode`). `operatorCode` passa a ser **referência**
  a um operador ativo, validada na camada `data`/`application`.
- Vínculo no usuário: **opcional**; **obrigatório quando `type = limited`**.
- **Inativação (soft delete)** como padrão; remoção física só quando o operador
  nunca foi referenciado.
- Disponibilizar `CashOperatorPicker` (lista apenas ativos) para reuso por
  Usuários e pelos módulos financeiros.

### Decisões em aberto (a confirmar antes de mudar status para "Aceito")

- Geração e formato de `code` (manual vs automático; imutabilidade).
- Escopo multiempresa do operador (global vs por `franchiseId`).
- Referência por `code` (atual) vs `id` imutável.
- Agrupamento de menu/rota (Financeiro vs Cadastros).

## Consequências

### Benefícios

- Unicidade, nome e integridade referencial do operador em todo o sistema.
- Reuso transversal sem acoplar a uma feature financeira.
- Troca mock → API real isolada na camada `data`.

### Riscos

- Renomear o VO do usuário é mudança que afeta `modules/users` (mitigado se o
  módulo ainda não estiver implementado em código).
- Referenciar por `code` exige imutabilidade do código para não quebrar vínculos.

### Impactos

`modules/cash-operators` (novo), `modules/users` (rename do VO, picker, validação),
`modules/home` (menu/permissão), `router` (rota/guard), catálogo de permissões.

## Quando revisar esta decisão

Quando o backend real definir o contrato de operadores e a política de
inativação/escopo, ou quando as decisões em aberto forem confirmadas.

## Relação com outros ADRs

Refina o **ADR-006** (acesso/multiempresa) e a spec `users-and-permissions.md`.
Usa **ADR-001** (mock-first) e **ADR-004** (stores/AsyncResult). Não revoga nenhum
ADR.

## Observações

Status **Proposto** até a confirmação das decisões em aberto listadas acima.
