import { onlyDigits } from './string-ext'

/**
 * Validações de **códigos IBGE** (geografia brasileira), usadas pelo módulo
 * `locations` e por qualquer cadastro que armazene cUF/cMun.
 *
 * `regionFromIbgeUf` (que devolve o enum de domínio `BrazilRegion`) vive no módulo
 * `locations` — não aqui — para o `shared` não depender de um módulo.
 */

/** Os 27 códigos IBGE de UF (cUF) válidos (campo `cUF` da NF-e). */
export const VALID_IBGE_UF_CODES: ReadonlySet<string> = new Set([
  '11', '12', '13', '14', '15', '16', '17', // Norte
  '21', '22', '23', '24', '25', '26', '27', '28', '29', // Nordeste
  '31', '32', '33', '35', // Sudeste
  '41', '42', '43', // Sul
  '50', '51', '52', '53', // Centro-Oeste
])

/** Código IBGE de UF: 2 dígitos pertencentes ao conjunto oficial. */
export function isValidIbgeUf(code: string): boolean {
  return VALID_IBGE_UF_CODES.has(onlyDigits(code))
}

/**
 * Dígito verificador do código IBGE de município (algoritmo oficial): pesos
 * `1,2,1,2,1,2` sobre os 6 primeiros dígitos; produto > 9 vira soma dos seus
 * dígitos; `DV = (10 - soma % 10) % 10`.
 */
function ibgeMunicipalityCheckDigit(base6: string): number {
  const weights = [1, 2, 1, 2, 1, 2]
  let sum = 0
  for (let i = 0; i < 6; i++) {
    const product = Number(base6[i]) * (weights[i] as number)
    sum += product > 9 ? product - 9 : product
  }
  return (10 - (sum % 10)) % 10
}

/** Código IBGE de município: 7 dígitos com dígito verificador válido (`cMun`). */
export function isValidIbgeMunicipality(code: string): boolean {
  const digits = onlyDigits(code)
  if (digits.length !== 7) return false
  return ibgeMunicipalityCheckDigit(digits.slice(0, 6)) === Number(digits[6])
}
