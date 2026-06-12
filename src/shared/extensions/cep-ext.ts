import { onlyDigits } from './string-ext'

/** Validação e formatação de CEP (código postal brasileiro, 8 dígitos). */
export function isValidCep(value: string): boolean {
  return onlyDigits(value).length === 8
}

/** Formata como `00000-000`. Retorna a entrada original se não tiver 8 dígitos. */
export function formatCep(value: string): string {
  const digits = onlyDigits(value)
  if (digits.length !== 8) return value
  return digits.replace(/(\d{5})(\d{3})/, '$1-$2')
}

/**
 * Faixas oficiais de CEP por UF (Correios), em **prefixo de 3 dígitos** inclusivo.
 * Algumas UFs têm faixas descontínuas (DF/GO, AM/RR/AC/RO), por isso é uma lista
 * de intervalos por UF. É uma checagem de **coerência** no frontend; o backend é a
 * autoridade final (ver spec `employee-registration` R7).
 */
const CEP_UF_RANGES: Record<string, ReadonlyArray<readonly [number, number]>> = {
  SP: [[10, 199]],
  RJ: [[200, 289]],
  ES: [[290, 299]],
  MG: [[300, 399]],
  BA: [[400, 489]],
  SE: [[490, 499]],
  PE: [[500, 569]],
  AL: [[570, 579]],
  PB: [[580, 589]],
  RN: [[590, 599]],
  CE: [[600, 639]],
  PI: [[640, 649]],
  MA: [[650, 659]],
  PA: [[660, 688]],
  AP: [[689, 689]],
  AM: [[690, 692], [694, 698]],
  RR: [[693, 693]],
  AC: [[699, 699]],
  DF: [[700, 727], [730, 736]],
  GO: [[728, 729], [737, 767]],
  RO: [[768, 769]],
  TO: [[770, 779]],
  MT: [[780, 788]],
  MS: [[790, 799]],
  PR: [[800, 879]],
  SC: [[880, 899]],
  RS: [[900, 999]],
}

/**
 * Verdadeiro se o CEP pertence à faixa oficial da UF informada (ver spec R7).
 * Retorna `false` se o CEP for inválido ou a UF desconhecida.
 */
export function isCepWithinUf(cep: string, uf: string): boolean {
  if (!isValidCep(cep)) return false
  const ranges = CEP_UF_RANGES[uf.trim().toUpperCase()]
  if (!ranges) return false
  const prefix = Number(onlyDigits(cep).slice(0, 3))
  return ranges.some(([min, max]) => prefix >= min && prefix <= max)
}
