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

## Campos (ordem e padronização)

> Lei corporativa em `../template/docs/design-system/README.md` §8.1. Resumo
> aplicado no EspaçoN:

* **Ordem lógica.** Campos seguem a ordem natural de leitura/preenchimento; em
  barras de pesquisa: **termo → filtros → ações**. Botões (Buscar/Limpar) vêm
  **sempre ao final** — nunca um filtro depois do botão de ação. A ordem de **Tab**
  acompanha (campo → campo → ação).
* **Design único.** Todo campo usa o componente-base de `shared/widgets`
  (`BaseTextField`, `SearchField`, `BaseSelect`, `LookupField`) com a **mesma
  anatomia**: altura **40px**, borda `border-line-subtle`, raio `radius-field`
  (10px), fundo `surface-1`, foco dourado. Campos lado a lado **nunca** têm
  alturas/bordas diferentes.
* **Nunca** usar controle de terceiros cru na tela (ex.: `Select` do PrimeVue):
  embrulhar num base (`BaseSelect`) que força a anatomia do campo.
* Rótulo/hint/erro via `FormField`; booleanos em `Switch` (não select de 2 opções).

## Filtros (cache local × requisição)

> Lei corporativa em `../template/docs/design-system/README.md` §9.1.

Em telas de **CRUD/pesquisa** (parâmetros + botão buscar):

* **Mudar um filtro NÃO requisita o backend.** Ele **filtra o cache localmente**
  (os dados já carregados) — feedback instantâneo, sem ida ao servidor.
* **Os filtros são parâmetros da requisição.** Quando há uma busca (Enter/Buscar)
  ou carga por scroll, os **valores atuais dos filtros** vão no request.
* A **busca por termo** é a ação que dispara o request (§9.1); os **filtros**
  apenas refinam localmente e parametrizam a próxima requisição.
* Exemplo (Usuários): listei os usuários; mudar **Situação** filtra a lista
  carregada na hora (local); a próxima busca leva `active` como parâmetro. O grid
  lê uma **visão local** (`displayedUsers`) do cache do store.

## Responsividade

O sistema deve funcionar bem em:

* desktop;
* notebook;
* tablet;
* telas menores quando possível.

## Regra

Antes de criar uma tela, verificar se já existe componente base reutilizável.

Evitar criar telas visualmente diferentes sem necessidade.
