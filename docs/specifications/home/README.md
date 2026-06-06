# Home - EspaçoN

## Objetivo

A Home do EspaçoN será a porta de entrada principal do sistema.

O objetivo não é reproduzir um dashboard SaaS genérico nem uma tela de ERP tradicional com dezenas de menus.

A Home deve transmitir:

* Organização
* Tecnologia
* Presença da rede Noturno
* Facilidade de navegação
* Identidade própria

A tela deve servir como base para todos os módulos futuros.

---

# Status

**Implementada (Fase 3) — mock-first**, conforme o mock `docs/screens/screen_home.png`.
Rota `/dashboard` (protegida por sessão). Módulo `src/modules/home`:

- **Header** — busca global ampla à esquerda (atalho Ctrl + K), notificações
  (badge), Ajuda e menu de perfil com **Sair** (logout limpa a sessão e volta ao
  login). A marca EspaçoN fica no topo da Sidebar.
- **Sidebar** — marca **EspaçoN** no topo + `NavigationTile` em **linha** (ícone à
  esquerda, rótulo), área clicável ampla; o item **ativo** recebe **cantos em "L"
  laranja**. Rodapé **Recolher menu** (modo só-ícone). Scrollbar fina da
  identidade. Config em `data/mocks/mock-nav.ts`; grupos sem tela são inertes
  ("em breve") (ADR-006). Ordem: **Início, Sistema, Atendimento, Financeiro,
  Compra, Frota, Pessoal, Imobiliário, Ajuda**.
- **Workspace** — **painel inicial (dashboard)** dirigido por dados
  (`GET /home/dashboard`, mock nesta fase) com apenas indicadores
  **não-financeiros**:
  - **Saudação** dinâmica (Bom dia/tarde/noite + nome da sessão) e data atual;
  - **KPIs**: Usuários online, Clientes ativos, Licenças ativas, Chamados
    abertos, Contratos vencendo (com tendência);
  - **Meus Favoritos** (atalhos), **Acessos Recentes**, **Pendências**;
  - **Atividades Recentes** e **Status da Rede Noturno** (mapa compartilhado
    `@/shared/widgets/brazil-points-map` + legenda).
  Componentes de exibição são **puros** (recebem dados por prop); o container
  (`HomeWorkspace`) conhece a store. Trata loading e erro.

> **Atualização (mock do produto).** O Workspace deixou de ser apenas a
> mensagem de boas-vindas e passou a ser o painel completo acima. A `NavigationTile`
> é em **linha** (ícone + rótulo, "L" no ativo). As seções "Sidebar"/
> "NavigationTile"/"Workspace > Primeira versão" abaixo são o conceito original e
> permanecem como referência histórica.

A paleta segue 100% a oficial (sem cores fora da paleta): o roxo do mock foi
substituído por azul-claro on-palette. Itens já cobertos da "Próxima Etapa":
dashboard institucional, mapa da rede, indicadores operacionais, central de
atividades e favoritos — restam busca inteligente e widgets por perfil.

---

# Estrutura Inicial

A aplicação será dividida em 3 áreas principais:

```text
┌───────────────────────────────────────────────────────────────┐
│                         Header                               │
├────────────┬─────────────────────────────────────────────────┤
│            │                                                 │
│ Sidebar    │                 Workspace                       │
│            │                                                 │
│            │                                                 │
└────────────┴─────────────────────────────────────────────────┘
```

---

# Sidebar

A Sidebar será o principal mecanismo de navegação do sistema.

## Características

* Largura aproximada entre 90px e 100px
* Fundo escuro
* Navegação vertical
* Ícones acima
* Texto abaixo
* Itens centralizados
* Sem menu horizontal tradicional

---

## NavigationTile

Cada item da navegação utilizará um componente chamado:

```text
NavigationTile
```

### Estrutura

```text
┌─────────┐
│   Icon  │
│  Texto  │
└─────────┘
```

### Estado Ativo

* Fundo mais claro
* Ícone laranja
* Texto laranja
* Destaque em formato de L nos cantos esquerdo superior e esquerdo inferior
* Bordas arredondadas

### Estado Inativo

* Ícone cinza
* Texto cinza
* Hover suave

### Restrições

Não utilizar:

* Barra colorida lateral
* Menus AdminLTE
* Menus padrão de templates SaaS
* Ícone e texto lado a lado

---

# Módulos Principais

A estrutura atual de negócio deverá ser preservada.

## Menus

### Sistema

* Agenda Telefônica
* Perfil de Usuário
* Usuário
* Baixar Arquivo
* Enviar Contrato
* iToken
* NoturnoMAPS
* Relatórios
* Validar Versões
* Sair

---

### Atendimento

* Atendimento
* Suporte Remoto
* Agendar Cancelamento
* Cadastro de Cliente
* Chamado REDE
* Membro.REDE
* Comunicado
* Enquete

---

### Compra

* Fornecedor

---

### Financeiro

* Caixa
* Contas a Pagar
* Contas a Receber
* Controle de Cheque
* Recibo
* Crédito de Cliente
* Comissão de Representante
* Carregar Contas a Receber
* Exportar Contatos
* Faturar NFS-e

---

### Frota

* Veículo

---

### Imobiliário

* Reservado para futuras funcionalidades

---

### Pessoal

* Funcionário
* Conta Corrente (Vales)

---

### Ajuda

* Reservado para futuras funcionalidades

---

# Header

O Header ficará na parte superior da aplicação.

## Estrutura

```text
[ Busca Global ]                     [ Notificação ] [ Ajuda ] [ Perfil ]
```

---

## Busca Global

Placeholder:

```text
Buscar cliente, contrato, licença, chamado...
```

Características:

* Campo grande
* Ícone de busca
* Atalho visual Ctrl + K
* Bordas arredondadas
* Visual premium

---

## Área do Usuário

Exibir:

* Avatar
* Nome
* Cargo/Função

Exemplo:

```text
Glenio Duarte
Administrador
```

---

## Notificações

Exibir:

* Quantidade pendente
* Menu de notificações futuras

---

# Workspace

Área central da aplicação.

Inicialmente não conterá dashboards.

Objetivo:

* Receber dashboards
* Receber formulários
* Receber grids
* Receber relatórios
* Receber módulos futuros

---

## Primeira versão

Exibir apenas:

```text
Bem-vindo ao EspaçoN

Central de Gestão da Noturno Softwares
```

Sem cards.
Sem gráficos.
Sem tabelas.

---

# Princípios de Design

## Deve parecer

* Software corporativo premium
* Sistema proprietário
* Produto da Noturno Softwares

---

## Não deve parecer

* Template comprado
* Dashboard genérico de IA
* AdminLTE
* CRM americano padrão
* SaaS genérico

---

# Próxima Etapa

Após a conclusão da estrutura base:

1. Dashboard institucional
2. Mapa da rede Noturno
3. Carrossel de aplicativos
4. Indicadores operacionais
5. Busca global inteligente
6. Central de atividades
7. Widgets personalizados por perfil
8. Favoritos do usuário

```
```
