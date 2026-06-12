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

## Recuperação de Senha

- **O que faz**: solicita a redefinição da senha a partir do e-mail da conta.
- **Onde acessar**: link **"Esqueci minha senha"** no login → rota `/recuperar-senha`.
- **Como usar**: informe o e-mail e clique em **Enviar instruções**. Em seguida a
  tela confirma que, **se houver uma conta** associada, as instruções serão
  enviadas. Dá para **Reenviar para outro e-mail** ou **Voltar ao login**.
- **Regras**:
  - **Privacidade/anti-enumeração**: o sistema **nunca** informa se o e-mail
    existe — a confirmação é sempre genérica.
  - E-mail com formato inválido mostra erro e **não** envia.
  - Nenhuma sessão é criada aqui.
  - Fase atual **mock-first**: o envio é simulado (sempre "sucesso").
- **Impactos**: módulo `src/modules/auth`; rota `/recuperar-senha`.
- **Especificação**: `docs/specifications/auth/password-recovery.md`.

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

---

## Usuários, Perfis e Permissões

- **O que faz**: cadastra e mantém **usuários**, **perfis** (modelos de cadastro)
  e **permissões** por recurso × ação, com dados de acesso (operador de caixa,
  remoto, restrição de horário/IP).
- **Onde acessar**: `/usuarios` e `/perfis` (exige sessão).
- **Como usar**:
  - **Pesquisa** — a tela **abre vazia**; digite e pressione **Enter** (ou clique
    em **Buscar**). A lista usa **scroll infinito**: role para baixo e novos
    registros carregam sozinhos (lotes de 30), com indicador no rodapé enquanto
    houver dados — **não há botões de página**.
  - **Filtro de Situação** (só em Usuários) — escolha **Todas**, **Ativos** ou
    **Inativos**; o filtro **refina a lista já carregada na hora** (não precisa de
    Enter e **não** refaz a consulta) e é enviado ao servidor **como parâmetro** na
    próxima busca. O botão **"Limpar"** ao lado da busca aparece sempre que houver
    termo ou situação aplicados e reseta tudo, recarregando a lista.
  - **Sem resultados** — a tela mostra o termo buscado **em vermelho** e o botão
    **"Limpar filtros"**, que limpa o termo **e** a situação e recarrega a lista
    completa.
  - **Cadastro/edição** — clique numa linha (ou **Novo usuário**). Os campos ficam
    agrupados por contexto; **Salvar/Cancelar** aparecem só quando há alteração.
  - **Operador de caixa** — ao marcar "Operador" escolha o **tipo**: *ilimitado*
    ou *limitado*. No **limitado**, o **Operador** é um **campo de busca** (não se
    digita o código): clicar abre a **listagem de Operadores de Caixa em modo
    seleção**; escolha um operador **ativo** (clique/Enter) para devolvê-lo ao
    cadastro. O campo passa a mostrar "código — nome".
  - **Matriz de permissões** — acima da matriz há um **filtro** para achar um
    recurso específico (por descrição ou código). Ele **refina a lista na hora**
    (local, sem requisição); os toggles de coluna/sessão passam a agir sobre os
    recursos visíveis e os contadores seguem mostrando o total.
  - **Perfil (modelo)** — é um **campo de busca**: clique para abrir a **própria
    listagem de perfis em modo seleção** (não há tela de busca separada). Pesquise,
    e **clique no perfil** (ou pressione **Enter**) para devolvê-lo ao cadastro;
    use **Ver detalhes** (botão que aparece **só no modo seleção**) se quiser abrir
    o perfil antes de escolher, e **Cancelar seleção** para voltar sem escolher. Se
    você abrir um perfil em detalhes (ou criar um **Novo perfil**) durante a
    seleção, ao voltar **continua no modo seleção** e o registro editado/incluído
    fica disponível para escolher. Ao confirmar, o sistema pede confirmação e
    as ações do perfil **preenchem toda a matriz de permissões** do usuário
    (sobrescrevem o que estava marcado). O perfil não concede acesso por si —
    apenas copia as ações. O cadastro em andamento é **preservado** no ida-e-volta.
  - **Cancelar** — se houver alterações não salvas, o sistema **pergunta antes**
    ("Cancelar alterações?"). Ao confirmar: na edição, **desfaz as alterações e
    mantém você no registro** (restaura o original); num registro novo, **volta
    para a lista**.
  - **Erros ao salvar** — falha de validação ou de gravação mostra o aviso no topo
    + marca os campos **e** dispara um **toast** com a mesma mensagem.
- **Regras**: o **perfil não concede acesso** (apenas copia/redefine ações); a
  autorização lê sempre `user.permissions`. Multiempresa via `role`/`accessScope`
  (ADR-006). Decisões de comportamento: **scroll infinito** (template ADR-002),
  **cancelar restaura/permanece** (template ADR-001) e **listagem como consulta
  reutilizável / modo seleção** (template ADR-003).
- **Permissões**: acesso por (recurso, ação); ver a matriz na própria tela.
- **Impactos**: módulo `src/modules/users`; `shared/access`; `shared/selection`
  (canal de seleção); grid/estado em `shared/widgets` (`PageContainer`,
  `BaseDataTable`, `EmptyState`, `LookupField`) e `shared/stores` (`BaseCrudStore`).
- **Especificação**: `docs/specifications/users/users-and-permissions.md`.

---

## Operadores de Caixa

- **O que faz**: mantém o **registro mestre** de operadores de caixa (`código` +
  `nome` + situação), fonte única referenciada pelo cadastro de usuário (operador
  limitado) e, futuramente, pelos módulos financeiros.
- **Onde acessar**: menu **Financeiro → Operador de Caixa** (rota
  `/operadores-de-caixa`; exige sessão).
- **Como usar**:
  - **Pesquisa** — a tela **abre vazia**; digite código ou nome e pressione
    **Enter** (ou **Buscar**). A lista usa **scroll infinito** (lotes de 30).
  - **Filtro de Situação** — **Todas**, **Ativos** ou **Inativos**; refina a lista
    já carregada na hora (não refaz a consulta) e vai ao servidor como parâmetro na
    próxima busca. **Limpar** reseta termo e situação.
  - **Cadastro/edição** — **Novo operador** ou clique numa linha. Informe
    **código** (único; **não pode ser alterado** depois) e **nome**, e use o switch
    **Operador ativo**. **Salvar** aparece só quando há alteração; código repetido
    mostra erro e toast.
  - **Inativar** — em vez de excluir, o operador é **inativado** (deixa de aparecer
    nos seletores, mas o histórico que o referencia é preservado). Para reativar,
    abra o registro e ligue **Operador ativo**.
  - **Modo seleção** — quando aberto a partir do cadastro de usuário, a tela entra
    em **modo seleção**: clique/Enter na linha devolve o operador; **Ver detalhes**
    (botão de ícone) abre o registro; **Cancelar seleção** volta sem escolher.
- **Regras**: código **único** e **imutável** após a criação; **excluir =
  inativação** (soft); só **ativos** entram nos seletores. Decisões de
  comportamento: **scroll infinito** (template ADR-002), **cancelar
  restaura/permanece** (template ADR-001) e **modo seleção** (template ADR-003).
- **Permissões**: recurso **Operador de Caixa** (`FIN-007`) no catálogo, sessão
  Financeiro, com as 9 ações.
- **Impactos**: módulo `src/modules/cash-operators`; vínculo no usuário via
  `CashOperatorAssignment` + canal `shared/selection`.
- **Especificação**: `docs/specifications/financial/cash-operator.md`.

---

## Funcionários

- **O que faz**: cadastra e mantém o **quadro de pessoal** (dados pessoais,
  endereço, contato, contrato e dados bancários), com validações rigorosas.
- **Onde acessar**: menu **Pessoal → Funcionário** (rota `/funcionarios`; exige sessão).
- **Como usar**:
  - **Pesquisa** — a tela **abre vazia**; busque por **nome, apelido ou CPF** e
    pressione **Enter**. **Filtro de Situação** (Todas/Ativos/Afastados/Demitidos)
    refina a lista carregada na hora. Lista com **scroll infinito**.
  - **Cadastro/edição** — **Novo funcionário** ou clique numa linha. Campos
    agrupados por contexto (Identificação, Filiação & Naturalidade, Endereço,
    Contato, Contrato, Representação, Dados Bancários). O cabeçalho mostra o
    **código** (badge "Novo"/`Cód.`) e a **situação** (Ativo/Afastado/Demitido).
  - **Cidade** é um **campo de busca** (digite ≥ 2 letras) que **preenche a UF**
    automaticamente. **Representante** aparece como busca quando "É representante?"
    está ligado.
  - **Salvar** aparece só quando há alteração; pendências de validação mostram
    resumo no topo + marcação nos campos + toast.
- **Regras de validação**: CPF válido e **único**; **nome composto** (nome e nome
  da mãe); **celular** (DDD + 9 dígitos); **CEP coerente com a UF**; **admissão**
  não-futura; **idade ≥ 18** se o nascimento for informado; **demissão**
  obrigatória quando a situação é **Demitido**. Comissão é **percentual (%)**.
- **Permissões**: recurso **Funcionário** (`ADM-003`) no catálogo, com as 9 ações.
- **Impactos**: módulo `src/modules/employees`; `Address` compartilhado em
  `shared/models`; widgets `RecordCodeBadge`/`SearchLookupField` em `shared/widgets`;
  validações em `shared/extensions`.
- **Especificação**: `docs/specifications/employees/employee-registration.md`.
