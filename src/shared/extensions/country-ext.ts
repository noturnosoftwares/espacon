import { onlyDigits } from './string-ext'

/**
 * Validações de **códigos de país** (NF-e / ISO 3166-1), usadas pelo cadastro de
 * País do módulo `locations`.
 */

/** Código BACEN do país (`cPais` da NF-e): exatamente 4 dígitos (ex.: Brasil `1058`). */
export function isValidBacenCode(code: string): boolean {
  return onlyDigits(code).length === 4
}

/** ISO 3166-1 alpha-2: 2 letras maiúsculas (ex.: `BR`). */
export function isValidIso2(code: string): boolean {
  return /^[A-Z]{2}$/.test(code.trim().toUpperCase())
}
