# Especificação — Cadastro de Funcionário

> **Local sugerido no repositório:** `docs/specifications/employees/employee-registration.md`
> **Módulo:** `src/modules/employees`
> **Grupo no menu:** Pessoal → Funcionário (ver `docs/app/navigation.md`)
> **Status:** **Implementado v1 — mock-first** (Buscar + Cadastro). Pendências de
> negócio resolvidas na seção 20; desvios de implementação registrados ali também.
> **Autoria da regra de negócio:** Glenio / Noturno Softwares — esta IA apenas formaliza.

Esta especificação segue a estrutura obrigatória de `docs/specifications/README.md` e
herda integralmente o template corporativo (camadas `domain/data/presentation`, fluxo
`Page → Store → UseCase → Repository → Provider`, mock-first, `AsyncResult<T>`, models em
inglês com mappers na camada `data`) e o Design System (`docs/design-system/README.md`).

---

## 1. Nome

Cadastro de Funcionário (Employee Registration).

---

## 2. Objetivo

Permitir o cadastro, consulta, edição e exclusão de funcionários da empresa, com
validação rigorosa dos dados pessoais, de endereço, de contato, contratuais e bancários.

Este módulo é a **migração** de uma tela legada equivalente (prints anexados). A migração
preserva o conjunto de campos, mas reorganiza a tela conforme o Design System Noturno
(dark-first, agrupamento por contexto, componentes-base) e adiciona validações que a tela
antiga não possuía.

---

## 3. Contexto

* Faz parte do grupo **Pessoal** do EspaçoN.
* Hoje existe a tela legada (Buscar / Cadastro / Relatório / Gráfico). A migração entrega,
  na primeira fase, **Buscar** (pesquisa) e **Cadastro** (formulário). **Relatório** e
  **Gráfico** entram como abas placeholder ("em breve"), preparadas para evolução.
* Vários campos são **lookups** porque dependem de módulos que ainda serão criados:
  * **Cidade** → futuro Cadastro de Cidades (retorna a UF junto).
  * **Endereço** → futura localização em mapas (NoturnoMAPS).
  * **CEP** → futura consulta automática de endereço por CEP.
  * **Representante** → vínculo com o cadastro de representantes.
* Por mock-first, todos os lookups nascem com `Mock*Provider` e contrato JSON definido aqui;
  a troca por API real não altera Store, UseCase nem widgets.

---

## 4. Regras de Negócio

### 4.1 Campos obrigatórios

Nome, Apelido, CPF, RG, Nome da Mãe, Naturalidade, UF da naturalidade, Endereço, Número,
Bairro, Cidade, UF do endereço, CEP, Fone Empresa, Fone Pessoal, E-mail, Salário, Situação,
e **todos** os Dados Bancários (Tipo de conta, Agência, Número da conta, Banco).

### 4.2 Campos não-obrigatórios (conforme print)

Nome do Pai, Nascimento, Cônjuge, Complemento, Admissão, Demissão, Comissão,
"É representante?", Representante, Grupo.

### 4.3 Validações

| # | Campo | Regra | Origem (extension) |
|---|-------|-------|--------------------|
| R1 | CPF | Deve ser um CPF **válido** (dígitos verificadores + rejeita sequência repetida). | `isValidCpf` (existe) |
| R2 | Nome | Deve ser **nome composto válido**: ≥ 2 palavras, cada palavra ≥ 2 letras, apenas letras/acentos/`'`/`-`/espaço, sem dígitos, sem repetição absurda, rejeita entradas inválidas óbvias. | `isValidFullName` (**criar** — seção 10) |
| R3 | Nome da Mãe | Mesmas regras de R2. | `isValidFullName` (**criar**) |
| R4 | Cidade | Campo de **pesquisa** (type-to-search), nunca digitação livre. Selecionar uma cidade preenche a UF do endereço. | `CityLookupField` (**criar**) |
| R5 | UF (endereço) | **Somente leitura**: vem automaticamente da cidade selecionada (R4). | — |
| R6 | Endereço | Campo de **pesquisa** preparado para geolocalização futura (NoturnoMAPS). Por ora, texto livre estruturado como lookup. | `AddressLookupField` (**criar**, modo texto) |
| R7 | CEP | Deve ser CEP **válido** (8 dígitos) **e coerente com a UF** do endereço (faixa dos Correios). Campo também é de **pesquisa** (consulta futura de endereço por CEP). | `isValidCep` (existe) + `isCepWithinUf` (**criar**) |
| R8 | Fone Pessoal | Validar o máximo possível para aceitar **apenas celular**: 11 dígitos, DDD válido (11–99) e 9º dígito (após DDD) = `9`. | `isValidMobilePhone` (**criar**) |
| R9 | Fone Empresa | Telefone brasileiro válido (fixo ou celular, 10 ou 11 dígitos). | `isValidPhone` (existe) |
| R10 | E-mail | Formato de e-mail válido; **gravado sempre em minúsculas** (no `set` e no `fromJson`, inclusive vindo do backend). | `isValidEmail` (existe) + `normalizeEmail` (existe) |
| R11 | Admissão | **Não** pode ser maior que a data atual. | `isNotFutureDate` (**criar**) |
| R12 | Nascimento | Quando informado, a pessoa deve ter **≥ 18 anos** na data atual. | `isAdult` (**criar**) |
| R13 | Salário | Numérico, ≥ 0, formatação monetária pt-BR. | `MoneyField` + `formatCurrency` (existem) |
| R14 | Comissão | Numérico, ≥ 0; default `0,00`. | `MoneyField` |
| R15 | Situação | Um dos valores do enum `EmployeeStatus` (ATIVO / DEMITIDO / AFASTADO). | combobox (lista estática) |
| R16 | Tipo de conta | Um dos valores do enum `BankAccountType` (CORRENTE / POUPANCA). | combobox (lista estática) |
| R17 | É representante? | Quando marcado, o campo **Representante** torna-se relevante (busca). | `SearchLookupField` + `searchRepresentatives` |
| R18 | UF da Naturalidade | Campo de **pesquisa** (type-to-search) sobre os estados/UF — grava a sigla, exibe "UF — Estado". Vira do Cadastro de Estados no futuro. | `SearchLookupField` + `searchStates` (lista `BRAZILIAN_STATES`) |

> **Combobox × Busca (Design System §8.1/§9.2):** Situação e Tipo de conta são listas **pequenas
> e estáticas** → combobox. Cidade, **UF/Estado** (endereço e naturalidade), Endereço, CEP e
> Representante são **dados de backend** → **busca inline** (`SearchLookupField`), nunca `select`
> gigante nem digitação livre. Regra geral do produto: referência de backend nasce como busca.

### 4.4 Indicador de código

* Todo registro possui **Código** (`id`). Quando novo, exibir badge neutro **"Novo"**;
  quando existente, exibir um indicador de destaque com o código (ex.: `Cód. 00042`).
* O indicador segue os padrões visuais anteriores (badge/pílula com tokens; dourado para a
  identidade, ver §11). É proposto como **componente reutilizável** `RecordCodeBadge` em
  `shared/widgets`, para servir a todos os cadastros do ERP.

### 4.5 Situação e ciclo de vida

* Situações: **ATIVO**, **FÉRIAS**, **ATESTADO**, **LICENÇA MATERNIDADE**, **LICENÇA
  PATERNIDADE**, **AVISO PRÉVIO**, **AFASTADO**, **AFASTADO (INSS)**, **DEMITIDO**.
* Mapeamento de cor (Design System §2.3 / §10.9), via `StatusBadge`:
  * **ATIVO** → `feedback-success`
  * **FÉRIAS / LICENÇA MATERNIDADE / LICENÇA PATERNIDADE** → `feedback-info`
  * **ATESTADO / AVISO PRÉVIO / AFASTADO / AFASTADO (INSS)** → `feedback-warning`
  * **DEMITIDO** → `feedback-danger`
* A situação é exibida no cabeçalho do formulário via `StatusBadge` (cor + ícone + rótulo).
* **Demissão** (data) só faz sentido quando a situação é DEMITIDO — ver pendência P3.

---

## 5. Fluxo

### 5.1 CRUD (assíncrono, mock-first)

```txt
Page (EmployeesPage)
→ EmployeesStore (BaseCrudStore)
→ UseCase (Get/Save/Delete)
→ EmployeeRepository
→ MockEmployeeProvider
→ AsyncResult<T>
```

### 5.2 Pesquisa (aba Buscar)

1. A tela **abre vazia** (Design System §9.1) com empty-state (ícone `pi-id-card`/`pi-users`
   com pulse + copy convidando à busca).
2. Usuário filtra por nome/apelido/CPF/situação e dispara por **Enter ou botão** (sem busca
   incremental no backend).
3. Resultado em `BaseDataTable` dentro de card, com paginação. Sem ações inline no grid.
4. Clique na linha → abre o registro na aba **Cadastro** (modo edição).

### 5.3 Cadastro (aba Cadastro)

1. **Novo** → formulário limpo, foco no primeiro campo (Nome), badge "Novo".
2. **Gravar** → valida todas as regras da seção 4; havendo erros, exibe **resumo de
   validação** no topo e marca os campos; sem erros, persiste via UseCase e dispara toast
   "Funcionário salvo." (canto superior esquerdo).
3. **Abortar** → descarta alterações (guarda de navegação se houver alterações não salvas).
4. **Apagar** → confirmação destrutiva (`BaseDialog` danger) antes de excluir; toast pós-ação.
5. Lookup de Cidade preenche UF automaticamente; lookup de CEP/Endereço preparados para
   consulta futura.

### 5.4 Lookup de cidade

```txt
CityLookupField (digita ≥ 2 letras)
→ SearchCities UseCase
→ CityLookupRepository
→ MockCityProvider
→ AsyncResult<City[]>  → usuário seleciona → preenche cityId, cityName e uf
```

---

## 6. Entradas

* **Identificação:** nome, apelido, CPF, RG, nascimento.
* **Filiação/Naturalidade:** nome do pai, nome da mãe, cônjuge, naturalidade, UF natural.
* **Endereço:** endereço (lookup), número, complemento, bairro, cidade (lookup), UF, CEP.
* **Contato:** fone empresa, fone pessoal (celular), e-mail.
* **Contrato:** admissão, demissão, salário, comissão, situação.
* **Representação:** é representante?, representante (lookup), grupo.
* **Bancário:** tipo de conta, banco, agência, número da conta.
* **Pesquisa:** termo (nome/apelido/CPF), filtro de situação, paginação/ordenação.

---

## 7. Saídas

* Funcionário persistido (com `id`/código atribuído na criação).
* Lista paginada de funcionários (pesquisa) com filtro/ordenação.
* Resultado de cada operação encapsulado em `AsyncResult<T>` (sucesso → `data`; falha →
  `AppError` com mensagem amigável para a presentation).

---

## 8. Casos de Erro

| Código | Situação | Tratamento |
|--------|----------|-----------|
| `VALIDATION_NAME` | Nome/Mãe inválido (não composto, com dígito, etc.) | Erro no campo + resumo no topo |
| `VALIDATION_CPF` | CPF inválido | Erro no campo |
| `VALIDATION_CEP_UF` | CEP fora da faixa da UF selecionada | Erro no campo CEP |
| `VALIDATION_MOBILE` | Fone pessoal não é celular válido | Erro no campo |
| `VALIDATION_EMAIL` | E-mail com formato inválido | Erro no campo |
| `VALIDATION_ADMISSION_FUTURE` | Admissão maior que hoje | Erro no campo |
| `VALIDATION_AGE` | Nascimento indica menor de 18 anos | Erro no campo |
| `VALIDATION_REQUIRED` | Campo obrigatório vazio | Erro no campo + resumo |
| `CONFLICT_CPF` | CPF já cadastrado para outro funcionário | Toast/erro de conflito |
| `NOT_FOUND` | Registro não encontrado ao abrir/editar | Toast + volta à pesquisa |
| `NETWORK` | Falha de comunicação (fase real) | `AppError` genérico, toast |

Todos os erros trafegam por `AsyncResult`/`AppError`; a presentation **nunca** trata
exception crua (regra do template).

---

## 9. Contratos

> **Frontend lidera.** Os models abaixo (em inglês) são a fonte da verdade. O backend será
> feito sob medida e a conversão fica em `data/providers`/mappers (`fromApi`/`toApi`).

### 9.1 Enums

```ts
// domain/enums/employee-status.ts
export enum EmployeeStatus {
  Active = 'ATIVO',
  Vacation = 'FERIAS',
  MedicalLeave = 'ATESTADO',
  MaternityLeave = 'LICENCA_MATERNIDADE',
  PaternityLeave = 'LICENCA_PATERNIDADE',
  Notice = 'AVISO',              // aviso prévio
  OnLeave = 'AFASTADO',
  InssLeave = 'AFASTADO_INSS',
  Dismissed = 'DEMITIDO',
}

// domain/enums/bank-account-type.ts
export enum BankAccountType {
  Checking = 'CORRENTE',
  Savings = 'POUPANCA',
}
```

### 9.2 Models

```ts
// domain/models/bank-account.ts
export type BankAccount = {
  type: BankAccountType | null;  // tipo de conta
  bank: string;                  // banco
  branch: string;                // agência
  number: string;                // número da conta
};

// domain/models/employee-address.ts
// NOTA: candidato a shared (reuso por Cliente, Fornecedor, etc.) — ver pendência P5.
export type EmployeeAddress = {
  street: string;        // endereço (lookup)
  number: string;        // número
  complement: string;    // complemento
  district: string;      // bairro
  cityId: number | null; // cidade (lookup) — id do futuro cadastro de cidades
  cityName: string;      // nome exibido da cidade
  uf: string;            // UF derivada da cidade
  zipCode: string;       // CEP
  // Futuro (NoturnoMAPS): latitude?: number; longitude?: number;
};

// domain/models/employee.ts
export type Employee = {
  id: number | null;             // código (null quando novo)
  name: string;                  // nome
  nickname: string;              // apelido
  cpf: string;                   // CPF (armazenar só dígitos; formatar na UI)
  rg: string;                    // RG
  birthDate: string | null;      // nascimento (ISO 8601)
  fatherName: string;            // nome do pai
  motherName: string;            // nome da mãe
  spouseName: string;            // cônjuge
  birthplace: string;            // naturalidade
  birthplaceUf: string;          // UF da naturalidade
  address: EmployeeAddress;
  companyPhone: string;          // fone empresa (dígitos)
  personalPhone: string;         // fone pessoal / celular (dígitos)
  email: string;
  admissionDate: string | null;  // admissão (ISO 8601)
  dismissalDate: string | null;  // demissão (ISO 8601)
  salary: number;                // salário
  commission: number;            // comissão
  status: EmployeeStatus;        // situação
  isRepresentative: boolean;     // é representante?
  representativeId: number | null; // representante (lookup)
  representativeName: string;
  groupId: number | null;        // grupo
  bankAccount: BankAccount;
};

// copyWith (padrão do template — models imutáveis)
export function copyEmployee(base: Employee, changes: Partial<Employee>): Employee {
  return { ...base, ...changes };
}
```

### 9.3 JSON de entrada (envio ao backend — `toApi`)

```json
{
  "codigo": 0,
  "nome": "João da Silva Souza",
  "apelido": "João",
  "cpf": "12345678909",
  "rg": "1234567",
  "nascimento": "1990-05-12",
  "nomePai": "José Souza",
  "nomeMae": "Maria da Silva",
  "conjuge": "",
  "naturalidade": "São Paulo",
  "ufNaturalidade": "SP",
  "endereco": "Rua das Flores",
  "numero": "100",
  "complemento": "Apto 21",
  "bairro": "Centro",
  "cidadeId": 3550308,
  "uf": "SP",
  "cep": "01001000",
  "foneEmpresa": "1133334444",
  "fonePessoal": "11999998888",
  "email": "joao@empresa.com",
  "admissao": "2024-01-10",
  "demissao": null,
  "salario": 3500.00,
  "comissao": 0.00,
  "situacao": "ATIVO",
  "representante": false,
  "representanteId": null,
  "grupoId": null,
  "contaTipo": "CORRENTE",
  "banco": "001",
  "agencia": "1234",
  "conta": "567890"
}
```

### 9.4 JSON de saída (retorno do backend — `fromApi`)

```json
{
  "codigo": 42,
  "nome": "João da Silva Souza",
  "apelido": "João",
  "cpf": "12345678909",
  "rg": "1234567",
  "nascimento": "1990-05-12",
  "nomePai": "José Souza",
  "nomeMae": "Maria da Silva",
  "conjuge": "",
  "naturalidade": "São Paulo",
  "ufNaturalidade": "SP",
  "endereco": "Rua das Flores",
  "numero": "100",
  "complemento": "Apto 21",
  "bairro": "Centro",
  "cidadeId": 3550308,
  "cidadeNome": "São Paulo",
  "uf": "SP",
  "cep": "01001000",
  "foneEmpresa": "1133334444",
  "fonePessoal": "11999998888",
  "email": "joao@empresa.com",
  "admissao": "2024-01-10",
  "demissao": null,
  "salario": 3500.00,
  "comissao": 0.00,
  "situacao": "ATIVO",
  "representante": false,
  "representanteId": null,
  "representanteNome": "",
  "grupoId": null,
  "contaTipo": "CORRENTE",
  "banco": "001",
  "agencia": "1234",
  "conta": "567890"
}
```

> A conversão pt-BR ⇄ inglês ocorre **exclusivamente** no mapper em `data` (ex.:
> `employee-mapper.ts`). Nenhuma camada acima de `data` conhece os nomes em português.

---

## 10. Models Envolvidos

* `Employee` (model raiz)
* `EmployeeAddress`
* `BankAccount`
* `City` (lookup) — `{ id: number; name: string; uf: string }`
* `RepresentativeSummary` (lookup) — `{ id: number; name: string }`
* Enums: `EmployeeStatus`, `BankAccountType`

---

## 11. UseCases

* `GetEmployees` — pesquisa paginada/filtrada (aba Buscar).
* `GetEmployeeById` — carregar registro para edição.
* `SaveEmployee` — criar/atualizar (decide pelo `id`).
* `DeleteEmployee` — excluir com confirmação na presentation.
* `SearchCities` — busca de cidade (retorna `City[]`, inclui UF).
* `SearchRepresentatives` — busca de representante.
* `SearchStates` — busca de estado/UF (retorna `BrazilianState[]`; lista `BRAZILIAN_STATES`
  compartilhada, até o Cadastro de Estados existir).
* `LookupAddressByZip` *(placeholder/futuro)* — consulta de endereço por CEP.

---

## 12. Repositories

* `EmployeeRepository` (contrato em `domain/repositories`) → implementado em
  `data/repositories/employee-repository.ts`.
* `CityLookupRepository` → `MockCityProvider`.
* `RepresentativeLookupRepository` → `MockRepresentativeProvider`.
* `StateLookupRepository` → `MockStateProvider` (sobre `BRAZILIAN_STATES`, em `shared/models`).

---

## 13. Providers

* `MockEmployeeProvider` — CRUD em memória, com cenários realistas (ativos, afastados,
  demitidos; com e sem representante). Latência simulada como no padrão do `auth`.
* `MockCityProvider` — lista enxuta de cidades com UF (ex.: capitais) até o Cadastro de
  Cidades existir.
* `MockRepresentativeProvider` — alguns representantes fictícios.
* `MockStateProvider` — busca sobre `BRAZILIAN_STATES` (27 UFs) compartilhada.
* **Futuro (REST):** `RestEmployeeProvider`, `RestCityProvider`, `RestStateProvider`,
  `RestCepProvider` com o mesmo contrato — sem impacto em repository/usecase/store/widgets.

---

## 14. Extensions e Componentes a CRIAR

> Regra do template: antes de criar campo/validação, verificar reuso. Os itens abaixo são
> reutilizáveis por outros cadastros → ficam em `shared`.

### 14.1 Extensions (`src/shared/extensions`)

```ts
// name-ext.ts
/** Valida nome composto: ≥2 palavras, cada ≥2 letras, sem dígitos/símbolos inválidos. */
export function isValidFullName(value: string): boolean;

// phone-ext.ts (adicionar)
/** Celular BR: 11 dígitos, DDD 11–99, 9º dígito após DDD = 9. */
export function isValidMobilePhone(value: string): boolean;

// cep-ext.ts (adicionar)
/** CEP coerente com a UF (faixa oficial dos Correios). */
export function isCepWithinUf(cep: string, uf: string): boolean;

// date-ext.ts (criar ou estender helpers de data já existentes)
/** Verdadeiro se a data não for futura (≤ hoje). */
export function isNotFutureDate(isoDate: string): boolean;
/** Verdadeiro se a pessoa tiver ≥ minYears (default 18) na data atual. */
export function isAdult(isoBirthDate: string, minYears?: number): boolean;
```

> **Reaproveitar** o que já existe: `isValidCpf`, `isValidEmail`, `isValidCep`,
> `isValidPhone`, `formatPhone`, `formatCep`, `formatCpf`, `onlyDigits`, `toNumber`,
> `formatCurrency`/`formatDate` (helpers pt-BR). **Não** recodificar máscaras por tela.

### 14.2 Widgets compartilhados (`src/shared/widgets`)

* `RecordCodeBadge` — indicador de código reutilizável (badge "Novo" / `Cód. NNNNN`).
* `SearchLookupField` *(genérico, já existe)* — type-to-search reaproveitado por **Cidade**,
  **UF/Estado** e **Representante** (passa `searchFn`/`optionLabel`). Substitui os
  `*LookupField` específicos antes previstos — um único widget de busca para todos.
* `MaskedField`/`DateField` — máscara e data (ver §20.2).
* `InitialsAvatar` — avatar de iniciais para pessoas.

> Já existem e devem ser reutilizados: `CpfField`, `CepField`, `PhoneField`, `MoneyField`,
> `DateField`, `SearchField`, `BaseField`, `BaseButton`, `StatusBadge`, `BaseDialog`,
> `BaseToast`, `BaseDataTable`, `BasePagination`.

### 14.3 Widgets do módulo (`src/modules/employees/presentation/widgets`)

* `EmployeeFormHeader` — `RecordCodeBadge` + `StatusBadge` (situação) + ações.
* Seções do formulário (uma por grupo da seção 15).
* `EmployeeSearchPanel` — filtros + grid + empty-state.
* `EmployeeReportTab` / `EmployeeChartTab` — placeholders "em breve".

---

## 15. Layout — Grupos de Dados e Ícones (Design System §9.2)

Formulário **agrupado por contexto**, no máximo 2–3 campos por linha no desktop; campos
longos ocupam a linha inteira. Cada grupo é um bloco/card com título `text-h3` e ícone
PrimeIcons. O **indicador de código** e o **StatusBadge** ficam no cabeçalho do formulário.

| Grupo | Ícone | Campos |
|-------|-------|--------|
| **Cabeçalho** | `pi-id-card` | Indicador de Código (`RecordCodeBadge`) + Situação (`StatusBadge`) |
| **1. Identificação** | `pi-user` | Nome*, Apelido*, CPF*, RG*, Nascimento |
| **2. Filiação & Naturalidade** | `pi-users` | Nome do Pai, Nome da Mãe*, Cônjuge, Naturalidade*, UF da Naturalidade* |
| **3. Endereço** | `pi-map-marker` | Endereço* (lookup), Número*, Complemento, Bairro*, Cidade* (lookup), UF* (auto), CEP* (lookup) |
| **4. Contato** | `pi-phone` | Fone Empresa*, Fone Pessoal* (celular), E-mail* |
| **5. Contrato** | `pi-briefcase` | Admissão, Demissão, Salário*, Comissão, Situação* |
| **6. Representação** | `pi-share-alt` | É representante? (toggle), Representante (lookup), Grupo |
| **7. Dados Bancários** | `pi-credit-card` | Tipo de conta*, Banco*, Agência*, Número da conta* |

`*` = obrigatório.

**Barra de ação fixa** (Design System §10.10) com: Novo, Modificar, Gravar, Abortar,
Apagar, Sair — sempre visíveis, com **resumo de validação** no topo ao gravar com erros, e
**guarda de navegação** ao sair em modo inclusão/edição com alterações não salvas.

**Operação keyboard-first** (§10.1): Enter confirma/dispara busca; Esc fecha diálogo;
foco automático no primeiro campo ao iniciar Novo.

---

## 16. Mock Inicial

* `MockEmployeeProvider`: ~10 funcionários cobrindo todas as situações (ATIVO/AFASTADO/
  DEMITIDO), com e sem representante, contas CORRENTE e POUPANCA. Tudo em `AsyncResult`,
  latência simulada (~500–600 ms, padrão do `auth`).
* `MockCityProvider`: capitais brasileiras com UF (suficiente para o lookup até o Cadastro
  de Cidades existir).
* `MockRepresentativeProvider`: 3–4 representantes fictícios.
* CRUD totalmente operável só com mock (criar, listar, editar, excluir).

---

## 17. Integração Real (futuro)

* Backend sob medida casando com o contrato JSON da seção 9. Conversão concentrada em
  `data/providers`/mappers.
* Substituir `Mock*Provider` por `Rest*Provider` (mesmo contrato → zero impacto acima de
  `data`).
* CEP: integrar consulta real (preencher endereço/bairro/cidade/UF a partir do CEP).
* Endereço: integrar geolocalização (NoturnoMAPS) gravando lat/long.
* Cidade: trocar mock pelo Cadastro de Cidades.

---

## 18. Impactos

`domain/models`, `domain/enums`, `domain/repositories`, `data/application`,
`data/repositories`, `data/providers`, `data/mocks`, `presentation/pages`,
`presentation/stores`, `presentation/widgets`, **`shared/extensions`** (novas validações),
**`shared/widgets`** (`RecordCodeBadge`, lookups), `router` (nova rota + guard de permissão
ADR-006) e `modules/home` (ativar o item "Funcionário" na sidebar — hoje inerte).

**Permissão (ADR-006):** recurso `FUNCIONARIO` com ações `open/search/create/update/delete/
print/report/chart`.

**Possível ADR novo:** "Padrão de lookup type-to-search para dados de backend" e/ou
"`EmployeeAddress` como model de endereço compartilhável" (ver P5).

---

## 19. Base de Conhecimento

Documentar no menu Ajuda → Base de Conhecimento: o que é o Cadastro de Funcionário; onde
acessar (Pessoal → Funcionário, rota); campos e obrigatoriedade; regras de validação (CPF,
nome composto, celular, CEP×UF, idade ≥18, admissão não-futura); como funcionam os lookups
de Cidade/Endereço/CEP/Representante; situação e seu ciclo de vida; permissões da tela.

---

## 20. Pendências — **resolvidas** (decisões de Glenio) + desvios de implementação

### 20.1 Decisões de negócio (confirmadas)

* ✅ **P1 — Número do endereço:** criado o campo **Número** (obrigatório), ao lado de Endereço.
* ✅ **P2 — RG:** obrigatório, **sem checksum**, formatação livre (sem regra de UF).
* ✅ **P3 — Demissão:** **obrigatória quando Situação = DEMITIDO** e **limpa** nas demais
  situações (o campo só aparece quando DEMITIDO; trocar a situação zera a data).
* ✅ **P4 — Nascimento:** **opcional**; quando informado, valida **≥ 18 anos** (`isAdult`).
* ✅ **P5 — Endereço compartilhado:** criado como **`Address` em `shared/models`** (reuso por
  Cliente/Fornecedor/Imóvel). O VO antes chamado `EmployeeAddress` é o `Address` compartilhado.
* ✅ **P6 — Unicidade:** **CPF único** (erro de conflito no save); **apelido não** é único.
* ✅ **P7 — Comissão:** **percentual (%)**, 0–100 (campo numérico com hint "%").
* ✅ **P8 — Grupo:** **texto livre** nesta fase (vira lookup quando o Cadastro de Grupos existir).
* ✅ **P9 — Relatório/Gráfico:** **fora desta fase** (sem abas placeholder — ver desvios).

### 20.2 Desvios de implementação (vs. a redação original da spec)

* **Telas como rotas, não abas.** Seguindo o padrão dos demais módulos
  (usuários/perfis/operadores), o módulo é **lista** (`/funcionarios`) + **formulário**
  (`/funcionarios/novo`, `/funcionarios/:id`), e **não** um container de abas
  Buscar/Cadastro/Relatório/Gráfico. Relatório e Gráfico entram numa fase futura.
* **Widgets de campo criados em `shared/widgets`** (o projeto não os tinha):
  * **`MaskedField`** (PrimeVue `InputMask`, `unmask`→dígitos): **CPF** `999.999.999-99`,
    **CEP** `99999-999`, **celular** `(99) 99999-9999`. Variante **`searchable`** com
    gatilho de busca para consulta futura.
  * **`DateField`** (PrimeVue `DatePicker`): **calendário + digitação** `dd/mm/aaaa`
    (resolve a dor do `<input type=date>` nativo); `v-model` em ISO; **ícone do calendário
    à direita, centralizado**. Usado em Nascimento/Admissão/Demissão.
* **Campos de backend nascem como busca inline** (regra do produto — DS §8.1): **Cidade**,
  **UF da Naturalidade** (estados/UF) e **Representante** usam **`SearchLookupField`**
  (type-to-search com cara de busca: lupa + "Pesquisar…", lista só ao digitar). É o
  **padrão**, mesmo depois que esses cadastros existirem — não migram para tela secundária.
  **Endereço** (`MaskedField searchable`, futuro NoturnoMAPS) e **CEP**
  (`MaskedField` com máscara **e** `searchable`, futura consulta por CEP) já têm o gatilho
  de busca, hoje informando "em breve". **Fone Empresa** segue `BaseTextField` (fixo OU
  celular, 10/11 dígitos — máscara única seria ambígua).
* **Barra de ação dirty-aware** (Design System §10.10): Salvar/Cancelar aparecem só com
  alteração; Excluir no cabeçalho; "Sair" é o voltar. Substitui a barra fixa com
  Novo/Modificar/Gravar/Abortar/Apagar/Sair sempre visíveis da redação original.
* **Toast** no canto **superior direito** (DS §8.8), não superior esquerdo.
* **`RecordCodeBadge`** criado em `shared/widgets` (badge "Novo" / `Cód. 00042`).
* **Testes:** o projeto usa **npm** e **não tem script `test`** — validação por
  `npm run type-check` + `npm run lint` (o item de teste do checklist §21 não se aplica).

---

## 21. Checklist antes de implementar (template)

- [ ] Especificação aprovada (este documento) e pendências da seção 20 resolvidas.
- [ ] Contrato JSON confirmado (seção 9).
- [ ] Reuso verificado: `shared/extensions`, `shared/widgets`, `BaseCrudStore`.
- [ ] Novas extensions criadas com testes (`isValidFullName`, `isValidMobilePhone`,
      `isCepWithinUf`, `isNotFutureDate`, `isAdult`).
- [ ] `RecordCodeBadge` e lookups criados em `shared/widgets`.
- [ ] Mock-first operável (CRUD + lookups) antes de qualquer integração.
- [ ] Tela em conformidade com o checklist do Design System §14.
- [ ] Rota + permissão (ADR-006) e ativação do item na sidebar.
- [ ] Base de Conhecimento atualizada (seção 19).
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` sem erros.

---

## 22. Relação com outros documentos

* Herda `../template/CLAUDE.md`, `docs/architecture/README.md`, `docs/design-system/README.md`,
  `docs/decisions/README.md`, `docs/specifications/README.md`.
* Usa `AsyncResult`/`AppError` e `BaseCrudStore` (**ADR-004**); permissões (**ADR-006**);
  stack (**ADR-002**).
* Consome `docs/app/navigation.md` (grupo Pessoal → Funcionário).
