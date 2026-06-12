# ADR-010 — Endereço e Conta Bancária de pessoa como models compartilhados

## Status

Aceito

## Data

2026-06-12

## Contexto

A regra de negócio do EspaçoN é explícita: **todo cadastro de pessoa segue sempre
a mesma regra para endereço**. O cadastro de **Funcionário** introduziu um model
de endereço (`EmployeeAddress`) e um de conta bancária (`BankAccount`), com a
pendência registrada (P5 do Funcionário) de **promovê-los a compartilhados quando
surgisse um segundo consumidor**.

Esse segundo consumidor chegou: o cadastro de **Fornecedor** usa o mesmo endereço
(com lookup de Cidade do módulo `locations`, UF/País derivados) e a mesma conta
bancária (acrescida de **favorecido** e **CNPJ/CPF do favorecido**). Outros
cadastros de pessoa virão (Cliente, Transportadora, Franquia), todos com endereço
e, em vários casos, conta bancária.

Manter um model/seção de endereço por módulo levaria a **duplicação** e
**divergência** (uma tela validando/derivando diferente da outra), justamente o
que o template proíbe (reuso acima de tudo; FK de cidade via `locations`/`LookupField`).

## Opções avaliadas

### Opção 1 — Cada módulo mantém seu próprio Address/BankAccount

Rápido por módulo, mas duplica regra, máscara, derivação de UF/País e seção de
formulário. Qualquer ajuste vira retrabalho em N telas. Descartada.

### Opção 2 — Herança/mixin do model de endereço por módulo

Reduz duplicação parcialmente, mas acopla módulos por herança e dificulta
evolução independente. Não resolve a seção de UI compartilhada. Descartada.

### Opção escolhida — Promover a `shared/domain` + seções de formulário compartilhadas

`PersonAddress` e `BankAccount` passam a viver em `shared/domain`, com
`AddressSection` e `BankAccountSection` em `shared/widgets`. Todo cadastro de
pessoa consome os mesmos models e as mesmas seções.

## Decisão

- Criar **`shared/domain/person-address.ts`** (`PersonAddress`) e
  **`shared/domain/bank-account.ts`** (`BankAccount`), models em inglês, imutáveis,
  com `copyWith`/serialização (padrão do template).
- `PersonAddress` referencia **Cidade** por FK (`cityId`) via módulo `locations`,
  com `cityName`, `uf`, `countryId`, `countryName` **denormalizados** (somente
  leitura, derivados da cidade). `street`/`zipCode` preparados para lookup
  (mapas/CEP) futuro.
- `BankAccount` inclui `holderName` (favorecido) e `holderDocument` (CNPJ/CPF do
  favorecido) — **opcionais**, para não quebrar quem já usa (Funcionário).
- Criar **`AddressSection`** (com `CityLookupField` do `locations`; UF/País
  read-only) e **`BankAccountSection`** em `shared/widgets`. Todo cadastro de
  pessoa usa essas seções — **não** remontar campos de endereço/banco por tela.
- **Migrar** o Funcionário: `EmployeeAddress` → `PersonAddress` (mantendo o mapper
  na camada `data`, sem quebrar a tela nem o contrato).
- Cada módulo embute **apenas** o model + denormalizados; a fonte da cidade
  continua sendo o módulo `locations`.
- O que **não** fazer: criar segundo model de endereço/banco, digitar UF/País
  manualmente, ou usar `select` gigante/ID cru para cidade (usar `LookupField`).

## Consequências

### Benefícios

- Consistência total de endereço/banco entre cadastros de pessoa.
- Manutenção em um único lugar; novas telas (Cliente, Transportadora) reaproveitam.
- Alinha com a regra de negócio "todo cadastro de pessoa segue a mesma regra de
  endereço" e com o módulo `locations`.

### Riscos

- Mudança no model compartilhado afeta vários módulos → mitigado tratando
  evolução com **compatibilidade** (campos novos opcionais) e versionamento de
  contrato quando necessário (regra do template).
- Endereço com campos muito específicos de um módulo pode não caber no
  compartilhado → tratar como extensão pontual, sem fragmentar o model base.

### Impactos

- `shared/domain` (`person-address.ts`, `bank-account.ts`).
- `shared/widgets` (`AddressSection`, `BankAccountSection`).
- `modules/employees` (migração `EmployeeAddress` → `PersonAddress`).
- `modules/suppliers` (consumidor) e futuros cadastros de pessoa.
- `modules/locations` (fonte da cidade — sem alteração de contrato).

## Quando revisar esta decisão

- Quando um cadastro exigir um endereço estruturalmente diferente do padrão de
  pessoa (avaliar extensão vs. novo model).
- Quando `shared/domain` crescer a ponto de justificar virar **package** no
  monorepo.
- Quando a integração real de CEP/mapas adicionar campos (lat/long) ao endereço.

## Relação com outros ADRs

- **Realiza** a pendência P5 da spec do Funcionário
  (`docs/specifications/employees/employee-registration.md`).
- **Introduzido pela** spec do Fornecedor
  (`docs/specifications/suppliers/supplier-registration.md`).
- Usa o módulo `locations` e o padrão de **seleção/lookup** (ADR-003) e a stack
  (ADR-002). Não revoga nenhum ADR.

## Observações

- A promoção a `shared` deve ser feita **sem quebrar** a tela de Funcionário já
  existente: migrar o model, manter o mapper e cobrir com testes antes de remover
  o `EmployeeAddress` antigo (compatibilidade — regra do template).
