/**
 * Validação e formatação de CNPJ (Brasil) — **numérico e alfanumérico**.
 *
 * A partir de jul/2026 (IN RFB 2.229/2024 — ADR-009) o CNPJ passa a ser
 * **alfanumérico**: das 14 posições, as **12 primeiras** aceitam **A–Z maiúsculas
 * e dígitos** e as **2 últimas** continuam **numéricas** (DV). O DV é por
 * **Módulo 11**, convertendo cada caractere por **(ASCII − 48)** (`'0'..'9'→0..9`,
 * `'A'..'Z'→17..42`). Os CNPJs numéricos atuais continuam válidos (a conversão
 * coincide para dígitos). Esta é a **validação global** do template — todo CNPJ do
 * sistema passa por aqui (não recriar por tela).
 */
const CNPJ_LENGTH = 14
const CNPJ_FIRST_WEIGHTS = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const CNPJ_SECOND_WEIGHTS = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

/**
 * Conjunto de caracteres aceitos nas 12 primeiras posições — **defensivo A–Z**
 * (ADR-009 D5). Parametrizável: quando a RFB publicar a lista restrita de letras,
 * ajustar somente esta constante.
 */
const CNPJ_BODY_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'
const CNPJ_SHAPE = new RegExp(`^[${CNPJ_BODY_CHARS}]{12}[0-9]{2}$`)

/** Remove máscara, normaliza para MAIÚSCULAS e mantém só dígitos e A–Z. */
export function normalizeCnpj(value: string): string {
  return (value ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '')
}

/** DV por Módulo 11 com valor (ASCII − 48) de cada caractere. */
function cnpjCheckDigit(base: string, weights: number[]): number {
  let sum = 0
  for (let i = 0; i < weights.length; i++) {
    sum += (base.charCodeAt(i) - 48) * (weights[i] ?? 0)
  }
  const remainder = sum % 11
  return remainder < 2 ? 0 : 11 - remainder
}

export function isValidCnpj(value: string): boolean {
  const clean = normalizeCnpj(value)
  if (clean.length !== CNPJ_LENGTH) return false
  if (!CNPJ_SHAPE.test(clean)) return false
  // Rejeita sequência do mesmo caractere repetido (ex.: AAAAAAAAAAAAAA / 00000000000000).
  if (/^(.)\1{13}$/.test(clean)) return false

  const d1 = cnpjCheckDigit(clean.slice(0, 12), CNPJ_FIRST_WEIGHTS)
  const d2 = cnpjCheckDigit(clean.slice(0, 13), CNPJ_SECOND_WEIGHTS)
  return d1 === clean.charCodeAt(12) - 48 && d2 === clean.charCodeAt(13) - 48
}

/** Formata como `AA.AAA.AAA/AAAA-DV` (vale para conteúdo numérico ou alfanumérico). */
export function formatCnpj(value: string): string {
  const clean = normalizeCnpj(value)
  if (clean.length !== CNPJ_LENGTH) return value
  return clean.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, '$1.$2.$3/$4-$5')
}
