# Especificação — Cadastros de País, Estado e Cidade (módulo Locations)

> **Local sugerido no repositório:** `docs/specifications/locations/location-registry.md`
> **Módulo:** `src/modules/locations`
> **Grupo no menu:** Sistema → Localização (País / Estado / Cidade) — **confirmado (P1)**
> **Status:** Aceito — decisões de negócio registradas na seção 22.
> **Autoria da regra de negócio:** Glenio / Noturno Softwares — esta IA apenas formaliza.

Segue a estrutura obrigatória de `docs/specifications/README.md` e herda o template
corporativo (camadas `domain/data/presentation`, fluxo `Page → Store → UseCase →
Repository → Provider`, mock-first, `AsyncResult<T>`, models em inglês com mappers em
`data`, imutabilidade/`copyWith`) e o Design System (`docs/design-system/README.md`).

---

## 1. Nome

Cadastros de Localização — País (Country), Estado (State/UF) e Cidade (City/Município).

---

## 2. Objetivo

Centralizar a **fonte única da verdade** de país, estado e cidade no sistema. A partir
da implementação deste módulo, **qualquer cadastro** que mencione país, estado ou cidade
(Funcionário, Cliente, Fornecedor, Imóvel, etc.) **consome destes cadastros** via lookup —
nunca digita texto livre nem mantém sua própria lista.

Além de localização, cada cadastro nasce **preparado para os módulos fiscais** (NF-e/NFC-e
e Reforma Tributária — CBS/IBS/IS), carregando os códigos e alíquotas que esses módulos
exigirão. Os campos fiscais são criados agora (estrutura), mesmo que ainda não usados.

---

## 3. Contexto

* Hoje não existe módulo de geografia; há apenas um mapa placeholder
  (`shared/widgets/brazil-points-map.vue`) e cidades fixas em mocks (login/dashboard).
* A tela de Funcionário (`docs/specifications/employees/employee-registration.md`) já previa
  Cidade como **lookup** que retorna a UF. Este módulo passa a ser o **dono** desse dado.
* **Hierarquia obrigatória:** `Cidade → Estado → País`.
  * Estado pertence a um País.
  * Cidade pertence a um Estado (e, por consequência, a um País).
  * **A Cidade não alimenta UF/País manualmente** — ela os obtém ao selecionar o Estado
    (que já traz o País). Igualmente, o Estado obtém o País ao selecioná-lo. Tudo por
    lookup, conforme regra de negócio.
* **Reforma Tributária (EC 132/2023 + LC 214/2025):** o IBS substitui ICMS (estadual) e ISS
  (municipal); sua alíquota é a **soma da alíquota do Estado + alíquota do Município do
  destino** da operação. Cada ente fixa sua alíquota-padrão, tendo a alíquota de referência
  (Senado) como baliza. O DF acumula competência estadual e municipal. Por isso, **Estado**
  e **Cidade** carregam campos de alíquota próprios. A **CBS** é federal (não depende de
  estado/município), então o seu vínculo fica no País (regime nacional × exterior).

---

## 4. Regras de Negócio

### 4.1 Hierarquia e origem dos dados (núcleo da regra)

| # | Regra |
|---|-------|
| H1 | Estado **referencia** País (FK obrigatória). |
| H2 | Cidade **referencia** Estado (FK obrigatória); o País é derivado do Estado. |
| H3 | No cadastro de Cidade, UF e País são **somente leitura**, preenchidos pelo Estado selecionado (lookup). Não há digitação manual. |
| H4 | No cadastro de Estado, o País é selecionado por **lookup**. |
| H5 | Qualquer outro cadastro do sistema que precise de país/estado/cidade **consome** estes cadastros via lookup compartilhado (seção 14.2). Proibido texto livre ou lista paralela. |
| H6 | Registros **não podem ser excluídos** se estiverem referenciados por outro cadastro (RESTRICT). Em vez de excluir, **inativar** (`active = false`). Ver R-Del. |
| H7 | **O sistema opera com países estrangeiros** (P2). Os códigos **IBGE** (cUF, cMun) e a **região** só se aplicam quando o País é **Brasil**; para país estrangeiro ficam vazios/não aplicáveis e não são validados. Sigla/nome continuam válidos para qualquer país. |

### 4.2 País — validações

| # | Campo | Regra |
|---|-------|-------|
| P-1 | Nome | Obrigatório. |
| P-2 | Código BACEN | Obrigatório, **4 dígitos** (campo `cPais` da NF-e; ex.: Brasil = `1058`). Único. |
| P-3 | Sigla ISO 3166-1 alpha-2 | Obrigatória, 2 letras maiúsculas (ex.: `BR`). Única. |
| P-4 | Sigla ISO 3166-1 alpha-3 | Opcional, 3 letras maiúsculas (ex.: `BRA`). |
| P-5 | Código ISO numérico | Opcional, 3 dígitos (ex.: `076`). |
| P-6 | Código SISCOMEX | Opcional (comércio exterior/importação). |
| P-7 | Ativo | Boolean (default `true`). |

### 4.3 Estado (UF) — validações

| # | Campo | Regra |
|---|-------|-------|
| E-1 | País | Obrigatório (lookup). |
| E-2 | Código IBGE da UF | Obrigatório quando País = Brasil: **2 dígitos** válidos (campo `cUF` da NF-e; ex.: SP = `35`). Único no país. **Estrangeiro: não aplicável (vazio).** |
| E-3 | Sigla (UF) | Obrigatória, 2 letras maiúsculas (ex.: `SP`). Única no país. |
| E-4 | Nome | Obrigatório. |
| E-5 | Região | Derivada do 1º dígito do código IBGE para UFs brasileiras (1=Norte, 2=Nordeste, 3=Sudeste, 4=Sul, 5=Centro-Oeste). **Só para Brasil**; estrangeiro fica vazio. |
| E-6 | Alíquota IBS estadual (%) | **Fiscal.** Alíquota-padrão do IBS do ente estadual. Opcional agora; usado pelos módulos fiscais. |
| E-7 | Alíquota de referência estadual (%) | **Fiscal.** Baliza (resolução do Senado). Opcional. |
| E-8 | Competência híbrida (DF) | **Fiscal.** Boolean. Indica que o ente exerce competência **estadual e municipal** (caso do Distrito Federal). |
| E-9 | Ativo | Boolean (default `true`). |

### 4.4 Cidade (Município) — validações

| # | Campo | Regra |
|---|-------|-------|
| C-1 | Estado | Obrigatório (lookup). País derivado (H2/H3). |
| C-2 | Código IBGE do município | Obrigatório quando País = Brasil: **7 dígitos** com dígito verificador válido (campo `cMun` da NF-e). Os 2 primeiros dígitos devem casar com o código IBGE do Estado. Único. **Estrangeiro: não aplicável (vazio).** |
| C-3 | Nome | Obrigatório. |
| C-4 | Código TOM/SIAFI | Opcional (usado em alguns documentos fiscais/repasses). |
| C-5 | Capital | Boolean opcional. |
| C-6 | Latitude / Longitude | Opcionais (reuso no mapa — `brazil-points-map.vue`). |
| C-7 | Alíquota IBS municipal (%) | **Fiscal.** Alíquota-padrão do IBS do ente municipal. Opcional agora. |
| C-8 | Alíquota de referência municipal (%) | **Fiscal.** Baliza (Senado). Opcional. |
| C-9 | Competência municipal especial | **Fiscal.** Boolean/observação para casos como **Fernando de Noronha** (competência municipal exercida por PE). |
| C-10 | Ativo | Boolean (default `true`). |

### 4.5 IBS combinado (preparação fiscal — não implementar agora, só estruturar)

* As alíquotas IBS (estadual e municipal) são **editadas manualmente** nestas telas (P3).
  Integração com tabela oficial fica para o futuro, sem mudar o contrato.
* O IBS de uma operação = **alíquota IBS estadual (destino) + alíquota IBS municipal
  (destino)**. A estrutura acima já permite esse cálculo quando o módulo fiscal existir.
* Helper futuro sugerido (em `shared/extensions` ou `modules/fiscal`):
  `combinedIbsRate(state, city): number = state.ibsStateRate + city.ibsMunicipalRate`.
* **Não** criar a lógica de cálculo agora; apenas garantir os campos (P4 confirmado).
* **Distrito Federal (P7 — tratamento padrão):** o DF é cadastrado como um **Estado**
  comum (com `hasHybridCompetence = true`) e Brasília como uma **Cidade** comum. Sem
  ramificação/lógica especial: o flag é apenas metadado que o módulo fiscal consumirá.

### 4.6 Exclusão (R-Del)

* Excluir País/Estado/Cidade só é permitido se **não houver referência** em outro cadastro
  (integridade RESTRICT). Caso contrário, oferecer **inativar** em vez de excluir.
* Toda exclusão passa por confirmação destrutiva (`BaseDialog` danger).

---

## 5. Fluxo

### 5.1 CRUD (mock-first)

```txt
Page (CountriesPage | StatesPage | CitiesPage)
→ Store (BaseCrudStore: CountriesStore | StatesStore | CitiesStore)
→ UseCase (Get/Save/Delete)
→ Repository (CountryRepository | StateRepository | CityRepository)
→ Mock*Provider
→ AsyncResult<T>
```

### 5.2 Cadastro de Estado (origem do País)

```txt
StateForm → CountryLookupField (busca país) → seleciona → preenche countryId/countryName
→ informa cUF, sigla, nome, região, alíquotas → Gravar
```

### 5.3 Cadastro de Cidade (origem de Estado e País)

```txt
CityForm → StateLookupField (busca estado; opcionalmente filtrado por país)
→ seleciona → preenche stateId, uf, countryId/countryName (somente leitura)
→ informa cMun, nome, TOM, lat/long, alíquotas → Gravar
```

### 5.4 Consumo por outros cadastros

```txt
Qualquer Form (ex.: Funcionário/Cliente)
→ CountryLookupField / StateLookupField / CityLookupField (shared)
→ SearchCountries / SearchStates(byCountry) / SearchCities(byState) UseCase
→ *LookupRepository → Mock*Provider → AsyncResult<...[]>
→ grava apenas o id (FK) + denormalizado (nome/uf) no cadastro consumidor
```

---

## 6. Entradas

* **País:** nome, código BACEN, ISO alpha-2/alpha-3/numérico, SISCOMEX, ativo.
* **Estado:** país (lookup), cUF (IBGE), sigla, nome, região, alíquota IBS estadual,
  alíquota de referência estadual, competência híbrida (DF), ativo.
* **Cidade:** estado (lookup), cMun (IBGE), nome, TOM/SIAFI, capital, lat/long, alíquota
  IBS municipal, alíquota de referência municipal, competência especial, ativo.
* **Pesquisa:** termo (nome/sigla/código), filtros (país, estado, ativo), paginação/ordenação.

---

## 7. Saídas

* Registro persistido (com `id`).
* Listas paginadas/filtradas para as telas de pesquisa.
* Listas de lookup (cidades por estado, estados por país) para os demais cadastros.
* Tudo encapsulado em `AsyncResult<T>` (sucesso → `data`; falha → `AppError`).

---

## 8. Casos de Erro

| Código | Situação | Tratamento |
|--------|----------|-----------|
| `VALIDATION_REQUIRED` | Campo obrigatório vazio | Erro no campo + resumo |
| `VALIDATION_BACEN` | Código BACEN ≠ 4 dígitos | Erro no campo |
| `VALIDATION_ISO2` | ISO alpha-2 inválido | Erro no campo |
| `VALIDATION_CUF` | cUF não é UF IBGE válida | Erro no campo |
| `VALIDATION_CMUN` | cMun não tem 7 dígitos / DV inválido / prefixo ≠ UF | Erro no campo |
| `CONFLICT_UNIQUE` | BACEN/ISO2/cUF/sigla/cMun duplicado | Toast/erro de conflito |
| `DELETE_RESTRICT` | Registro referenciado por outro cadastro | Bloqueia exclusão; sugere inativar |
| `NOT_FOUND` | Registro inexistente | Toast + volta à pesquisa |
| `NETWORK` | Falha de comunicação (fase real) | `AppError` genérico, toast |

---

## 9. Contratos

> Models em inglês (template). Conversão pt-BR ⇄ inglês **só** no mapper em `data`.

### 9.1 Enums

```ts
// domain/enums/brazil-region.ts
export enum BrazilRegion {
  North = 'NORTE',
  Northeast = 'NORDESTE',
  Southeast = 'SUDESTE',
  South = 'SUL',
  CenterWest = 'CENTRO_OESTE',
}
```

### 9.2 Models

```ts
// domain/models/country.ts
export type Country = {
  id: number | null;
  name: string;              // nome
  bacenCode: string;         // código BACEN (cPais) — 4 dígitos. Brasil = '1058'
  iso2: string;              // ISO 3166-1 alpha-2 — 'BR'
  iso3: string;              // ISO 3166-1 alpha-3 — 'BRA'
  isoNumeric: string;        // ISO numérico — '076'
  siscomexCode: string;      // comércio exterior (opcional)
  active: boolean;
};

// domain/models/state.ts  (Estado / UF)
export type State = {
  id: number | null;
  countryId: number;         // FK País
  countryName: string;       // denormalizado p/ exibição
  ibgeCode: string;          // cUF — 2 dígitos (Brasil)
  uf: string;                // sigla — 'SP'
  name: string;              // nome
  region: BrazilRegion | null;
  // --- Fiscal (Reforma Tributária) ---
  ibsStateRate: number | null;          // alíquota-padrão IBS estadual (%)
  ibsStateReferenceRate: number | null; // alíquota de referência estadual (%)
  hasHybridCompetence: boolean;         // DF: exerce competência estadual + municipal
  active: boolean;
};

// domain/models/city.ts  (Cidade / Município)
export type City = {
  id: number | null;
  stateId: number;           // FK Estado
  uf: string;                // denormalizado (do estado)
  countryId: number;         // denormalizado (do estado)
  countryName: string;       // denormalizado
  ibgeCode: string;          // cMun — 7 dígitos com DV (Brasil)
  name: string;              // nome
  tomCode: string;           // TOM/SIAFI (opcional)
  isCapital: boolean;
  latitude: number | null;
  longitude: number | null;
  // --- Fiscal (Reforma Tributária) ---
  ibsMunicipalRate: number | null;          // alíquota-padrão IBS municipal (%)
  ibsMunicipalReferenceRate: number | null; // alíquota de referência municipal (%)
  hasSpecialMunicipalCompetence: boolean;   // ex.: Fernando de Noronha (PE)
  active: boolean;
};

// copyWith (padrão do template)
export function copyCountry(b: Country, c: Partial<Country>): Country { return { ...b, ...c }; }
export function copyState(b: State, c: Partial<State>): State { return { ...b, ...c }; }
export function copyCity(b: City, c: Partial<City>): City { return { ...b, ...c }; }

// Resumos para lookup (payload leve consumido por outros cadastros)
export type CountrySummary = { id: number; name: string; iso2: string };
export type StateSummary   = { id: number; uf: string; name: string; countryId: number };
export type CitySummary    = { id: number; name: string; uf: string; stateId: number };
```

### 9.3 JSON de saída — País (`fromApi`)

```json
{ "codigo": 1, "nome": "Brasil", "codigoBacen": "1058", "iso2": "BR", "iso3": "BRA", "isoNumerico": "076", "siscomex": "", "ativo": true }
```

### 9.4 JSON de saída — Estado (`fromApi`)

```json
{
  "codigo": 26, "paisId": 1, "paisNome": "Brasil",
  "codigoIbge": "35", "uf": "SP", "nome": "São Paulo", "regiao": "SUDESTE",
  "aliquotaIbsEstadual": null, "aliquotaReferenciaEstadual": null,
  "competenciaHibrida": false, "ativo": true
}
```

### 9.5 JSON de saída — Cidade (`fromApi`)

```json
{
  "codigo": 5270, "estadoId": 26, "uf": "SP", "paisId": 1, "paisNome": "Brasil",
  "codigoIbge": "3550308", "nome": "São Paulo", "codigoTom": "7107",
  "capital": true, "latitude": -23.5505, "longitude": -46.6333,
  "aliquotaIbsMunicipal": null, "aliquotaReferenciaMunicipal": null,
  "competenciaMunicipalEspecial": false, "ativo": true
}
```

---

## 10. Models Envolvidos

`Country`, `State`, `City` (+ `CountrySummary`, `StateSummary`, `CitySummary`),
enum `BrazilRegion`.

---

## 11. UseCases

* País: `GetCountries`, `GetCountryById`, `SaveCountry`, `DeleteCountry`, `SearchCountries`.
* Estado: `GetStates`, `GetStateById`, `SaveState`, `DeleteState`, `SearchStates` (filtro por país).
* Cidade: `GetCities`, `GetCityById`, `SaveCity`, `DeleteCity`, `SearchCities` (filtro por estado).

---

## 12. Repositories

* `CountryRepository`, `StateRepository`, `CityRepository` (contratos em `domain/repositories`).
* Lookups leves (read-only) expostos para outros módulos:
  `CountryLookupRepository`, `StateLookupRepository`, `CityLookupRepository`.

---

## 13. Providers

* `MockCountryProvider` — Brasil + alguns países (BACEN/ISO corretos).
* `MockStateProvider` — as 27 UFs com `cUF` IBGE, sigla, nome, região (DF com
  `hasHybridCompetence = true`).
* `MockCityProvider` — capitais + cidades de exemplo com `cMun` IBGE, lat/long
  (reaproveitar as coordenadas já existentes nos mocks atuais).
* **Futuro (REST):** `Rest*Provider` com o mesmo contrato; possível **seed** a partir das
  tabelas oficiais IBGE/BACEN. Sem impacto em repository/usecase/store/widgets.

---

## 14. Extensions e Componentes

### 14.1 Extensions a CRIAR (`src/shared/extensions`)

```ts
// ibge-ext.ts
/** Valida código IBGE de município: 7 dígitos + dígito verificador. */
export function isValidIbgeMunicipality(code: string): boolean;
/** Valida código IBGE de UF: 2 dígitos pertencentes ao conjunto oficial. */
export function isValidIbgeUf(code: string): boolean;
/** Deriva a região a partir do 1º dígito do código IBGE da UF (Brasil). */
export function regionFromIbgeUf(code: string): BrazilRegion | null;

// country-ext.ts
/** Código BACEN do país: exatamente 4 dígitos. */
export function isValidBacenCode(code: string): boolean;
/** ISO 3166-1 alpha-2: 2 letras maiúsculas. */
export function isValidIso2(code: string): boolean;
```

> Reaproveitar `onlyDigits`, `normalizeText`. Validação de alíquota (%) usa numérico ≥ 0.

### 14.2 Widgets compartilhados a CRIAR (`src/shared/widgets`) — **consumidos por todo o sistema**

* `CountryLookupField` — type-to-search de país (retorna `CountrySummary`).
* `StateLookupField` — type-to-search de estado, com filtro opcional por país (retorna `StateSummary` com UF e país).
* `CityLookupField` — type-to-search de cidade, filtrado por estado (retorna `CitySummary` com UF).

> Estes três campos **substituem** qualquer entrada manual de país/estado/cidade no sistema.
> A tela de Funcionário (e futuras: Cliente, Fornecedor, Imóvel) passa a usá-los.

### 14.3 Widgets do módulo (`src/modules/locations/presentation/widgets`)

* Formulários e painéis de pesquisa de País, Estado e Cidade.
* `RecordCodeBadge` (do módulo Funcionário, já compartilhado) reutilizado no cabeçalho.
* `StatusBadge` para Ativo/Inativo (Ativo→success, Inativo→`text-muted`/neutro).

---

## 15. Layout — Grupos de Dados e Ícones (Design System §9.2)

Telas de pesquisa abrem **vazias** (empty-state com ícone + pulse); forms **agrupados por
contexto**; barra de ação fixa; operação keyboard-first; lookups para dados de backend.

### 15.1 País — ícone `pi-globe`

| Grupo | Campos |
|-------|--------|
| Identificação | Indicador de Código + Ativo (`StatusBadge`); Nome*, Código BACEN* |
| Códigos internacionais | ISO alpha-2*, ISO alpha-3, ISO numérico, SISCOMEX |

### 15.2 Estado — ícone `pi-map`

| Grupo | Campos |
|-------|--------|
| Identificação | Código + Ativo; País* (lookup `CountryLookupField`), cUF (IBGE)*, Sigla*, Nome, Região |
| Fiscal (Reforma Tributária) | Alíquota IBS estadual, Alíquota de referência estadual, Competência híbrida (DF) |

### 15.3 Cidade — ícone `pi-map-marker`

| Grupo | Campos |
|-------|--------|
| Identificação | Código + Ativo; Estado* (lookup `StateLookupField`), UF (auto), País (auto), cMun (IBGE)*, Nome*, Capital |
| Localização | Latitude, Longitude (reuso no mapa), TOM/SIAFI |
| Fiscal (Reforma Tributária) | Alíquota IBS municipal, Alíquota de referência municipal, Competência municipal especial |

`*` = obrigatório. UF e País na tela de Cidade são **somente leitura** (vêm do Estado).

---

## 16. Vínculo com o Cadastro de Funcionário (PATCH a aplicar)

> Aplicar ao `docs/specifications/employees/employee-registration.md` e ao código do módulo
> `employees`. A regra "consome dos cadastros de localização" passa a valer.

### 16.1 Mudanças no model `EmployeeAddress`

* `cityId: number | null` agora é **FK para `City`** (cadastro de Cidade). Mantém os
  denormalizados `cityName`, `uf`. **Adicionar** `countryId`/`countryName` derivados.
* O campo **Cidade** usa `CityLookupField` (shared); ao selecionar, preenche `uf` e país.
* O campo **UF** continua **somente leitura** (vem da cidade).

### 16.2 Mudanças em Naturalidade

* `birthplace` (texto) + `birthplaceUf` (texto) passam a `naturalCityId` (lookup `City`) +
  `naturalUf` derivado. Naturalidade do **Funcionário é sempre cidade brasileira** (lookup);
  não há caso de naturalidade estrangeira aqui (P5). O tratamento de origem estrangeira
  ficará no módulo de **Cliente**, quando implementado — fora do escopo do Funcionário.

### 16.3 Remoção de mock próprio

* O `MockCityProvider` do módulo `employees` (previsto na spec antiga) é **removido**: o
  lookup de cidade passa a vir do módulo `locations`. Funcionário não mantém lista própria.

---

## 17. Mock Inicial

* `MockCountryProvider`: Brasil (`1058`/`BR`/`BRA`/`076`) + 2–3 países exemplo.
* `MockStateProvider`: 27 UFs com `cUF` IBGE real, sigla, nome e região; DF com competência
  híbrida marcada.
* `MockCityProvider`: capitais + cidades exemplo com `cMun` IBGE real e lat/long (reusar as
  coordenadas dos mocks atuais de mapa). Alíquotas IBS ficam `null` (ainda não definidas).
* CRUD e lookups totalmente operáveis só com mock.

---

## 18. Integração Real (futuro)

* `Rest*Provider` com o mesmo contrato JSON. **Seed** recomendado a partir das tabelas
  oficiais IBGE (UFs e municípios) e BACEN/ISO (países).
* Alíquotas IBS estadual/municipal: atualizáveis conforme as leis de cada ente forem
  publicadas (a Reforma é de transição gradual; os valores mudam ao longo dos anos).
* CEP por cidade e consulta de endereço por CEP (NoturnoMAPS) podem reusar este cadastro.

---

## 19. Impactos

`src/modules/locations/**` (novo módulo completo), **`shared/extensions`** (`ibge-ext`,
`country-ext`), **`shared/widgets`** (`CountryLookupField`, `StateLookupField`,
`CityLookupField`), `router` (3 rotas + permissões ADR-006), `modules/home` (itens de menu
de Localização), e **`src/modules/employees`** (vínculo da seção 16). Demais cadastros
futuros (Cliente, Fornecedor, Imóvel) já nascem consumindo os lookups.

**Permissões (ADR-006):** recursos `PAIS`, `ESTADO`, `CIDADE` com ações
`open/search/create/update/delete/print/report/chart`.

---

## 20. Decisão Arquitetural (rascunho — promover a ADR)

> Sugiro registrar como **ADR-00X — Cadastros de localização como fonte única + lookups
> compartilhados** em `docs/decisions`.

* **Decisão:** os models `Country/State/City` e os repositórios de lookup vivem em
  `modules/locations` (dono do dado). Outros módulos **não** importam os models de escrita;
  consomem **apenas** os `*Summary` via `*LookupField`/`Search*` UseCases e **armazenam o
  `id` (FK) + denormalizado** (nome/UF). Evita acoplamento circular e mantém o fluxo do
  template.
* **Alternativa avaliada:** promover os models para `shared/domain`. Descartada por ora —
  acopla todo o sistema às mudanças do model de escrita; o padrão "FK + denormalizado" já
  resolve o reuso. Reavaliar se virar package no monorepo.
* **Campos fiscais:** criados agora por exigência futura dos módulos fiscais (Reforma
  Tributária), mesmo sem uso imediato — barato agora, caro depois (evita migração).

---

## 21. Base de Conhecimento

Documentar: o que são os cadastros de País/Estado/Cidade; a hierarquia obrigatória; que
todo cadastro consome destes (lookups); os códigos oficiais (BACEN/ISO, cUF, cMun) e para
que servem; os campos fiscais da Reforma (IBS estadual/municipal e referência, competência
DF e casos especiais); rotas, permissões e como inativar em vez de excluir.

---

## 22. Decisões de Negócio (aceitas)

> Respostas validadas por Glenio — travadas nesta spec.

| # | Decisão |
|---|---------|
| D1 | **Menu:** Localização entra no grupo **Sistema**. |
| D2 | **Escopo:** o sistema opera **também com estrangeiros** (países, estados e cidades fora do Brasil). Consequência: códigos **IBGE** (cUF/cMun) e **região** só se aplicam/validam quando o País é Brasil; estrangeiro fica vazio (regra H7). |
| D3 | **Alíquotas IBS:** editadas **manualmente** nestas telas agora; integração com tabela oficial fica para depois (sem mudar contrato). |
| D4 | **Cálculo do IBS:** **não** se implementa cálculo agora — apenas os campos. O cálculo combinado (estadual + municipal do destino) é do futuro **módulo fiscal**. |
| D5 | **Naturalidade estrangeira:** **não** se trata aqui. Naturalidade do Funcionário é sempre cidade brasileira; origem estrangeira ficará no módulo **Cliente** (futuro). |
| D6 | **Granularidade fiscal extra** (`cClassTrib`, CST do IBS/CBS, regimes especiais): **fora deste módulo** — pertence aos cadastros fiscais por produto/operação (produto/NCM). |
| D7 | **Distrito Federal:** **tratamento padrão** — DF como Estado comum (`hasHybridCompetence = true`) e Brasília como Cidade comum; sem lógica especial, o flag é só metadado para o fiscal. |

---

## 23. Checklist antes de implementar (template)

- [ ] Especificação aprovada; decisões da seção 22 aplicadas no código.
- [ ] Contratos JSON confirmados (seção 9).
- [ ] Extensions criadas com testes (`isValidIbgeMunicipality`, `isValidIbgeUf`,
      `regionFromIbgeUf`, `isValidBacenCode`, `isValidIso2`).
- [ ] `CountryLookupField`, `StateLookupField`, `CityLookupField` em `shared/widgets`.
- [ ] Módulo `locations` completo (domain/data/presentation) operável em mock-first.
- [ ] Vínculo do Funcionário aplicado (seção 16) sem quebrar a tela existente.
- [ ] Rotas + permissões (ADR-006) e itens de menu.
- [ ] Conformidade com o checklist do Design System §14.
- [ ] Base de Conhecimento atualizada (seção 21).
- [ ] ADR de localização registrado (seção 20).
- [ ] `pnpm typecheck`, `pnpm lint`, `pnpm test` sem erros.

---

## 24. Relação com outros documentos

* Herda `../template/CLAUDE.md`, `docs/architecture/README.md`,
  `docs/design-system/README.md`, `docs/specifications/README.md`.
* **Altera** `docs/specifications/employees/employee-registration.md` (seção 16).
* Usa `AsyncResult`/`AppError` e `BaseCrudStore` (**ADR-004**); permissões (**ADR-006**);
  stack (**ADR-002**). Reaproveita `shared/widgets/brazil-points-map.vue`.