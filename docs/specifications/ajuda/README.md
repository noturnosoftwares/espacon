# Especificação — Central de Ajuda (Ajuda)

> Implementa o menu **Ajuda** previsto em `docs/screens/home-layout.md`
> (Base de Conhecimento, Tutoriais, Novidades, Suporte). Mock-first.

## Nome

Central de Ajuda — `src/modules/help`, rota `/ajuda`.

## Objetivo

Reunir, em um único lugar, o autoatendimento do HelpDesk: pesquisar a base de
conhecimento, seguir tutoriais guiados, acompanhar novidades do produto
(changelog) e acionar o suporte (canais + FAQ + abertura de chamado).

## Contexto

Tela interna autenticada. Reutiliza o `AuthenticatedShell` (menu + navbar +
guard de sessão ADR-005), evitando duplicar o boilerplate de sessão. O conteúdo
vem de um provider **mock** (`MockHelpProvider`) — não há API real de
conhecimento ainda.

## Estrutura

Centro de ajuda em **abas**, com busca global no topo:

- **Herói + busca** — título, selo "Central de Ajuda" e campo de pesquisa que
  filtra (cliente) categorias, artigos, tutoriais e FAQ pela aba ativa.
- **Base de Conhecimento** — grid de categorias + lista de artigos populares.
- **Tutoriais** — grid de tutoriais (nível, duração).
- **Novidades** — timeline do changelog (Novo / Melhoria / Correção).
- **Suporte** — CTA "Abrir chamado", canais de contato e FAQ (acordeão).

## Navegação por aba (hash)

A aba ativa é sincronizada com o **hash da URL**, para que os itens do menu
lateral selecionem a aba certa sem rotas extras:

| Item do menu          | Destino            | Aba          |
| --------------------- | ------------------ | ------------ |
| Base de Conhecimento  | `/ajuda`           | `knowledge`  |
| Tutoriais             | `/ajuda#tutoriais` | `tutorials`  |
| Novidades             | `/ajuda#novidades` | `news`       |
| Suporte               | `/ajuda#suporte`   | `support`    |

A página escuta `hashchange` (montagem + navegação do menu) e, ao clicar numa
aba, atualiza o hash via `history.replaceState` (sem novo registro de histórico).

## Regras de Negócio

- A Ajuda é **universal**: o grupo do menu não exige permissão (Base de
  Conhecimento é acessível a todos os perfis).
- A busca é **derivada** na store (getters), sem mutar os dados de origem;
  combina título/descrição/tags/nível conforme o tipo de conteúdo.
- O `GetHelpCenterUseCase` mantém ponto de extensão para regras futuras
  (ex.: ocultar artigos por escopo de acesso).

## Fluxo

```txt
HelpPage → AuthenticatedShell (sessão + menu + navbar)
  └─ HelpContent (HelpStore por tela)
       → GetHelpCenterUseCase.execute()
         → HelpRepository → HelpProvider (mock) → HelpCenter
       → sincroniza aba pelo hash; busca filtra via getters
```

## Models

- `HelpCategory` (`icon`, `tone`, `articleCount`).
- `HelpArticle` (`categoryId`, `excerpt`, `readingTimeLabel`, `tags`).
- `HelpTutorial` (`level`, `durationLabel`, `tone`).
- `HelpNews` (`kind`: Novo | Melhoria | Correção).
- `HelpFaq` (`question`, `answer`).
- `HelpCenter` — agregado carregado em uma única chamada.

## Casos de Erro

| Caso                         | Mensagem                                       | Code                     |
| ---------------------------- | ---------------------------------------------- | ------------------------ |
| Falha ao carregar o conteúdo | Não foi possível carregar a Central de Ajuda…  | `help/center-load-failed`|

## Mock Inicial

`MockHelpProvider` (latência ~400 ms) sobre `mock-help-center` (6 categorias,
6 artigos, 6 tutoriais, 5 novidades, 5 FAQs).

## Integração Real

Trocar `MockHelpProvider` por `ApiHelpProvider` + mapper em `help-factory.ts`,
sem impacto nas camadas acima. Abertura de chamado de suporte e abertura de
artigos individuais ficam como evolução (CTA/links já presentes na UI).

## Responsividade

- Desktop: grids de 3 colunas (categorias/tutoriais); herói amplo.
- Tablet: 2 colunas.
- Mobile: coluna única; abas com quebra de linha.

## Rota / Tela

- `/ajuda` — `src/modules/help/presentation/pages/help-page.tsx`.

## Base de Conhecimento

Entrada "Central de Ajuda": como pesquisar, abas (Base de Conhecimento,
Tutoriais, Novidades, Suporte), navegação por hash a partir do menu e canais de
suporte. Atualizar quando a API real de conhecimento entrar.
