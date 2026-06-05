# Main Layout (Tela Principal)

## Objetivo

A tela principal é o ponto central do sistema Helpdesk após a autenticação do usuário.

Seu objetivo é fornecer acesso rápido aos módulos do sistema, exibir indicadores relevantes conforme o perfil do usuário e centralizar notificações, informações de conta e atalhos operacionais.

---

# Visão Geral

A estrutura da tela é composta por três áreas principais:

```text
┌─────────────────────────────────────────────────────────────┐
│ Navbar Superior                                             │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│ Menu Lateral   │            Dashboard                       │
│ Responsivo     │                                            │
│                │                                            │
└────────────────┴────────────────────────────────────────────┘
```

---

# Layout

## Navbar Superior

Localizada no topo da aplicação.

### Componentes

* Botão expandir/recolher menu lateral
* Campo de pesquisa rápida
* Central de notificações
* Nome do usuário logado
* Avatar do usuário
* Menu de perfil

### Ações do Perfil

* Meu Perfil
* Alterar Senha
* Preferências
* Sair

---

## Menu Lateral

Localizado à esquerda da aplicação.

### Características

* Responsivo
* Expansível
* Recolhível
* Ícones sempre visíveis
* Texto exibido apenas quando expandido
* Scroll automático quando necessário

### Identidade Visual

Deve seguir o mesmo padrão visual da tela de login.

### Cores

Utilizar exclusivamente o Design System da Noturno Softwares.

Principais cores:

| Nome        | Cor     |
| ----------- | ------- |
| Orange      | #FFB621 |
| Orange Dark | #FF9500 |
| Grey Dark   | #2E2F36 |
| Black       | #040404 |
| White       | #FFFFFF |

---

# Cabeçalho do Menu

Componentes:

* Logo da empresa
* Nome do sistema
* Versão atual

Exemplo:

```text
┌──────────────────┐
│      LOGO        │
│ Helpdesk         │
│ v1.0.0           │
└──────────────────┘
```

---

# Estrutura Inicial dos Menus

## Dashboard

* Dashboard Principal

---

## Clientes

* Cadastro de Clientes
* Contratos
* Licenças
* Telefones
* Situação Financeira

---

## Atendimento

* Chamados
* Histórico
* Agendamentos

---

## Financeiro

* Contas a Receber
* Contas a Pagar
* Boletos
* PIX
* Fluxo de Caixa

---

## Administração

* Usuários
* Perfis
* Permissões
* Configurações

---

## Ajuda

* Base de Conhecimento
* Tutoriais
* Novidades
* Suporte

---

# Dashboard Central

O dashboard deve ser dinâmico.

Nenhum card deverá ser exibido sem validação de permissão.

---

# Controle por Permissões

O backend é responsável por fornecer as permissões do usuário autenticado.

Exemplo:

```json
{
  "user": {
    "id": 1,
    "name": "Glenio",
    "profile": "Administrador"
  },
  "permissions": [
    "dashboard.view",
    "clients.view",
    "clients.edit",
    "financial.view",
    "support.view",
    "users.manage"
  ]
}
```

---

# Regras de Exibição

## Menus

O menu somente será exibido se o usuário possuir a permissão correspondente.

Exemplo:

```text
financial.view
```

Exibe:

```text
Financeiro
```

---

## Botões

Botões de edição, exclusão ou ações administrativas devem respeitar permissões específicas.

Exemplo:

```text
clients.edit
clients.delete
users.manage
```

---

## Dashboard

Cada widget do dashboard deve possuir sua própria permissão.

Exemplo:

```text
financial.summary.view
support.summary.view
clients.summary.view
```

---

# Dashboard por Perfil

## Administrador

Visualiza:

* Clientes
* Contratos
* Licenças
* Financeiro
* Chamados
* Usuários
* Indicadores Gerais

---

## Financeiro

Visualiza:

* Contas a Receber
* Contas a Pagar
* Fluxo de Caixa
* Inadimplência
* Boletos Pendentes

---

## Atendimento

Visualiza:

* Chamados Abertos
* Chamados Pendentes
* Chamados em Atraso
* Clientes Aguardando Retorno

---

# Widgets do Dashboard

Cada card deverá ser tratado como um componente independente.

Estrutura sugerida:

```typescript
interface DashboardWidget {
  id: string;
  title: string;
  permission: string;
  order: number;
}
```

---

# Responsividade

## Desktop

* Menu expandido por padrão
* Dashboard em múltiplas colunas

---

## Tablet

* Menu recolhido por padrão
* Dashboard reorganizado

---

## Mobile

* Menu tipo Drawer
* Dashboard em coluna única

---

# Notificações

O sistema deverá possuir central de notificações.

Tipos:

* Novo chamado
* Chamado atrasado
* Boleto vencido
* Contrato vencendo
* Licença vencendo
* Avisos administrativos

---

# Base de Conhecimento

Todo novo recurso implementado deverá possuir documentação correspondente.

O menu "Ajuda" será responsável por disponibilizar:

* Manual do sistema
* Fluxos operacionais
* Regras de negócio
* Exemplos de uso
* Perguntas frequentes

---

# Critérios de Aceite

## Layout

* Menu lateral responsivo
* Navbar superior funcional
* Dashboard central responsivo

## Segurança

* Menus controlados por permissão
* Botões controlados por permissão
* Widgets controlados por permissão

## Experiência do Usuário

* Navegação rápida
* Interface moderna
* Compatibilidade com desktop, tablet e mobile

## Manutenção

* Componentes reutilizáveis
* Dashboard configurável
* Estrutura preparada para expansão futura
* Integração desacoplada do backend através de APIs REST

```
```
