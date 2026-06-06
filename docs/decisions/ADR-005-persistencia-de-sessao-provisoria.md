# ADR-005 — Persistência de sessão provisória (storage local)

## Status

Provisório

## Data

2026-06-06

## Contexto

A opção "Manter acesso" do login precisa persistir a sessão entre acessos, mas
ainda não há token/cookie de API (ver ADR-003). É necessária uma solução
temporária que permita testar o fluxo de sessão sem comprometer a arquitetura.

## Opções avaliadas

### Opção 1 — Não persistir até a API real

Impede testar "Manter acesso" e o redirecionamento por sessão salva.

### Opção 2 — Persistir token real

Inviável: não existe token real ainda.

### Opção escolhida — Storage local abstraído

Persistir a sessão mock via `KeyValueStore` (`localStorage` se "Manter acesso"
marcado; `sessionStorage` caso contrário) e lembrar o e-mail para pré-preencher.

## Decisão

- Persistência via `src/shared/storage/key-value-store.ts` (abstração trocável).
- "Manter acesso" marcado → `localKeyValueStore`; desmarcado → `sessionKeyValueStore`.
- Abrir o login com sessão salva → redireciona ao dashboard; logout limpa a sessão.
- **Provisório**: não é autenticação segura; será substituído por token/cookie
  quando a API real existir.

## Consequências

### Benefícios

- Fluxo de sessão testável; abstração permite trocar a implementação sem afetar a UI.

### Riscos

- Não é seguro (dado em storage do navegador) → uso restrito ao período mock.

### Impactos

`src/modules/auth` (session repository), `src/shared/storage`.

## Quando revisar esta decisão

Quando a API real fornecer token/cookie de sessão — substituir esta persistência.

## Relação com outros ADRs

Refina o ADR-003 (autenticação mock); depende do ADR-001 (mock-first).

## Observações

Por ser **Provisório**, deve ser reavaliado obrigatoriamente na integração real.
