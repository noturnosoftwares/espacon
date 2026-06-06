import { onlyDigits } from './string-ext'

/**
 * Formatação de telefone brasileiro. Suporta fixo (10 dígitos) e celular
 * (11 dígitos), com DDD. Retorna a entrada original se o tamanho não casar.
 *
 * - 11 dígitos → `(00) 00000-0000`
 * - 10 dígitos → `(00) 0000-0000`
 */
export function formatPhone(value: string): string {
  const digits = onlyDigits(value)
  if (digits.length === 11) return digits.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  if (digits.length === 10) return digits.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  return value
}

/** Valida telefone brasileiro com DDD (10 ou 11 dígitos). */
export function isValidPhone(value: string): boolean {
  const length = onlyDigits(value).length
  return length === 10 || length === 11
}
