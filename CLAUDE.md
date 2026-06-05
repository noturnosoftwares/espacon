# HelpDesk

## Projeto

HelpDesk é a plataforma de gestão da Noturno Softwares.

O sistema centraliza toda a operação administrativa, comercial, financeira, técnica e operacional da empresa.

O objetivo é criar uma plataforma moderna, escalável, documentada e preparada para evolução durante muitos anos.

Este documento contém **apenas regras específicas do HelpDesk**. As regras corporativas (arquitetura, camadas, fluxo, mock-first, AsyncResult, models, mappers, extensions/helpers, classificação de reuso, Design System, qualidade, documentação) vivem no template corporativo e não são repetidas aqui.

---

# Template Corporativo

Este projeto herda os padrões da Noturno Softwares através do template corporativo.

Antes de qualquer implementação, a IA deve ler obrigatoriamente:

```txt
../noturno-web-template/CLAUDE.md
../noturno-web-template/docs/architecture/README.md
../noturno-web-template/docs/decisions/README.md
../noturno-web-template/docs/specifications/README.md
```

O template é a fonte das regras corporativas. O HelpDesk não as duplica — apenas as referencia e, quando necessário, as especializa.

## Disponibilidade do Template

Local esperado: `../noturno-web-template`.

Caso o template não esteja disponível:

* informar ao usuário;
* interromper implementações;
* solicitar correção antes de continuar.

---

# Ordem de Prioridade

1. Regras deste projeto (HelpDesk)
2. Template corporativo (noturno-web-template)
3. Documentação deste projeto
4. Boas práticas consolidadas do mercado
5. Documentação oficial das tecnologias

---

# Processo de Inicialização

Antes de qualquer implementação:

1. Ler este CLAUDE.md.
2. Ler o template corporativo.
3. Ler a documentação do módulo em `docs/`.
4. Resumir a arquitetura, identificar dúvidas e riscos.
5. Somente depois propor implementação.

Nenhuma implementação deve iniciar apenas com base em suposições. Nunca assumir regras de negócio — em caso de dúvida: perguntar, documentar, validar.

---

# Escopo do Sistema (Multiempresa)

O HelpDesk opera em estrutura de matriz e franquias. Nenhuma implementação deve assumir ambiente único.

O sistema deve suportar, desde o início:

* matriz (acesso global);
* franquias;
* representantes;
* técnicos;
* clientes;
* múltiplas permissões e níveis de acesso.

O sistema deve crescer sem refatorações estruturais.

## Modelo de Acesso

O model de usuário nasce preparado para multiempresa, mesmo com mocks simples:

* `role` — admin | franqueado | representante | técnico | cliente;
* `accessScope` — global | franchise | representative | technician | customer;
* `franchiseId` — vínculo de franquia (ausente quando global/matriz);
* `representativeId` — vínculo de representante;
* `permissions` — lista granular de permissões.

`accessScope` é o que filtra os dados por matriz/franquia/representante/técnico/cliente.

---

# Módulos do Produto

## Comercial
Clientes, Contratos, Planos, Licenças, Ferramentas, Representantes, Franquias, Cancelamentos, Bloqueios.

## Atendimento
CRM, Atendimento, Histórico, WhatsApp, Facebook, Chat, Chamados/Tickets, Solicitações.

## Financeiro
Contas a Receber, Contas a Pagar, Fluxo de Caixa, Comissões, Cobranças, Inadimplência.

## Administrativo
Funcionários, Permissões, Franquias, Indicadores, Auditoria, Configurações.

## Conhecimento
Base de Conhecimento, Documentação, Ajuda.

---

# Decisões de Produto

Decisões arquiteturais específicas do HelpDesk são registradas em `docs/decisions`. As principais:

* **Dark First** — o sistema nasce em tema escuro usando a paleta oficial da Noturno. Modo Light poderá ser avaliado futuramente. (A paleta é corporativa; a escolha do tema é do produto.)
* **Multiempresa desde o início** — `accessScope` e vínculos de franquia/representante no model de usuário.
* **Sessão mock provisória** — autenticação inicia mockada; a estratégia definitiva só será definida com contrato/API real.

---

# Documentação do Produto

Antes de implementar, consultar e manter atualizado:

```txt
docs/app
docs/ui
docs/workflows
docs/specifications
docs/api
docs/database
docs/architecture
docs/decisions
```

Funcionalidade relevante não é concluída sem documentação, especificação e atualização da Base de Conhecimento (regra corporativa — ver template).

---

# Interface

A interface segue o Design System da Noturno (paleta oficial — definida no template) e os padrões visuais do HelpDesk documentados em `docs/ui`.

Padrões do produto: tema dark, cards, ícones, responsividade; grids com filtro, ordenação, paginação, loading, estado vazio e erro.

Nunca utilizar cores fora da paleta oficial da Noturno.

---

# Regra Final

O objetivo não é apenas gerar código, mas construir patrimônio tecnológico duradouro: manutenível, documentado, compatível, escalável e reutilizável, preparado para evoluir durante décadas.
