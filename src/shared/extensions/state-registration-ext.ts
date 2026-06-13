/**
 * Validação de **Inscrição Estadual (IE)** — extension global (spec Fornecedor V3/D4).
 *
 * Regras: a IE é **opcional** — aceita **"ISENTO"** (qualquer caixa) ou **vazio**.
 * Quando há valor, valida por **UF**.
 *
 * **Suposição registrada (lacuna):** o DV próprio de cada estado tem 27 algoritmos
 * distintos (alto risco de **rejeitar IE válida** por bug de implementação). Como a
 * IE é opcional até o módulo fiscal existir (D6/P6) e seguindo o mesmo espírito do
 * ADR-009 (não rejeitar dado válido), validamos por ora a **estrutura por UF**
 * (somente dígitos + comprimento aceito pela UF). O **DV por UF** entra junto com o
 * módulo fiscal/apuração CBS·IBS. Documentado na Base de Conhecimento.
 */

/** Comprimentos (em dígitos) aceitos por UF. UFs com formatos antigo+novo listam ambos. */
const IE_LENGTHS: Record<string, number[]> = {
  AC: [13],
  AL: [9],
  AP: [9],
  AM: [9],
  BA: [8, 9],
  CE: [9],
  DF: [13],
  ES: [9],
  GO: [9],
  MA: [9],
  MT: [11],
  MS: [9],
  MG: [13],
  PA: [9],
  PB: [9],
  PR: [10],
  PE: [9, 14],
  PI: [9],
  RJ: [8],
  RN: [9, 10],
  RS: [10],
  RO: [9, 14],
  RR: [9],
  SC: [9],
  SP: [12],
  SE: [9],
  TO: [9, 11],
}

/** `true` para "ISENTO"/vazio ou IE estruturalmente válida para a UF. */
export function isValidStateRegistration(ie: string, uf: string): boolean {
  const value = (ie ?? '').trim()
  if (value === '' || value.toUpperCase() === 'ISENTO') return true

  const digits = value.replace(/\D/g, '')
  if (digits.length === 0) return false

  const lengths = IE_LENGTHS[(uf ?? '').toUpperCase()]
  // UF desconhecida/estrangeira: aceita faixa geral (defensivo, como o CNPJ — ADR-009).
  if (!lengths) return digits.length >= 8 && digits.length <= 14
  return lengths.includes(digits.length)
}

/** `true` se o valor é o marcador especial "ISENTO" (qualquer caixa). */
export function isExemptStateRegistration(ie: string): boolean {
  return (ie ?? '').trim().toUpperCase() === 'ISENTO'
}
