# Navegação e Menus

## Objetivo

Definir a estrutura inicial de menus do HelpDesk.

## Layout

O sistema deve usar menu lateral responsivo.

O menu deve permitir crescimento futuro sem refatoração estrutural.

## Menus previstos

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

### Atendimento

* Atendimento
* Suporte Remoto
* Agendar Cancelamento
* Cadastro de Cliente
* Chamado REDE
* Membro REDE
* Comunicado
* Enquete

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

### Compra

* Fornecedor

### Frota

* Veículo

### Imobiliário

* Imóvel

### Pessoal

* Funcionário
* Conta Corrente / Vales

### Ajuda

* Base de Conhecimento
* Documentação
* Suporte

## Regra

Os menus podem existir visualmente antes da implementação das telas.

Funcionalidades não implementadas devem indicar que estão em desenvolvimento.

## Status: sidebar implementada (Fase 3 — mock-first)

O menu lateral está na tela principal (`/dashboard`), como **Sidebar** de
`NavigationTile` (ícone em destaque acima, rótulo abaixo, profundidade, "L"
laranja no ativo). Grupos abrem em acordeão (abrir um recolhe os demais) com
sub-itens em mini-cards; scrollbar fina na identidade Noturno. Ordem dos grupos:
Início, Sistema, Atendimento, Financeiro, Compra, Frota, Pessoal, Imobiliário,
Ajuda — com Início navegável e os demais inertes ("em breve") até cada módulo
existir.

* Cada grupo/item é exibido conforme a permissão do usuário (ADR-006) — a aplicar
  quando os módulos forem criados.
* Itens de módulos ainda não implementados aparecem inertes ("em breve"), sem
  navegação (evita 404).
* Configuração do menu: `src/modules/home/data/mocks/mock-nav.ts`.
* Especificação: `docs/specifications/home/README.md`.
