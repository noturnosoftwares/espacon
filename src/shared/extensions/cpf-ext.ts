import { onlyDigits } from './string-ext'

/**
 * Validação e formatação de CPF (cadastro de pessoa física, Brasil).
 *
 * `isValidCpf` confere os dois dígitos verificadores pelo algoritmo oficial
 * (módulo 11) e rejeita sequências repetidas (ex.: 111.111.111-11), que passam
 * na conta mas são inválidas na prática.
 */
function checkDigit(base: string, factorStart: number): number {
  let sum = 0
  for (let i = 0; i < base.length; i++) {
    sum += Number(base[i]) * (factorStart - i)
  }
  const remainder = (sum * 10) % 11
  return remainder === 10 ? 0 : remainder
}

export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value)
  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  const d1 = checkDigit(digits.slice(0, 9), 10)
  const d2 = checkDigit(digits.slice(0, 10), 11)
  return d1 === Number(digits[9]) && d2 === Number(digits[10])
}

/** Formata como `000.000.000-00`. Retorna a entrada original se não tiver 11 dígitos. */
export function formatCpf(value: string): string {
  const digits = onlyDigits(value)
  if (digits.length !== 11) return value
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}
