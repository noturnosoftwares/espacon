# ADR-003 — Autenticação mock-first; token/sessão definitiva deferidos

## Status

Aceito

## Data

2026-06-06

## Contexto

O acesso ao EspaçoN será por e-mail/senha, mas não há backend de autenticação
neste repositório. Precisamos do fluxo de login funcional para destravar as
telas internas, sem definir prematuramente o mecanismo de token/sessão (que
depende do contrato da API real).

## Opções avaliadas

### Opção 1 — Já implementar JWT/refresh token

Exige contrato e backend reais que ainda não existem; decisão prematura.

### Opção 2 — Login fake só na tela

Viola as camadas e não exercita o fluxo real.

### Opção escolhida — Login mockado pelas camadas, token deferido

`AuthStore → LoginUseCase → AuthRepositoryImpl → MockAuthProvider`, retornando
`AsyncResult`. A estratégia definitiva de token/sessão é decidida quando a API
existir.

## Decisão

- Login inicia mockado (credencial fixa documentada em `docs/app/authentication.md`).
- Fluxo obrigatório Page → Store → Application → Repository → Provider; erros via
  `AsyncResult`.
- `AuthStore` estende apenas `BaseStore` (login não é CRUD), instância por tela.
- Token/refresh, expiração e renovação ficam **deferidos** até o contrato real.

## Consequências

### Benefícios

- Telas internas destravadas; arquitetura de auth pronta para trocar o provider.

### Riscos

- Mock não representa segurança real → explicitado na documentação.

### Impactos

`src/modules/auth/*`, `shared/result`.

## Quando revisar esta decisão

Quando a API de autenticação real estiver disponível (definir token, expiração e
renovação — provavelmente em novo ADR que refina este).

## Relação com outros ADRs

Depende do ADR-001 (mock-first). Complementado pelo ADR-005 (persistência de
sessão provisória).

## Observações

Implementação ocorre na Fase 2 do plano de desenvolvimento.
