# ADR-006 — Controle de acesso por permissão e multiempresa

## Status

Aceito

## Data

2026-06-06

## Contexto

O EspaçoN opera em estrutura de matriz e franquias e não deve assumir ambiente
único (regra do produto — ver `CLAUDE.md`). Usuários têm perfis distintos
(admin, franqueado, representante, técnico, cliente) com escopos de dados
diferentes. Menus e telas precisam respeitar permissões desde o início, sem
exigir refatoração estrutural quando a rede crescer.

## Opções avaliadas

### Opção 1 — Adicionar permissões/multiempresa depois

Geraria refatoração ampla (models, filtros, menu, rotas) — contraria a visão de
longo prazo.

### Opção 2 — Permissões só no backend

O frontend ainda precisa esconder/inibir itens e rotas conforme o escopo; depender
só do backend degrada UX e segurança em profundidade.

### Opção escolhida — Modelo de acesso no usuário desde o início

O model de usuário nasce com `role`, `accessScope`, `franchiseId`,
`representativeId` e `permissions`, mesmo com mocks simples.

## Decisão

- Model de usuário (mock): `role` (admin | franqueado | representante | técnico |
  cliente), `accessScope` (global | franchise | representative | technician |
  customer), `franchiseId?`, `representativeId?`, `permissions[]`.
- `accessScope` filtra os dados por matriz/franquia/representante/técnico/cliente.
- Menu lateral e rotas exibem/permitem itens conforme permissão; módulos não
  implementados aparecem inertes ("em breve"), sem navegação (evita 404).
- Nenhuma funcionalidade deve assumir ambiente único.

## Consequências

### Benefícios

- Crescimento da rede sem refatoração estrutural; UX coerente por perfil.

### Riscos

- Complexidade inicial maior → mitigada começando com mocks e regras simples.

### Impactos

`src/modules/auth` (model de usuário), `src/modules/home` (menu/rotas),
filtros de listagem dos módulos.

## Quando revisar esta decisão

Quando o contrato real de usuário/permissões da API for definido (refinar mapeamento).

## Relação com outros ADRs

Depende do ADR-003 (auth) e do ADR-004 (stores/filtros).

## Observações

Implementação do menu/rotas por permissão ocorre na Fase 3 do plano.
