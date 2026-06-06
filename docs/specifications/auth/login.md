# Especificação — Tela de Login (Acesso + Vitrine institucional)

> Caminho no repositório: `docs/specifications/auth/login.md`
>
> Regras corporativas (camadas, mock-first, AsyncResult, mappers, stores,
> Design System) vivem no template `../template`. Esta spec registra apenas a
> funcionalidade **Tela de Login do EspaçoN** e como o padrão é aplicado aqui.

## Status

**Implementado (Fase 2) — mock-first.** Módulo `src/modules/auth` (domain/data/
presentation), rota `/` com guard de sessão.

> **Evolução (Fase 2.1) — Panorama público.** O painel direito deixou de ser uma
> "vitrine" de missão/visão/metas e passou a ser um **panorama público da rede**:
> dashboard de indicadores **não-financeiros** (dinâmico), **mapa discreto** de
> pontos de atuação e **carrossel do ecossistema de apps** da Noturno. Tudo vem
> de um contrato único — endpoint futuro **`GET /public/login-overview`** —
> servido por mock nesta fase. Componentes: `LoginPanel` + `PublicOverviewPanel`
> (`DashboardSummary`, `MapPreview`, `AppCarousel`). As seções de contrato,
> models, repositories, providers e stores abaixo refletem esse panorama.

---

## Nome

Tela de Login do EspaçoN — painel de **acesso** (esquerda) + **vitrine
institucional** (direita).

---

## Objetivo

Autenticar o usuário no EspaçoN e, na mesma tela, comunicar credibilidade e
abrangência da Noturno por meio de uma vitrine institucional (mapa de presença,
indicadores de uso em tempo real, missão/visão/metas).

Não é um login simples: a tela tem dois objetivos simultâneos — **converter o
acesso** (formulário objetivo, baixo atrito) e **gerar confiança** (prova social
e autoridade da marca).

---

## Contexto

- O acesso é por e-mail/senha, sem backend de autenticação neste repositório.
  Login inicia **mockado**; token/sessão definitiva são deferidos (ver
  **ADR-003**).
- "Manter acesso" e e-mail lembrado usam persistência local **provisória** via
  `KeyValueStore` (ver **ADR-005**).
- O usuário nasce preparado para **multiempresa** (`role`, `accessScope`,
  `franchiseId`, `representativeId`, `permissions`) — ver **ADR-006**.
- A vitrine exibe dados **antes** da autenticação. Por isso consome apenas um
  recorte **público, agregado e anonimizado** — sem nome/endereço de cliente,
  com agregação por cidade (ver **ADR-007**).
- Tema **dark-first** e paleta oficial da Noturno (definidas no template e em
  `src/app/globals.css`).

---

## Layout

Duas colunas. Esquerda = **ação** (acesso, ~35%, protagonista visual). Direita =
**panorama público** da rede Noturno (~65%): dashboard de indicadores
não-financeiros + mapa discreto de pontos de atuação + carrossel de apps. O
diagrama abaixo é histórico (vitrine institucional); a estrutura vigente é a do
"Panorama público" descrita no Status e nas seções de contrato/components.

```txt
┌───────────────────────────────┬───────────────────────────────────────────┐
│  ESQUERDA — Acesso             │  DIREITA — Vitrine institucional            │
│  (≈ 38% largura)               │  (≈ 62% largura)                            │
│                                │                                             │
│  [logo Noturno]                │  ┌─────────────────────────────────────┐   │
│                                │  │  Mapa de presença (clusters/cidade) │   │
│  Bem-vindo ao EspaçoN          │  │  • pontos agregados por cidade      │   │
│                                │  │  • sem nome/endereço de cliente     │   │
│  E-mail        [_____________] │  └─────────────────────────────────────┘   │
│  Senha         [________] [👁] │                                             │
│                                │  ┌────────┐ ┌────────┐ ┌────────┐ ┌──────┐ │
│  [x] Lembrar e-mail            │  │ Ativos │ │Clientes│ │Cidades │ │Estad.│ │
│  [x] Manter acesso             │  │  128   │ │  1.4k  │ │   47   │ │   9  │ │
│                                │  └────────┘ └────────┘ └────────┘ └──────┘ │
│  [        ENTRAR        ]      │   (cards flat, contador com count-up)       │
│   (dourado — CTA primário)     │                                             │
│                                │  Missão · Visão · Metas                     │
│  Recuperar senha →             │  (conteúdo institucional a ser fornecido)   │
│                                │                                             │
│  [erro de acesso, se houver]   │  [estados: loading / vazio / erro]          │
└───────────────────────────────┴───────────────────────────────────────────┘
```

### Responsividade

- **Desktop/notebook**: duas colunas como acima.
- **Tablet**: vitrine reduz (mapa menor, cards em 2×2).
- **Mobile**: empilha — **formulário primeiro** (a ação não pode ficar abaixo da
  dobra), vitrine abaixo, resumida (cards 2×2 + missão; mapa opcional).

---

## Regras de Negócio

### Acesso (esquerda)

1. Login por **e-mail + senha**. E-mail validado por `email-ext.ts` antes do
   envio; senha não-vazia.
2. Botão **mostrar/ocultar senha**.
3. **Lembrar e-mail**: quando marcado, persiste **apenas o e-mail** para
   pré-preencher o próximo acesso. **Nunca** persiste a senha.
4. **Manter acesso**: quando marcado, a sessão é salva em `localStorage`
   (persiste entre sessões do navegador); quando desmarcado, em
   `sessionStorage` (cai ao fechar a aba) e **qualquer sessão/e-mail salvo em
   `localStorage` é removido** (ADR-005).
5. Ao abrir a tela com **sessão salva válida**, redirecionar direto para
   `/dashboard` sem exibir o formulário.
6. **Entrar** dispara o fluxo de login; durante a operação o botão fica em
   `loading` e desabilitado (evita duplo envio).
7. **Recuperar senha** → navega para `/recuperar-senha` (spec
   `docs/specifications/auth/password-recovery.md`).
8. Credencial mockada (ADR-003 / `authentication.md`):
   `admin@noturno.com.br` / `noturno`. Qualquer outra combinação retorna
   `AppError(kind:'auth')` exibido no formulário.

> **Segurança — senha nunca persistida.** O navegador guarda no máximo o e-mail
> lembrado e a sessão (mock). A senha existe apenas em memória durante o envio.

### Vitrine (direita)

9. Todos os dados vêm de um recorte **público/agregado/anonimizado** (ADR-007):
   - **Mapa**: clusters por **cidade** (lat/long da cidade, contagem de clientes
     na cidade) — **sem** nome, documento ou endereço de cliente.
   - **Usuários ativos**: total agregado de usuários acessando o ERP no momento.
   - **Clientes / Cidades / Estados**: contadores agregados de abrangência.
   - **Missão/Visão/Metas**: conteúdo institucional (texto fornecido depois).
10. A vitrine **nunca bloqueia o login**: se falhar ao carregar, o formulário
    permanece 100% funcional e a vitrine mostra estado de erro/vazio discreto.
11. Carregamento independente do formulário (não atrasa a digitação do usuário).

---

## Fluxo

### Fluxo de login

```txt
LoginPage
→ AuthStore.submit()
→ LoginUseCase(credentials)
→ AuthRepositoryImpl
→ MockAuthProvider
→ AsyncResult<AuthSession>
  ├─ sucesso → SessionRepository.save(session, keepSignedIn) → redireciona /dashboard
  └─ falha   → AuthStore.errorMessage (AppError.message)
```

### Fluxo da vitrine (em paralelo, no mount)

```txt
LoginPage (onMounted)
→ LoginShowcaseStore.load()
→ GetLoginShowcaseUseCase()
→ ShowcaseRepositoryImpl
→ MockShowcaseProvider
→ AsyncResult<LoginShowcase>
  ├─ sucesso → popula métricas + clusters do mapa + institucional
  └─ falha   → estado de erro discreto (login segue funcionando)
```

### Inicialização (sessão salva)

```txt
LoginPage (onMounted)
→ SessionRepository.read()
  ├─ sessão válida → router.replace('/dashboard')
  └─ sem sessão    → exibe formulário; pré-preenche e-mail lembrado
```

---

## Entradas

| Campo            | Origem        | Regra                                  |
| ---------------- | ------------- | -------------------------------------- |
| `email`          | input usuário | obrigatório, formato de e-mail válido  |
| `password`       | input usuário | obrigatório, não-vazio                 |
| `rememberEmail`  | checkbox      | default: ligado se já havia e-mail     |
| `keepSignedIn`   | checkbox      | default: desligado                     |

---

## Saídas

| Resultado            | Conteúdo                                                   |
| -------------------- | ---------------------------------------------------------- |
| Login OK             | `AuthSession` (usuário + escopo); redireciona `/dashboard` |
| Login falha          | `AppError(kind:'auth')` → mensagem no formulário           |
| Vitrine OK           | `LoginShowcase` (métricas, clusters, institucional)        |
| Vitrine falha        | estado de erro discreto; formulário intacto                |

---

## Casos de Erro

| Caso                                   | `AppError.kind` | Mensagem (UI)                                            |
| -------------------------------------- | --------------- | -------------------------------------------------------- |
| E-mail/senha inválidos                 | `auth`          | "E-mail ou senha inválidos."                             |
| E-mail mal formatado (pré-envio)       | `validation`    | "Informe um e-mail válido."                              |
| Senha vazia (pré-envio)                | `validation`    | "Informe sua senha."                                     |
| Falha de rede (integração futura)      | `network`       | "Falha de conexão. Tente novamente."                     |
| Falha ao carregar a vitrine            | `network`/`server` | (não bloqueia) vitrine mostra "Não foi possível carregar." |

Toda exception crua é convertida em `AppError` na camada `data`/`application`
via `guard()`. A presentation só conhece `AppError.message`.

---

## Contratos

> Mock-first: os JSONs abaixo são o contrato-alvo do mock e da futura API REST.
> Models do frontend ficam em **inglês**; conversão na camada `data` por mapper.

### JSON Entrada — login

```json
{
  "email": "admin@noturno.com.br",
  "password": "noturno",
  "keepSignedIn": true
}
```

### JSON Saída — sessão (mock; token deferido — ADR-003)

```json
{
  "user": {
    "id": "u-001",
    "name": "Administrador Noturno",
    "email": "admin@noturno.com.br",
    "role": "admin",
    "accessScope": "global",
    "franchiseId": null,
    "representativeId": null,
    "permissions": ["*"]
  },
  "issuedAt": "2026-06-06T12:00:00.000Z"
}
```

### JSON Saída — panorama público (`GET /public/login-overview` — ADR-007)

Contrato vigente do painel direito. Três blocos **dinâmicos** (dashboard, map,
apps); a UI renderiza qualquer quantidade recebida. Apenas dados
**não-financeiros** e sem identificar cliente.

```json
{
  "dashboard": [
    { "id": "online_users",  "label": "Usuários online", "value": 128,  "icon": "users" },
    { "id": "active_clients","label": "Clientes ativos",  "value": 1432, "icon": "building" },
    { "id": "cities",        "label": "Cidades",          "value": 47,   "icon": "map-pin" },
    { "id": "states",        "label": "Estados",          "value": 9,    "icon": "map" }
  ],
  "map": [
    { "id": "rr-boa-vista", "city": "Boa Vista", "state": "RR", "latitude": 2.8235, "longitude": -60.6758, "activeUsers": 12 }
  ],
  "apps": [
    { "id": "doctorcar", "name": "DoctorCar", "description": "Gestão para auto centers", "icon": "car", "status": "active" }
  ]
}
```

> Indicadores permitidos (não-financeiros): usuários online, clientes ativos,
> cidades, estados, franqueados, sistemas ativos, chamados em atendimento.
> **Proibido**: faturamento, valores, boletos, contas a pagar/receber, qualquer
> dado financeiro. O mapa é agregado por **cidade** (sem nome/documento/endereço).
> `icon` é uma **chave semântica**; a UI a mapeia para o Design System
> (`presentation/widgets/overview-icon.ts`). A granularidade definitiva é fechada
> no ADR-007 quando houver API pública real.

---

## Models Envolvidos

Em `src/modules/auth/domain/models` (inglês; imutáveis; com `fromJson`/`toJson`).

```ts
// credentials.ts
export interface Credentials {
  email: string
  password: string
  keepSignedIn: boolean
}

// auth-user.ts  (ADR-006)
export type UserRole =
  | 'admin' | 'franchisee' | 'representative' | 'technician' | 'customer'
export type AccessScope =
  | 'global' | 'franchise' | 'representative' | 'technician' | 'customer'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  accessScope: AccessScope
  franchiseId?: string | null
  representativeId?: string | null
  permissions: string[]
}

// auth-session.ts  (token deferido — ADR-003)
export interface AuthSession {
  user: AuthUser
  issuedAt: string // ISO
}

// login-overview.ts  (público/agregado, não-financeiro — ADR-007)
// Contrato de `GET /public/login-overview`. Blocos dinâmicos.
export interface OverviewIndicator {
  id: string
  label: string
  value: number
  icon: string // chave semântica → mapeada na UI
}

export interface OverviewMapPoint {
  id: string
  city: string
  state: string
  latitude: number
  longitude: number
  activeUsers: number
}

export type AppStatus = 'active' | 'inactive' | 'soon'

export interface OverviewApp {
  id: string
  name: string
  description: string
  icon: string
  status: AppStatus
}

export interface LoginOverview {
  dashboard: OverviewIndicator[]
  map: OverviewMapPoint[]
  apps: OverviewApp[]
}
```

---

## UseCases

Em `src/modules/auth/data/application`. Composição por **factory explícita**
(sem DI global), padrão da `authentication.md`.

| UseCase                      | Assinatura                                              |
| ---------------------------- | ------------------------------------------------------- |
| `makeLoginUseCase()`         | `(Credentials) => Promise<AsyncResult<AuthSession>>`    |
| `makeGetLoginOverviewUseCase()` | `() => Promise<AsyncResult<LoginOverview>>`          |
| `makeRecoverPasswordUseCase()` | `(email) => Promise<AsyncResult<void>>` (spec própria)|

---

## Repositories

Contratos em `domain/repositories`; implementações em `data/repositories`.

| Repository           | Responsabilidade                                            |
| -------------------- | ----------------------------------------------------------- |
| `AuthRepository`     | `login(Credentials)`, `recoverPassword(email)`              |
| `SessionRepository`  | `save(session, keepSignedIn)`, `read()`, `clear()`, `rememberEmail(email)`, `readEmail()`, `clearEmail()` |
| `OverviewRepository` | `getOverview()` — panorama público (`GET /public/login-overview`) |

`SessionRepositoryImpl` usa `KeyValueStore`: `localKeyValueStore` quando
`keepSignedIn`; `sessionKeyValueStore` caso contrário. Chaves:
`espacon.auth.session`, `espacon.auth.rememberedEmail`.

---

## Providers

Em `data/providers`. Fase mock:

| Provider              | Papel                                                       |
| --------------------- | ----------------------------------------------------------- |
| `MockAuthProvider`    | valida credencial fixa; devolve `AuthSession` mock          |
| `MockOverviewProvider`| devolve o JSON de `GET /public/login-overview` (mock realista) |

Integração real (futura): `RestAuthProvider` e `RestOverviewProvider` consumindo
o `HttpClient` — **sem alterar** stores/pages (troca só na camada `data`).

---

## Stores

`src/modules/auth/presentation/stores`. Pinia *setup stores*; ambas estendem
`useBaseStore` (não são CRUD). Instância por tela. Responsabilidade única:

- `useAuthStore` — estado do formulário (`email`, `password`, `showPassword`,
  `rememberEmail`, `keepSignedIn`), `submit()`, leitura/limpeza de sessão e
  e-mail lembrado, redirecionamento.
- `useLoginOverviewStore` — `load()` do panorama público, expõe `dashboard`,
  `map`, `apps` (arrays dinâmicos) + `loading`/`hasError` herdados do `BaseStore`.

Separar as duas evita acoplar o panorama à ação (login) e respeita SRP. Os
componentes de exibição (`DashboardSummary`, `MapPreview`, `AppCarousel`) são
**puros**: recebem os dados por prop e não conhecem a origem (store/API).

---

## Mock Inicial

- `MockAuthProvider`: aceita `admin@noturno.com.br`/`noturno` → sessão `admin`
  `global`; qualquer outra → `authError('E-mail ou senha inválidos.')`. Latência
  simulada (~400 ms) para exercitar loading.
- `MockOverviewProvider`: devolve o JSON de `GET /public/login-overview` —
  dashboard com 7 indicadores não-financeiros, ~11 pontos de cidades brasileiras
  reais (lat/long + `activeUsers`) e os 5 apps do ecossistema. Editar o mock
  reflete na UI sem tocar em componente.
- Mapa em mock: **placeholder leve** (SVG do Brasil com pontos) — sem instalar
  lib de mapa nesta fase (ver "Integração Real").
- **Onde trocar o mock pela API**: `data/providers/mock-overview-provider.ts` →
  criar `RestOverviewProvider` (via `HttpClient`) e referenciá-lo em
  `data/application/get-login-overview-usecase.ts`. Nada acima muda.

---

## Integração Real

- Substituir `MockAuthProvider`/`MockShowcaseProvider` por providers REST
  (`HttpClient`), sem tocar em stores/pages.
- Definir token/expiração/renovação → novo ADR que refina o ADR-003; trocar a
  persistência provisória do ADR-005 por token/cookie seguro.
- **Lib de mapa** (Leaflet / MapLibre / NoturnoMAPS): adoção de dependência
  exige **ADR próprio** antes de instalar (regra do template). Até lá, o mapa é
  o placeholder SVG.
- Confirmar com o backend o **endpoint público** da vitrine e a granularidade
  permitida (ADR-007).

---

## Design System Aplicado

Paleta oficial (template / `--color-noturno-*`). Tema dark-first.

| Elemento                          | Cor                              | Token                         |
| --------------------------------- | -------------------------------- | ----------------------------- |
| **CTA primário "ENTRAR"** / sucesso/entrada | **dourado/laranja**     | `orange #FFB621` → hover `orangeDark #FF9500` |
| Texto sobre o CTA dourado         | preto (contraste)                | `black #040404`               |
| Ações destrutivas / negação / erro| **vermelho**                     | `red #FF2626`                 |
| Feedback de sucesso (toast/badge) | verde                            | `green #00BA81`               |
| Superfícies (fundo, cards)        | pretos/cinzas                    | `black2 #1C1C1C`, `blackSecondary #131417`, `greyDark #2E2F36`, `greyLightClean2 #27272A` |
| Texto principal / secundário      | branco / cinza                   | `white #FFFFFF` / `greyLight #999999` |
| Bordas / divisores                | cinza                            | `greyLightClean3 #3F3F47`     |

Regras visuais (de `docs/ui`): flat design, cards, botões arredondados, campos
clean, ícones quando fizer sentido. **Proibido** usar cor fora da paleta.

> O **único** elemento dourado de destaque na coluna de acesso é o botão ENTRAR
> (efeito de isolamento / Von Restorff: a cor de maior contraste guia o olho à
> ação). Links secundários ("Recuperar senha") ficam discretos (cinza/dourado
> sutil).

---

## Padrões de UI e Marketing Aplicados

A vitrine não é decoração: aplica padrões de conversão consolidados.

- **Prova social** — mapa de presença + "usuários ativos agora" comunicam que o
  ERP é usado e confiável (reduz percepção de risco).
- **Autoridade / marca** — missão, visão e metas posicionam a Noturno.
- **Abrangência** — contadores de cidades/estados/clientes mostram alcance.
- **Baixo atrito** — poucos campos, mostrar/ocultar senha, e-mail lembrado,
  CTA único e inequívoco; nada compete com "ENTRAR".
- **Hierarquia visual** — ação à esquerda (foco de tarefa), persuasão à direita;
  no mobile a ação vem primeiro (nunca abaixo da dobra).
- **Microinterações flat** — contadores com *count-up* sutil ao carregar; sem
  skeumorfismo. Movimento curto, respeitando `prefers-reduced-motion`.
- **Estados sempre tratados** — loading, vazio e erro na vitrine e no formulário
  (regra de `docs/ui`).
- **Confiança junto ao CTA** — nota curta de segurança ("seu acesso é protegido")
  próxima ao botão.
- **Acessibilidade** — contraste AA (dourado sobre fundo escuro e texto preto
  sobre dourado passam), navegação por teclado, `label` em todos os campos,
  foco visível.

---

## Impactos

- `src/modules/auth/` — domain (models/repositories), data
  (application/repositories/providers/mocks), presentation (pages/stores/widgets).
- `src/router` — rotas `/` (login), `/recuperar-senha`; guard que redireciona
  para `/dashboard` quando há sessão salva.
- `src/shared/storage` — uso de `KeyValueStore` (sem alteração de contrato).
- `src/shared/extensions/email-ext.ts` — validação de e-mail.
- `src/app/globals.css` — tokens de cor já existentes (sem novas cores).
- Docs: esta spec; `authentication.md` (referência cruzada); **ADR-007** (novo).

---

## Base de Conhecimento

Ao concluir, atualizar a Ajuda com:

- **Nome**: Login / Acesso ao EspaçoN.
- **O que faz**: autentica o usuário e apresenta a vitrine institucional.
- **Onde acessar**: rota `/` (tela inicial).
- **Como usar**: informar e-mail e senha; opções "Lembrar e-mail" e "Manter
  acesso"; link "Recuperar senha".
- **Regras**: senha nunca é salva no navegador; sem "Manter acesso", a sessão
  cai ao fechar a aba.
- **Permissões**: o que o usuário vê após o login depende de `role`/`accessScope`
  (ADR-006).
- **Privacidade**: a vitrine usa apenas dados públicos agregados (ADR-007).

---

## Relação com ADRs

- Depende do **ADR-001** (mock-first) e do **ADR-002** (stack).
- Refina/usa **ADR-003** (auth mock, token deferido).
- Usa **ADR-005** (persistência de sessão provisória).
- Usa **ADR-006** (acesso multiempresa).
- Introduz **ADR-007** (dados públicos pré-login — vitrine).
- Lib de mapa exigirá um ADR próprio antes de ser adotada.

---

## Pendências para você

- [ ] Confirmar o **conjunto final de indicadores** não-financeiros do dashboard
      (o mock traz 7; a UI aceita qualquer quantidade).
- [ ] Confirmar a **lista oficial de apps** do ecossistema e seus `status`.
- [ ] Confirmar granularidade do mapa público (contagem exata por cidade vs.
      faixas) — fecha o ADR-007.
- [ ] Confirmar se "usuários online/ativos" exibe número exato ou aproximado.
- [ ] Definir o endpoint real `GET /public/login-overview` no backend.
- [ ] Escolher a lib de mapa quando partir para integração (abre ADR próprio).
