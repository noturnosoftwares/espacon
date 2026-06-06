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

## Status: especificado — a implementar (Fase 3)

O menu lateral responsivo ficará na tela principal (`/dashboard`),
seguindo a **Estrutura Inicial dos Menus** de `docs/screens/home-layout.md`
(Dashboard, Clientes, Atendimento, Financeiro, Administração, Ajuda). Os menus
acima ("Menus previstos") representam a visão ampla/futura e serão incorporados
conforme os módulos forem criados.

* Cada grupo/item é exibido conforme a permissão do usuário (ADR-006).
* Itens de módulos ainda não implementados aparecem inertes ("em breve"), sem
  navegação (evita 404) — atende à regra acima.
* Configuração do menu (prevista): `src/modules/home/data/mocks/mock-nav.ts`.
* Especificação: `docs/specifications/home/README.md`.
