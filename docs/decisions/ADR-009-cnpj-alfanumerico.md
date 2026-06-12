# ADR-009 — CNPJ alfanumérico na validação global do template

## Status

Aceito

## Data

2026-06-12

## Contexto

A Receita Federal alterou o formato do CNPJ pela **Instrução Normativa RFB nº
2.229/2024**. A partir de **julho de 2026** os novos registros passam a ser
**alfanuméricos**: das 14 posições, as **12 primeiras** (raiz + ordem do
estabelecimento) passam a aceitar **letras maiúsculas A–Z e dígitos**, e as **2
últimas** permanecem **numéricas** (dígito verificador). O cálculo do DV continua
em **Módulo 11**, agora convertendo cada caractere pelo seu valor da tabela ASCII
**menos 48** (`'0'..'9' → 0..9`, `'A'..'Z' → 17..42`). A máscara de exibição segue
`AA.AAA.AAA/AAAA-DV`.

Os **CNPJs numéricos atuais continuam válidos** e não mudam. O ambiente de
homologação da NF-e já aceita o novo formato (06/04/2026) e a produção passa a
aceitar a partir de 06/07/2026.

O EspaçoN tem CNPJ em vários pontos (Fornecedor — primeiro consumidor —, e no
futuro Cliente, Transportadora, Franquia, favorecido bancário, emitente etc.). Se
a validação não acompanhar o novo formato, o sistema rejeitará CNPJs válidos a
partir de julho/2026. A validação precisa ser **única e global**, não espalhada
por tela.

## Opções avaliadas

### Opção 1 — Manter apenas a validação numérica atual

Simples agora, mas **quebra** quando os CNPJs alfanuméricos começarem a circular
(julho/2026). Gera rejeição de fornecedores/clientes válidos. Descartada.

### Opção 2 — Validar o alfanumérico caso a caso, por tela/módulo

Cada cadastro implementaria sua própria checagem. Gera duplicação, divergência de
regra e risco de uma tela aceitar o que outra rejeita. Contraria a regra de
extensions globais do template. Descartada.

### Opção escolhida — Atualizar a extension global `cnpj-ext`

A função `isValidCnpj` em `src/shared/extensions/cnpj-ext.ts` passa a validar
**ambos** os formatos (numérico atual e alfanumérico novo), com a conversão
ASCII−48 e Módulo 11. Todo o sistema consome essa função única.

## Decisão

- `cnpj-ext.ts` valida **CNPJ numérico e alfanumérico** em uma única função
  `isValidCnpj(value)`, aceitando entrada **com ou sem máscara**.
- DV calculado por **Módulo 11**, convertendo cada caractere por **(ASCII − 48)**.
- Conjunto de letras aceito: **A–Z** (codificação **defensiva**), pois a RFB ainda
  não confirmou a exclusão de letras (possivelmente I, O, U, Q, F). O conjunto fica
  **parametrizável** para ajuste rápido quando a lista oficial for publicada.
- `formatCnpj(value)` mantém a máscara `AA.AAA.AAA/AAAA-DV` para qualquer conteúdo.
- **Armazenamento**: guardar o CNPJ "limpo" (sem máscara), com **letras em
  maiúsculas**; a formatação é responsabilidade da UI (`MaskedField`).
- **Toda** entrada de CNPJ no sistema (cadastros, favorecido bancário, filtros de
  pesquisa) usa essa validação — **não** recriar máscara/validação por tela.
- O que **não** fazer: validar CNPJ "na mão" em componente, assumir 14 dígitos
  numéricos, ou bloquear letras maiúsculas no campo.

## Consequências

### Benefícios

- Sistema pronto para julho/2026 sem refatoração por tela.
- Fonte única de verdade para CNPJ (consistência e manutenção em um só lugar).
- Alinhamento com NF-e/NFC-e e demais documentos fiscais.

### Riscos

- A lista restrita de letras ainda não é oficial → mitigado pela codificação
  defensiva (A–Z) e pelo conjunto parametrizável.
- Campos de banco/contratos que tratavam CNPJ como numérico podem precisar de
  ajuste de tipo (texto, não número) → previsto nos impactos.

### Impactos

- `shared/extensions` (`cnpj-ext.ts` — `isValidCnpj`, `formatCnpj`).
- `shared/widgets` (`MaskedField` — máscara aceitando alfanumérico).
- `modules/suppliers` (primeiro consumidor) e, no futuro, qualquer módulo com CNPJ
  (cliente, favorecido bancário, emitente, transportadora).
- Camada `data` dos módulos: armazenar/serializar CNPJ como **texto**.

## Quando revisar esta decisão

- Quando a RFB **publicar a lista definitiva** de letras permitidas (ajustar o
  conjunto parametrizável).
- Quando o leiaute da NF-e/NFC-e em produção exigir comportamento específico.
- Se surgir validação adicional (ex.: situação cadastral) que dependa de API real.

## Relação com outros ADRs

- **Introduzido pela** spec `docs/specifications/suppliers/supplier-registration.md`.
- Complementa as regras de validação/extensions globais do template corporativo.
- Independente dos demais ADRs (não substitui nem revoga nenhum).

## Observações

- Usar o **Simulador Nacional de CNPJ Alfanumérico** (RFB) para gerar massa de
  teste fictícia e incluir CNPJs alfanuméricos na suíte de testes automatizados
  desde já.
- Há implementações de referência publicadas pelo **Serpro** (Java, Python,
  TypeScript) — úteis como base para os testes da `cnpj-ext`.
