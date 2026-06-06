# Base de Conhecimento — Ajuda

Índice da Ajuda do EspaçoN. Cada funcionalidade relevante registra aqui um verbete
(regra corporativa: nenhuma funcionalidade é concluída sem atualizar a Base de
Conhecimento).

---

## Login / Acesso ao EspaçoN

- **O que faz**: autentica o usuário no EspaçoN e, na mesma tela, apresenta o
  **panorama público da rede Noturno** — dashboard de indicadores
  não-financeiros, mapa discreto de pontos de atuação e carrossel do ecossistema
  de apps (DoctorCar, Sales, Stock, ZW, Delivery…).
- **Onde acessar**: rota `/` (tela inicial).
- **Como usar**: informe e-mail e senha e clique em **Entrar**. Use o botão de
  olho para mostrar/ocultar a senha. Opções:
  - **Lembrar e-mail** — pré-preenche o e-mail no próximo acesso.
  - **Manter acesso** — mantém você conectado mesmo após fechar o navegador.
  - **Recuperar senha** — leva à tela de recuperação (`/recuperar-senha`).
- **Regras**:
  - A **senha nunca é salva** no navegador (existe só em memória durante o envio).
  - Sem "Manter acesso", a sessão **cai ao fechar a aba**.
  - Abrir o login já com sessão salva válida redireciona direto ao `/dashboard`.
  - Fase atual **mock-first**: credencial de teste `admin@noturno.com.br` /
    `noturno`; qualquer outra combinação retorna "E-mail ou senha inválidos.".
- **Permissões**: o que o usuário vê após o login depende de `role`/`accessScope`
  (multiempresa — ver ADR-006).
- **Privacidade**: o panorama usa **apenas dados públicos agregados e
  não-financeiros** por cidade, sem identificar clientes (ver ADR-007). Fonte:
  `GET /public/login-overview` (mock nesta fase).
- **Impactos**: módulo `src/modules/auth`; rotas `/`, `/dashboard`,
  `/recuperar-senha`; persistência provisória de sessão (ADR-005).
- **Especificação**: `docs/specifications/auth/login.md`.

---

## Home / Central de Gestão

- **O que faz**: é a porta de entrada do sistema após o login — Header + Sidebar +
  um **painel inicial (dashboard)** com indicadores não-financeiros, favoritos,
  acessos recentes, pendências, atividades e status da rede.
- **Onde acessar**: rota `/dashboard` (exige sessão; o login redireciona para cá).
- **Como usar**:
  - **Painel** — saudação com seu nome e a data; cartões de indicadores
    (usuários online, clientes, licenças, chamados, contratos); **Meus Favoritos**
    (atalhos), **Acessos Recentes**, **Pendências**, **Atividades Recentes** e
    **Status da Rede Noturno** (mapa).
  - **Busca global** (topo) — atalho **Ctrl + K** foca o campo (busca inteligente
    é etapa futura).
  - **Sidebar** (esquerda) — `NavigationTile` com **Início** ativo; demais módulos
    "em breve". **Recolher menu** no rodapé alterna o modo compacto.
  - **Perfil** (topo direito) — nome/cargo e **Sair** (encerra a sessão).
  - **Notificações** (sino) — quantidade pendente; central de notificações futura.
- **Regras**:
  - O que aparece na navegação respeitará `role`/`accessScope` (ADR-006) quando os
    módulos existirem; itens não implementados ficam inertes (sem 404).
  - O **Sair** limpa a sessão; o e-mail lembrado é preservado para o próximo acesso.
- **Privacidade**: o painel mostra **apenas dados operacionais não-financeiros**
  (sem faturamento/boletos/contas). Fonte: `GET /home/dashboard` (mock nesta fase).
- **Impactos**: módulo `src/modules/home`; rota `/dashboard`; navegação em
  `data/mocks/mock-nav.ts`; dashboard em `data/mocks/mock-home-dashboard.ts`;
  sessão via `useSessionStore` (auth); mapa em `@/shared/widgets/brazil-points-map`.
- **Especificação**: `docs/specifications/home/README.md`.
