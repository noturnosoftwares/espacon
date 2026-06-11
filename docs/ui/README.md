# UI e Identidade Visual

> **Atualização (2026-06-10).** A **lei visual** e os **padrões operacionais de
> UI** vivem no template corporativo: `../template/docs/design-system/README.md`
> e `../template/docs/ui/README.md`. Este documento permanece como referência
> histórica do produto e foi **refinado** (não revogado) para alinhar com o
> **scroll infinito** das listagens (ADR-002) — ver as seções *Cadastros* e
> *Grids* abaixo.

## Objetivo

Definir o padrão visual do HelpDesk.

O sistema deve seguir a identidade visual da Noturno Softwares, evitando aparência genérica de IA.

## Aparência Geral

O visual deve ser:

* moderno;
* limpo;
* profissional;
* responsivo;
* com uso forte de cards;
* com botões arredondados;
* com ícones sempre que fizer sentido;
* com campos flat design;
* com boa separação visual entre blocos.

## Cores

Priorizar a paleta oficial da Noturno.

As cores principais da interface devem combinar:

* dourado/laranja;
* branco;
* preto;
* vermelho;
* cinzas da paleta.

Não usar cores fora da paleta sem autorização.

## Tela Inicial

A tela inicial deve possuir:

* menu lateral;
* topo com nome do usuário;
* área de notificações;
* cards de dashboard;
* indicadores gerenciais;
* atalhos para módulos principais.

## Cadastros

Telas de cadastro devem usar:

* cards para separar grupos de informação;
* campos clean;
* botões com ícones;
* grids com filtro;
* grids com ordenação;
* carregamento por **scroll infinito** (lote de 30 — ADR-002), com indicador de
  rodapé enquanto houver dados (substitui a paginação por número de página);
* estados de loading, erro e vazio.

## Grids

Todo grid relevante deve prever:

* filtro;
* ordenação;
* **scroll infinito** (carga em lotes de 30 ao aproximar do fim — ADR-002), em
  vez de paginação por número de página;
* loading;
* **estado vazio** — na pesquisa sem resultados, destacar o termo buscado em
  vermelho (`#FF2626`) e oferecer **"Limpar pesquisa"** (ver Design System §9.1);
* ações por linha quando necessário.

## Responsividade

O sistema deve funcionar bem em:

* desktop;
* notebook;
* tablet;
* telas menores quando possível.

## Regra

Antes de criar uma tela, verificar se já existe componente base reutilizável.

Evitar criar telas visualmente diferentes sem necessidade.
