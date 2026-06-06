# ADR-007 — Dados públicos pré-login (vitrine institucional)

## Status

Provisório

## Data

2026-06-06

## Contexto

A tela de login do EspaçoN exibe uma **vitrine institucional** (mapa de presença,
indicadores de uso e missão/visão/metas) **antes** da autenticação, para
comunicar credibilidade e abrangência da Noturno (ver
`docs/specifications/auth/login.md`). Como esse conteúdo aparece sem usuário
logado, ele não pode expor nenhum dado sensível ou identificável de cliente.

## Opções avaliadas

### Opção 1 — Reaproveitar dados internos do ERP na vitrine

Exporia dados de clientes (nome, documento, endereço) a um público não
autenticado — risco de privacidade e LGPD. Descartada.

### Opção 2 — Vitrine puramente estática (texto fixo)

Não comunica prova social real (uso/abrangência) e não evolui com a rede.

### Opção escolhida — Recorte público, agregado e anonimizado

A vitrine consome um contrato próprio, **público/agregado/anonimizado**:
contadores de abrangência e clusters de mapa **por cidade** (lat/long da cidade +
contagem), sem qualquer campo que identifique cliente.

## Decisão

- O painel só consome dados **públicos, agregados e anonimizados** e
  **exclusivamente não-financeiros** (proibido faturamento, valores, boletos,
  contas a pagar/receber).
- Contrato único: **`GET /public/login-overview`**, com três blocos dinâmicos —
  `dashboard` (indicadores não-financeiros), `map` (pontos por cidade) e `apps`
  (ecossistema de produtos da Noturno).
- Mapa agregado **por cidade** (sem nome, documento ou endereço de cliente).
- O painel **nunca bloqueia o login**: em falha, mostra estado discreto e o
  formulário permanece 100% funcional; o carregamento é independente do form.
- Fase mock: `MockOverviewProvider`. Integração real: o endpoint acima, com
  granularidade a confirmar com o backend (contagem exata por cidade vs. faixas;
  número exato vs. aproximado de usuários online).

## Consequências

### Benefícios

- Prova social e autoridade sem comprometer privacidade; vitrine evolui com a rede.

### Riscos

- Definição final de granularidade depende do backend → mantida **Provisória**.

### Impactos

`src/modules/auth` (showcase model/repository/provider/store/widgets), spec do login.

## Quando revisar esta decisão

Quando existir o endpoint público real da vitrine — fechar a granularidade
permitida e promover esta decisão de Provisório para Aceito.

## Relação com outros ADRs

Depende do ADR-001 (mock-first). Introduzido pela spec do login
(`docs/specifications/auth/login.md`). A adoção de lib de mapa exigirá ADR próprio.

## Observações

Pendências abertas (ver spec do login): conjunto final de indicadores; lista
oficial de apps/status; granularidade do mapa público; exibição exata vs.
aproximada de usuários online.
