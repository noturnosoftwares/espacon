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
