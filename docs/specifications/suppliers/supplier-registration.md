# Especificação — Cadastro de Fornecedor (módulo Suppliers)

> **Local sugerido no repositório:** `docs/specifications/suppliers/supplier-registration.md`
> **Módulo:** `src/modules/suppliers`
> **Grupo no menu:** Comercial → Fornecedores (rota plana `/fornecedores`)
> **Status:** Aceito — decisões de negócio registradas na seção 19.
> **Autoria da regra de negócio:** Glenio / Noturno Softwares — esta IA apenas formaliza.

Segue a estrutura obrigatória de `docs/specifications/README.md` e herda o template
corporativo (camadas `domain/data/presentation`, fluxo `Page → Store → UseCase →
Repository → Provider`, mock-first, `AsyncResult<T>`, models em inglês com mappers em
`data`, imutabilidade/`copyWith`) e o Design System (`docs/design-system/README.md`).

Aproveita os padrões já consolidados: **FK por `LookupField`** abrindo o cadastro em modo
seleção (ADR-003); **scroll infinito** em lotes de 30 (ADR-002); **`RecordCodeBadge`** +
coluna "Cód." + **`InitialsAvatar`** (DS §8.11); **`Switch`** para booleanos;
**`MaskedField`/`DateField`** para campos formatados; **inativação soft** (padrão
cash-operator); **endereço de pessoa** reutilizando o módulo `locations`.

---

## 1. Nome

Cadastro de Fornecedor (Supplier Registration).

---

## 2. Objetivo

Centralizar o cadastro de fornecedores — base para **Contas a Pagar**, **Ordens de Compra**,
**Notas Fiscais de Compra e de Devolução** e demais módulos fiscais/financeiros. É um número
crítico do sistema: precisa de **identificação fiscal correta** (inclusive o novo CNPJ
alfanumérico), **dados completos para a Reforma Tributária** e **integridade referencial**
(não some quando referenciado).

Migração de uma tela legada simples (print anexado). A nova tela preserva os campos,
reorganiza conforme o Design System e **força fortemente** os dados fiscais exigidos pela
Reforma Tributária.

---

## 3. Contexto

* Alimenta (em breve): Contas a Pagar, Ordens de Compra, NF-e de Compra, NF-e de Devolução,
  apuração fiscal (CBS/IBS/IS). Por isso o cadastro é referenciado por `LookupField` em
  vários módulos futuros (modo seleção, ADR-003) e **nunca** é removido fisicamente quando
  em uso (inativação soft).
* **Endereço de pessoa** segue o **mesmo padrão do Funcionário** (Cidade/CEP/Endereço via
  módulo `locations`). Como agora há um 2º consumidor, o endereço é **promovido a
  compartilhado** (seção 14.3 / ADR proposto).
* A tela é grande → o formulário usa **sub-abas** (Dados Gerais, Endereço, Contato, Fiscal,
  Bancário, Observações) dentro da aba **Cadastro**.

---

## 4. Regras de Negócio

### 4.1 Natureza do fornecedor (genérico × identificado)

| # | Regra |
|---|-------|
| N1 | Todo fornecedor tem uma **natureza** (`SupplierType`): **Genérico**, **Pessoa Física** ou **Pessoa Jurídica**. |
| N2 | **Genérico** (flag `isGeneric`, derivado de `type = GENERIC`): fornecedor **sem dados da pessoa** — usado para guias/recolhimentos como **DAS, DARF, DARE**, taxas, etc. Exige apenas **Razão (nome)** e **Situação**; demais campos ficam **opcionais/ocultos**. |
| N3 | **Identificado** = não-genérico = **Pessoa Física** (CPF) **ou** **Pessoa Jurídica** (CNPJ). É o termo adotado para o fornecedor "real". |
| N4 | A natureza define **rótulos e máscara do documento**: Jurídica → "Razão Social" + CNPJ + "Insc. Estadual"; Física → "Nome" + CPF + "RG". |
| N5 | Trocar de natureza com dados preenchidos pede **confirmação** (evita perda silenciosa — DS). |

### 4.2 Obrigatoriedade

**Fornecedor identificado (Física/Jurídica) — obrigatórios:**
Razão/Nome, CNPJ/CPF, Endereço, Número, Bairro, Cidade, Estado (UF), CEP, Situação.
**Complemento é opcional** (P1). Os **dados fiscais (seção 4.5) ficam opcionais** até o
módulo fiscal existir (P6) — serão tornados obrigatórios quando a apuração CBS/IBS entrar.

**Fornecedor genérico — obrigatórios:** Razão (nome) e Situação. O resto é opcional; o
**documento fica vazio** e **não há categoria adicional** (P2).

### 4.3 Validações (extensions globais)

| # | Campo | Regra | Extension |
|---|-------|-------|-----------|
| V1 | CNPJ | **Novo modelo alfanumérico** (IN RFB 2.229/2024) **e** o numérico atual. 14 posições; 12 primeiras alfanuméricas (A–Z maiúsculas + dígitos), 2 últimas DV numérico (Módulo 11, ASCII−48). | `isValidCnpj` (**atualizar** — seção 14.1) |
| V2 | CPF | CPF válido (DV + rejeita sequência). | `isValidCpf` (existe) |
| V3 | Insc. Estadual | **Opcional.** Aceita **"ISENTO"** ou vazio (não possuir). **Se houver valor numérico, validar** por UF (DV próprio do estado). Para PF, o campo é RG (sem checksum nacional). | `isValidStateRegistration(ie, uf)` (**criar**) |
| V4 | CEP | CEP válido e coerente com a UF (padrão do Funcionário). | `isValidCep` + `isCepWithinUf` |
| V5 | Celular | Apenas celular (11 dígitos, DDD válido, 9º dígito = 9). | `isValidMobilePhone` |
| V6 | Telefone/Fax | Telefone BR válido (fixo ou celular). | `isValidPhone` |
| V7 | E-mail | E-mail válido. | `isValidEmail` |
| V8 | CNPJ/CPF do Favorecido | Mesmo conjunto de V1/V2 conforme o documento informado. | `isValidCnpj`/`isValidCpf` |

### 4.4 Apresentação e formatação

* **E-mail em lowercase** na apresentação e no armazenamento (normalizar no blur/save).
* CNPJ/CPF/CEP/telefone com **máscara** (`MaskedField`); a máscara do documento alterna
  conforme a natureza. CNPJ aceita conteúdo alfanumérico nas 12 primeiras posições.
* Insc. Estadual com "ISENTO" como valor especial aceito.

### 4.5 Dados fiscais (Reforma Tributária) — forçar o necessário

Bloco na **sub-aba Fiscal**. **Opcional agora** (P6); o cadastro **estrutura** os campos e
serão tornados **obrigatórios quando o módulo fiscal (apuração CBS/IBS) existir**:

| Campo | Uso |
|-------|-----|
| Regime tributário (CRT) | Simples Nacional / Simples (excesso) / Regime Normal / MEI. |
| Indicador de IE (contribuinte) | Contribuinte ICMS·IBS / Isento / Não contribuinte (espelha `indIEDest`). |
| Contribuinte IBS/CBS | Indicador para crédito/apuração na Reforma. |
| Inscrição Estadual | já no cadastro (V3). |
| Inscrição Municipal | serviços/ISS → IBS municipal. |
| CNAE principal | atividade econômica. |
| SUFRAMA | quando aplicável (Zona Franca). |
| Optante Simples Nacional | boolean (`Switch`). |
| Produtor rural | boolean + inscrição de produtor (quando aplicável). |

> Cálculo de IBS/CBS **não** entra aqui — fica no módulo fiscal. Estes campos apenas
> **classificam** o fornecedor para a apuração futura.

### 4.6 Situação e ciclo de vida

* `status`: **ATIVO** (→ `feedback-success`) ou **INATIVO** (→ `text-muted`/neutro). `Switch`
  ou `StatusBadge` conforme contexto.
* **Exclusão = inativação soft** (padrão cash-operator): "Apagar" **inativa** (`active=false`)
  quando o fornecedor já tem ou pode ter referências; remoção física só quando nunca
  referenciado. Sempre com confirmação destrutiva (`BaseDialog` danger).

---

## 5. Mapeamento dos campos do print (todos)

| Campo no print | Model (inglês) | Observações |
|----------------|----------------|-------------|
| Código | `id` | `RecordCodeBadge` ("Novo"/`Cód. NNNNN`). |
| Razão Social (Nome) | `legalName` | Física: nome; Jurídica: razão social. |
| Fantasia (Apelido) | `tradeName` | Nome fantasia. |
| CNPJ(CPF) | `document` | Máscara/validação por natureza; ícone de busca = consulta futura de CNPJ. |
| Insc.Est(RG) | `stateRegistration` | IE (Jurídica) / RG (Física); "ISENTO" aceito. |
| Endereço | `address.street` | `LookupField` (locations/mapas futuro). |
| Nº | `address.number` | |
| Complemento | `address.complement` | |
| Bairro | `address.district` | |
| Cidade | `address.cityId` | `CityLookupField` (locations); preenche UF/País. |
| UF | `address.uf` | Somente leitura (vem da cidade). |
| CEP | `address.zipCode` | `LookupField`/`MaskedField`; consulta futura por CEP. |
| Telefone | `phone` | |
| Fax | `fax` | |
| Celular | `mobile` | Validação celular (V5). |
| Nome do Contato | `contactName` | |
| E-Mail | `email` | lowercase. |
| Representante | `salesRepName` | Contato comercial do fornecedor (texto). Ver P3. |
| Telefone (do representante) | `salesRepPhone` | |
| Dados Bancário · Conta | `bankAccount.number` | |
| Dados Bancário · Tipo | `bankAccount.type` | CORRENTE / POUPANCA. |
| Dados Bancário · Agência | `bankAccount.branch` | |
| Dados Bancário · Banco | `bankAccount.bank` | |
| Dados Bancário · Favorecido | `bankAccount.holderName` | |
| Dados Bancário · CNPJ(CPF) | `bankAccount.holderDocument` | Validação V8. |
| Observação | `notes` | |
| *(novo)* Situação | `status` | Regra 6 (não existia no legado). |
| *(novo)* Natureza | `type` | Genérico/Física/Jurídica (regra 1/2). |

---

## 6. Fluxo

```txt
Page (SuppliersPage)
→ SuppliersStore (BaseCrudStore)
→ UseCase (Get/Save/Delete/Inactivate)
→ SupplierRepository
→ MockSupplierProvider
→ AsyncResult<T>
```

Lookups consumidos (modo seleção / ADR-003): Cidade (`CityLookupField`, módulo locations).
Endereço/CEP preparados para consulta futura.

---

## 7. Entradas / 8. Saídas

* **Entradas:** natureza, razão/nome, fantasia, documento, IE/RG, endereço completo
  (lookup de cidade), contatos (telefone/fax/celular/contato/e-mail), representante,
  dados bancários, dados fiscais, observação, situação; **pesquisa** (termo + filtros).
* **Saídas:** fornecedor persistido (com código), lista paginada por **scroll infinito**,
  totais para o dashboard; tudo em `AsyncResult<T>` (sucesso → `data`; falha → `AppError`).

---

## 9. Casos de Erro

| Código | Situação | Tratamento |
|--------|----------|-----------|
| `VALIDATION_REQUIRED` | Obrigatório vazio (conforme natureza) | Erro no campo + resumo |
| `VALIDATION_CNPJ` | CNPJ inválido (numérico ou alfanumérico) | Erro no campo |
| `VALIDATION_CPF` | CPF inválido | Erro no campo |
| `VALIDATION_IE` | Insc. Estadual inválida p/ a UF | Erro no campo |
| `VALIDATION_CEP_UF` | CEP fora da faixa da UF | Erro no campo |
| `VALIDATION_MOBILE`/`EMAIL` | Celular/e-mail inválido | Erro no campo |
| `CONFLICT_DOCUMENT` | CNPJ/CPF duplicado | **Tratado pelo backend** (autoridade); a UI apenas exibe o erro retornado (P7) |
| `DELETE_RESTRICT` | Referenciado (Contas a Pagar/Compras) | Bloqueia remoção; oferece inativar |
| `NOT_FOUND` / `NETWORK` | Inexistente / falha | Toast + volta à pesquisa |

---

## 10. Contratos

> Models em inglês; conversão pt-BR ⇄ inglês só no mapper em `data`.

### 10.1 Enums

```ts
// domain/enums/supplier-type.ts
export enum SupplierType {
  Generic = 'GENERICO',     // DAS, DARF, DARE... sem dados da pessoa
  Individual = 'FISICA',    // CPF
  Company = 'JURIDICA',     // CNPJ
}

// domain/enums/supplier-status.ts
export enum SupplierStatus { Active = 'ATIVO', Inactive = 'INATIVO' }

// domain/enums/tax-regime.ts  (CRT)
export enum TaxRegime {
  SimplesNacional = 'SIMPLES_NACIONAL',
  SimplesExcesso = 'SIMPLES_EXCESSO',
  RegimeNormal = 'REGIME_NORMAL',
  Mei = 'MEI',
}

// domain/enums/ie-indicator.ts  (espelha indIEDest)
export enum IeIndicator {
  Taxpayer = 'CONTRIBUINTE',       // 1
  Exempt = 'ISENTO',               // 2
  NonTaxpayer = 'NAO_CONTRIBUINTE',// 9
}
```

### 10.2 Models

```ts
// shared/domain/person-address.ts  (PROMOVIDO a shared — ver 14.3)
export type PersonAddress = {
  street: string;            // endereço (lookup)
  number: string;            // número
  complement: string;        // complemento
  district: string;          // bairro
  cityId: number | null;     // FK City (locations)
  cityName: string;          // denormalizado
  uf: string;                // denormalizado (da cidade)
  countryId: number | null;  // denormalizado
  countryName: string;       // denormalizado
  zipCode: string;           // CEP
};

// shared/domain/bank-account.ts  (PROMOVIDO a shared — ver 14.3)
export type BankAccount = {
  type: 'CORRENTE' | 'POUPANCA' | null;
  bank: string;              // banco
  branch: string;            // agência
  number: string;            // conta
  holderName: string;        // favorecido
  holderDocument: string;    // CNPJ/CPF do favorecido
};

// domain/models/supplier-fiscal.ts
export type SupplierFiscal = {
  taxRegime: TaxRegime | null;
  ieIndicator: IeIndicator | null;
  isIbsCbsTaxpayer: boolean;        // contribuinte IBS/CBS (Reforma)
  municipalRegistration: string;    // inscrição municipal
  cnae: string;                     // CNAE principal
  suframa: string;                  // SUFRAMA
  optsForSimples: boolean;          // optante Simples Nacional
  isRuralProducer: boolean;
  ruralProducerRegistration: string;
};

// domain/models/supplier.ts
export type Supplier = {
  id: number | null;            // código
  type: SupplierType;           // natureza (genérico/física/jurídica)
  legalName: string;            // razão social / nome
  tradeName: string;            // fantasia / apelido
  document: string;             // CNPJ/CPF (vazio p/ genérico) — só dígitos/alfanum.
  stateRegistration: string;    // IE / RG ("ISENTO" aceito)
  address: PersonAddress;
  phone: string;
  fax: string;
  mobile: string;               // celular
  contactName: string;          // nome do contato
  email: string;                // lowercase
  salesRepName: string;         // representante (contato do fornecedor)
  salesRepPhone: string;
  bankAccount: BankAccount;
  fiscal: SupplierFiscal;
  notes: string;                // observação
  status: SupplierStatus;
};

export function copySupplier(b: Supplier, c: Partial<Supplier>): Supplier { return { ...b, ...c }; }

// Resumo p/ grid e lookup (acesso rápido — ver regra de grid 14.4)
export type SupplierSummary = {
  id: number;
  type: SupplierType;
  legalName: string;
  tradeName: string;
  document: string;
  mobile: string;
  phone: string;
  cityUf: string;       // "São Paulo/SP"
  status: SupplierStatus;
};
```

### 10.3 JSON de retorno (`fromApi`) — resumido

```json
{
  "codigo": 42, "natureza": "JURIDICA", "razaoSocial": "ACME Distribuidora LTDA",
  "fantasia": "ACME", "documento": "12ABC34501DE35", "inscricaoEstadual": "110042490114",
  "endereco": { "logradouro": "Rua das Flores", "numero": "100", "complemento": "Galpão 2",
    "bairro": "Centro", "cidadeId": 3550308, "cidadeNome": "São Paulo", "uf": "SP",
    "paisId": 1, "paisNome": "Brasil", "cep": "01001000" },
  "telefone": "1133334444", "fax": "", "celular": "11999998888",
  "nomeContato": "Maria", "email": "compras@acme.com.br",
  "representante": "João Vendas", "representanteTelefone": "11988887777",
  "banco": { "tipo": "CORRENTE", "banco": "001", "agencia": "1234", "conta": "567890",
    "favorecido": "ACME Distribuidora LTDA", "documentoFavorecido": "12ABC34501DE35" },
  "fiscal": { "regimeTributario": "REGIME_NORMAL", "indicadorIe": "CONTRIBUINTE",
    "contribuinteIbsCbs": true, "inscricaoMunicipal": "", "cnae": "4639701",
    "suframa": "", "optanteSimples": false, "produtorRural": false, "inscricaoProdutor": "" },
  "observacao": "", "situacao": "ATIVO"
}
```

> O exemplo de `documento` usa **CNPJ alfanumérico** (12 posições alfanuméricas + 2 DV) só
> para exercitar a validação nova.

---

## 11. Models Envolvidos

`Supplier`, `SupplierFiscal`, **`PersonAddress`** (shared), **`BankAccount`** (shared),
`SupplierSummary`; enums `SupplierType`, `SupplierStatus`, `TaxRegime`, `IeIndicator`.
Consome `City` (locations) via lookup.

## 12. UseCases

`GetSuppliers` (pesquisa + scroll infinito), `GetSupplierById`, `SaveSupplier`,
`InactivateSupplier`, `DeleteSupplier` (só se nunca referenciado), `GetSupplierTotals`
(dashboard). Lookup de cidade reusa `SearchCities` (locations).

## 13. Repositories / Providers

* `SupplierRepository` → `MockSupplierProvider` (CRUD em memória; cenários: PJ, PF,
  genéricos DAS/DARF/DARE, ativos/inativos, com/sem dados bancários/fiscais).
* Cidade: `CityLookupRepository` do **locations** (sem mock próprio).
* Futuro: `RestSupplierProvider` + consulta de CNPJ/CEP — mesmo contrato.

---

## 14. Extensions, Componentes e **REGRAS GERAIS DE TEMPLATE**

> O usuário pediu explicitamente que vários itens virem **regra geral do template**
> (CNPJ, endereço de pessoa, grid e dashboard). Abaixo, separados.

### 14.1 Extensions a CRIAR/ATUALIZAR (`src/shared/extensions`) — **regra global**

```ts
// cnpj-ext.ts — ATUALIZAR para o CNPJ alfanumérico (IN RFB 2.229/2024)
/**
 * Valida CNPJ numérico (atual) E alfanumérico (novo). 14 posições:
 * 12 primeiras A–Z maiúsculas + dígitos; 2 últimas DV numérico.
 * DV por Módulo 11, convertendo cada caractere por (ASCII - 48):
 * '0'..'9' → 0..9, 'A'..'Z' → 17..42. Aceita com/sem máscara.
 * (Codificar defensivo: aceitar A–Z; ajustar se a RFB restringir letras.)
 */
export function isValidCnpj(value: string): boolean;
export function formatCnpj(value: string): string; // máscara AA.AAA.AAA/AAAA-DV

// state-registration-ext.ts — CRIAR
/** Valida Inscrição Estadual por UF (DV próprio de cada estado) ou "ISENTO". */
export function isValidStateRegistration(ie: string, uf: string): boolean;
```

> Reaproveitar: `isValidCpf`, `isValidEmail`, `isValidCep`, `isCepWithinUf`,
> `isValidPhone`, `isValidMobilePhone`, `onlyDigits`, `toLowerCaseEmail`.
> **Atualizar o CNPJ é regra geral**: todo cadastro com CNPJ no template passa a aceitar o
> formato alfanumérico automaticamente.

### 14.2 Componentes (reuso — DS §8)

* `RecordCodeBadge`, `InitialsAvatar`, `StatusBadge`, `EmptyState`, `FormSkeleton`,
  `SearchField`, `LookupField`/`CityLookupField`, `BaseSelect`, `Switch`, `MaskedField`,
  `DateField`, `FormSection`, `StickyActionBar`, `PageContainer` — **já existem**, não recriar.
* **Sub-abas do formulário** (`FormTabs`): se ainda não existir um componente-base de abas
  internas de formulário, propor em `shared/widgets` (DS) antes de implementar.

### 14.3 **Regra geral — Endereço e Conta Bancária de Pessoa (shared)**

* `PersonAddress` e `BankAccount` são **promovidos a `shared/domain`** (2º consumidor =
  Fornecedor; antes só Funcionário). **Todo cadastro de pessoa** (Funcionário, Fornecedor e,
  no futuro, Cliente/Transportadora/Franquia) usa o **mesmo** model + a **mesma seção de
  formulário** `AddressSection` (com `CityLookupField` do locations) e `BankAccountSection`.
* Consequência: a spec de Funcionário troca seu `EmployeeAddress` por `PersonAddress`
  (a promessa registrada na pendência P5 do Funcionário). Requer **ADR** (seção 18).

### 14.4 **Regra geral — Colunas de grid priorizam acesso rápido**

> Pedido do negócio (regra 9). Vira regra do Design System (§ grids).

* Ao popular **qualquer** grid de pesquisa, priorizar **as colunas que o usuário busca no
  dia a dia**, nesta ordem padrão para cadastros de pessoa:
  **Cód. → Avatar+Nome (fantasia/razão) → Documento (CNPJ/CPF) → Telefone/Celular →
  Cidade/UF → Situação**. Campos de baixo uso ficam só no detalhe, não no grid.
* Para Fornecedor o grid mostra: `Cód.`, `InitialsAvatar`+`tradeName`/`legalName`,
  `document` (mascarado), `mobile`/`phone`, `cityUf`, `StatusBadge`. Genéricos exibem badge
  "Genérico" e ocultam documento/telefone vazios.
* O grid usa **scroll infinito** (lotes de 30), filtro **local no cache**, ordenação e
  empty-state com termo destacado em vermelho + "Limpar pesquisa".

### 14.5 **Regra geral — Dashboard de totalizadores na pesquisa**

> Pedido do negócio (regra 9). Vira regra do Design System (§ página de pesquisa).

* Quando os **filtros da pesquisa forem poucos/simples**, exibir **acima da busca** um
  **dashboard de cards com totalizadores** (contadores), animados (count-up), usando tokens.
* Fornecedor: cards **Total**, **Ativos**, **Inativos**, **Jurídica**, **Física**,
  **Genéricos**. Os contadores vêm de `GetSupplierTotals` (mock agora).
* Se os filtros forem muitos/complexos, **omitir** o dashboard (não competir com a busca).

---

## 15. Layout — Sub-abas, Grupos e Ícones (DS §9.2)

Aba **Cadastro** dividida em sub-abas (a tela é grande). Cabeçalho do formulário:
`RecordCodeBadge` + `StatusBadge` + seletor de **Natureza**.

| Sub-aba | Ícone | Conteúdo |
|---------|-------|----------|
| **Dados Gerais** | `pi-building` | Natureza, Razão/Nome*, Fantasia, CNPJ/CPF*, Insc. Estadual, Situação |
| **Endereço** | `pi-map-marker` | `AddressSection` (Endereço*, Nº*, Complemento, Bairro*, Cidade* lookup, UF* auto, País auto, CEP*) |
| **Contato** | `pi-phone` | Telefone, Fax, Celular, Nome do Contato, E-mail, Representante, Telefone do Representante |
| **Fiscal** | `pi-receipt` | Regime (CRT), Indicador IE, Contribuinte IBS/CBS, Insc. Municipal, CNAE, SUFRAMA, Optante Simples, Produtor Rural — *(reforma; opcional até o módulo fiscal — P6)* |
| **Bancário** | `pi-credit-card` | `BankAccountSection` (Tipo, Banco, Agência, Conta, Favorecido, CNPJ/CPF do Favorecido) |
| **Observações** | `pi-align-left` | Observação (textarea) |

`*` = obrigatório (para natureza identificada). **Barra de ação fixa** (`StickyActionBar`,
dirty-aware): Novo, Modificar, Gravar, Abortar, **Apagar (inativar)**, Sair.

**Pesquisa (aba Buscar):** abre vazia → **dashboard de totalizadores** (14.5) → barra de
busca (termo + filtro de Situação/Natureza) → grid (14.4) por scroll infinito.

---

## 16. Mock Inicial

* `MockSupplierProvider`: ~12 fornecedores — PJ (com CNPJ numérico **e** alfanumérico), PF,
  e genéricos (**DAS, DARF, DARE**), ativos/inativos, com/sem fiscal/bancário. `AsyncResult`,
  latência simulada (padrão `auth`). Estado mutável em memória.
* Totais (`GetSupplierTotals`) calculados sobre o mock.
* Cidade reusa `MockCityProvider` (locations).

---

## 17. Integração Real (futuro)

* `RestSupplierProvider` (mesmo contrato). Consulta de **CNPJ** (autopreenche razão/endereço)
  e de **CEP** (autopreenche endereço) entram como providers próprios, sem mudar camadas
  acima. Validação de IE/contribuinte pode ser reconferida server-side.

---

## 18. Impactos / ADRs

`src/modules/suppliers/**` (novo), **`shared/domain`** (`PersonAddress`, `BankAccount`
promovidos), **`shared/extensions`** (`cnpj-ext` atualizado, `state-registration-ext` novo),
**`shared/widgets`** (`AddressSection`, `BankAccountSection`, possivelmente `FormTabs`),
**`docs/design-system`** (regras 14.4 e 14.5), `router` (`/fornecedores` + permissão
ADR-006), `modules/home` (item de menu Comercial → Fornecedores), e **`modules/employees`**
(trocar `EmployeeAddress` por `PersonAddress`).

**Permissão (ADR-006):** recurso `FORNECEDOR` com ações `open/search/create/update/delete/
print/report/chart`.

**ADRs propostos** (próximos livres a partir do ADR-008):
* **ADR-009 — CNPJ alfanumérico no template** (IN RFB 2.229/2024): validação aceita ambos
  os formatos; regra global para todo CNPJ do sistema.
* **ADR-010 — Endereço e Conta Bancária de pessoa como models compartilhados** (`shared`),
  com `AddressSection`/`BankAccountSection` reutilizados por todos os cadastros de pessoa.
* **ADR-011 (ou regra no DS) — Padrões de pesquisa:** colunas de grid por relevância de uso
  + dashboard de totalizadores acima da busca.

---

## 19. Decisões de Negócio (validadas)

> Respostas validadas por Glenio — travadas nesta spec.

| # | Decisão |
|---|---------|
| D1 | **Complemento:** **opcional** (não obrigatório). |
| D2 | **Genérico:** sem categoria adicional; **documento sempre vazio**. Só Razão + Situação. |
| D3 | **Representante (print):** **texto livre** (`salesRepName`/`salesRepPhone`); não aponta para o cadastro de Representantes. |
| D4 | **Insc. Estadual:** **opcional** — aceita "ISENTO" ou vazio; **se houver valor, validar** por UF (PJ). PF usa RG (sem checksum). |
| D5 | **Letras do CNPJ:** seguir com **A–Z** (defensivo) agora; ajustar quando a RFB publicar a lista restrita. |
| D6 | **Campos fiscais:** **opcionais até o módulo fiscal existir**; estrutura criada agora, obrigatoriedade ligada quando a apuração CBS/IBS entrar. |
| D7 | **Unicidade CNPJ/CPF:** **tratada pelo backend** (autoridade); a UI apenas exibe o erro retornado. |
| D8 | **Relatório/Gráfico:** **depois** — abas placeholder "em breve" nesta fase. |

---

## 20. Checklist antes de implementar (template)

- [ ] Especificação aprovada; decisões da seção 19 aplicadas no código.
- [ ] Contrato JSON confirmado (seção 10).
- [ ] `cnpj-ext` atualizado (numérico + alfanumérico) com testes; `state-registration-ext`.
- [ ] `PersonAddress`/`BankAccount` em `shared/domain` + `AddressSection`/`BankAccountSection`.
- [ ] Funcionário migrado para `PersonAddress` sem quebrar a tela.
- [ ] Regras de grid (14.4) e dashboard de totais (14.5) registradas no Design System.
- [ ] Módulo `suppliers` completo (domain/data/presentation) em mock-first (inclui genéricos).
- [ ] Pesquisa com avatar, situação, scroll infinito, filtro local, dashboard de totais.
- [ ] Rota `/fornecedores` + permissão (ADR-006) + item de menu.
- [ ] ADRs 009/010 (e regra DS) registrados.
- [ ] Base de Conhecimento atualizada.
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` sem erros.

---

## 21. Base de Conhecimento

Documentar: o que é o Fornecedor e o que ele alimenta (Contas a Pagar, Compras, NF-e);
natureza (genérico × física × jurídica) e quando usar genérico (DAS/DARF/DARE); campos e
obrigatoriedade; validações (CNPJ alfanumérico novo, CPF, IE, CEP, celular, e-mail);
endereço padrão de pessoa (locations); dados fiscais da Reforma; situação e **inativação**;
pesquisa (avatar, totais, scroll infinito); rota e permissões.

---

## 22. Relação com outros documentos

* Herda `../template/CLAUDE.md`, `docs/architecture/README.md`,
  `docs/design-system/README.md`, `docs/specifications/README.md`.
* Reusa o módulo `locations` (Cidade/UF/País) e o padrão de endereço do Funcionário.
* **Altera** `docs/specifications/employees/employee-registration.md` (PersonAddress).
* Usa `AsyncResult`/`AppError`, `BaseCrudStore` (**ADR-004**), seleção (**ADR-003**),
  scroll infinito (**ADR-002**), permissões (**ADR-006**), inativação soft (cash-operator).
* Introduz **ADR-009** (CNPJ alfanumérico) e **ADR-010** (endereço/banco compartilhados).