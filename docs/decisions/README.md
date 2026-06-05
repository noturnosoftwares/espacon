# Decisões Arquiteturais (ADR) — HelpDesk

> Decisões **corporativas** (camadas, mock-first, AsyncResult, mappers, etc.)
> vivem no template. Aqui ficam apenas as decisões **de produto** do HelpDesk.
> Estrutura do ADR: ver `../noturno-web-template/docs/decisions/README.md`.

---

## ADR-001 — Dark First

**Contexto:** o produto precisa de identidade visual própria da Noturno.
**Decisão:** o sistema nasce em tema escuro usando a paleta oficial. Modo Light
poderá ser avaliado futuramente.
**Consequências:** `globals.css` define fundo escuro padrão e expõe a paleta como
tokens Tailwind (`--color-noturno-*`); componentes assumem superfícies escuras.

---

## ADR-002 — Landing/Login antes do Dashboard

**Contexto:** o sistema não deve abrir direto no dashboard.
**Decisão:** a rota raiz `/` é uma tela inicial institucional integrada ao login
(esquerda: autenticação; direita: apresentação do portal). O fluxo é
`Landing/Login → Autenticação → Dashboard`.
**Consequências:** o dashboard (`/dashboard`) é, por ora, um placeholder
temporário; o acesso depende de login bem-sucedido.

---

## ADR-003 — Sessão mock provisória / sem container global de DI

**Contexto:** ainda não há contrato/API real de autenticação.
**Decisão:** a autenticação inicia mockada (credencial fixa documentada). A
estratégia definitiva de sessão (token, persistência, guards de rota) só será
definida com a API real. Não criar container global de DI: a composição é
explícita via factory (`makeLoginUseCase()`).
**Consequências:** após o login mock, redireciona para `/dashboard`; não há
sessão global persistida nem middleware/guard ainda. O provider mock será
substituído por um provider de API + mapper sem impacto nas camadas acima.

---

## ADR-006 — UI controlada por permissão + app shell reutilizável

**Contexto:** a tela principal (`docs/screens/home-layout.md`) exige menus,
widgets e botões controlados por permissão, com layout responsivo (navbar + menu
lateral + dashboard). O backend fornecerá as permissões do usuário.
**Decisão:** centralizar a verificação de acesso em `PermissionExt.has()`
(`@/shared/extensions`), com coringa global `"*"` e por prefixo `"area.*"`. A
filtragem é **regra de aplicação** (UseCase `GetDashboardUseCase` e função
`buildNavigation`), nunca na presentation. O menu é configuração de produto local
(não vem da API); apenas as permissões vêm do usuário. O shell (navbar + menu) é
um `AppShell` reutilizável; o estado de layout (expandir/recolher, drawer) vive em
`LayoutStore`. Ícones são referidos por chave estável (`IconKey`) para manter
domain/data livres de componentes de UI.
**Consequências:** novo módulo `src/modules/home`. Itens de módulos ainda
inexistentes aparecem sem `href` (placeholder, sem 404). O guard de acesso é
client-side (restaura sessão; sem sessão → login), coerente com o ADR-005; um
guard de servidor será avaliado com a sessão real.

---

## ADR-005 — Persistência de sessão provisória (local) + e-mail lembrado

**Contexto:** a opção "Manter acesso" e o pré-preenchimento do e-mail eram
coletados mas não persistidos (ADR-003 deferiu a estratégia definitiva de
sessão). Ainda não há API/token real.
**Decisão:** implementar persistência **provisória** no armazenamento local do
navegador, isolada atrás do contrato `SessionRepository`:

- "Manter acesso" marcado → sessão em `localStorage` (sobrevive ao fechamento);
- desmarcado → `sessionStorage` (apenas enquanto a aba estiver aberta);
- o último e-mail usado é lembrado em `localStorage` para pré-preencher o login.

O acesso ao Web Storage fica atrás de `@/shared/storage` (`KeyValueStore`,
SSR-safe). Ao montar, a tela de login tenta `restore()` e, havendo sessão,
redireciona ao dashboard; o logout (`SignOutButton`) limpa a sessão.
**Consequências:** entrega o benefício real de "Manter acesso" sem aguardar a
API. Não é autenticação segura (dados locais, sem token/assinatura) — quando a
API real existir, criar nova implementação de `SessionRepository` (token/cookie)
sem impacto em Store/Presentation. Não há, ainda, guard de rota no `/dashboard`
(o acesso direto continua possível; será tratado com a sessão real). Refina, mas
não revoga, o ADR-003.

---

## ADR-004 — Estrutura `src/` adotada

**Contexto:** o boilerplate iniciou com `app/` na raiz; o template corporativo
define o layout sob `src/` (`src/app`, `src/modules`, `src/shared`).
**Decisão:** mover `app/` → `src/app/` e estabelecer `src/modules` e `src/shared`
já na primeira funcionalidade, evitando refatoração estrutural futura.
**Consequências:** path alias `@/*` aponta para `./src/*`; `public/` e configs
permanecem na raiz (exigência do Next).
