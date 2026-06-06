# ADR-001 — Desenvolvimento mock-first

## Status

Aceito

## Data

2026-06-06

## Contexto

O EspaçoN é um frontend desacoplado, sem backend neste repositório. O backend
REST (Delphi/XData, Node ou outro) será definido e integrado posteriormente.
Precisamos avançar nas telas e fluxos sem depender de API pronta nem inventar
contratos de JSON.

## Opções avaliadas

### Opção 1 — Aguardar a API real

Implementar telas só quando o backend existir. Bloqueia o desenvolvimento e
acopla o cronograma do frontend ao do backend.

### Opção 2 — Chamar API direto da tela com dados temporários

Rápido no início, mas viola as camadas, espalha acoplamento e gera retrabalho
quando a API real chegar.

### Opção escolhida — Mock-first com camadas

Todo módulo nasce com `data/mocks` + `MockProvider`, atrás do mesmo contrato de
`domain/repositories`. A presentation consome Store → Application → Repository →
Provider sem saber se o provider é mock ou real.

## Decisão

- Todo módulo novo inicia mockado (`data/mocks`, `data/providers/*-mock-provider`).
- A troca para a API real ocorre apenas na camada `data` (novo provider),
  sem alterar `domain`, `application` nem `presentation`.
- Nenhum model/mapper é criado sem contrato JSON real (ver regra corporativa).
- O `HttpClient` real só é introduzido quando houver API; até lá o contrato
  existe em `src/shared/http` com um `NotConfiguredHttpClient` que falha explícito.

## Consequências

### Benefícios

- Frontend evolui independente do backend.
- Contrato de camadas exercitado desde o início.
- Integração real entra sem refatorar camadas superiores.

### Riscos

- Mocks podem divergir do contrato real → mitigado exigindo JSON real antes de
  criar models/mappers.

### Impactos

`data/mocks`, `data/providers`, `data/repositories`, `shared/http`.

## Quando revisar esta decisão

Quando a primeira API REST real estiver disponível (introdução do HttpClient real
e dos providers de API — complementa, não revoga, este ADR).

## Relação com outros ADRs

Base para o ADR-003 (autenticação mock) e ADR-005 (sessão provisória).

## Observações

Mock-first é regra corporativa da Noturno; este ADR registra sua adoção no EspaçoN.
