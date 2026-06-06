import { onlyDigits } from './string-ext'

/**
 * Validação e formatação de CNPJ (cadastro de pessoa jurídica, Brasil).
 *
 * `isValidCnpj` confere os dois dígitos verificadores (módulo 11 com os pesos
 * oficiais) e rejeita sequências repetidas.
 */
const FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

function checkDigit(base: string, weights: number[]): number {
  const sum = weights.reduce((acc, weight, i) => acc + Number(base[i]) * weight, 0)
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCnpj(value: string): boolean {
  const digits = onlyDigits(value)
  if (digits.length !== 14) return false
  if (/^(\d)\1{13}$/.test(digits)) return false

  const d1 = checkDigit(digits.slice(0, 12), FIRST_WEIGHTS)
  const d2 = checkDigit(digits.slice(0, 13), SECOND_WEIGHTS)
  return d1 === Number(digits[12]) && d2 === Number(digits[13])
}

/** Formata como `00.000.000/0000-00`. Retorna a entrada original se não tiver 14 dígitos. */
export function formatCnpj(value: string): string {
  const digits = onlyDigits(value)
  if (digits.length !== 14) return value
  return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}
