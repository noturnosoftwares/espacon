/**
 * Helpers de data (ISO 8601 `yyyy-mm-dd`, o formato do `<input type="date">`).
 *
 * Validações da spec `employee-registration`: `isNotFutureDate` (R11 — admissão
 * não-futura) e `isAdult` (R12 — idade ≥ 18 quando o nascimento é informado).
 * Datas são comparadas em **meia-noite local**, sem componente de hora.
 */

/** Faz o parse de uma data ISO `yyyy-mm-dd`, rejeitando datas impossíveis. */
function parseIso(iso: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso ?? '').trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const date = new Date(year, month - 1, day)
  // Rejeita overflow (ex.: 2024-02-31 viraria março).
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return date
}

/** Meia-noite de hoje (local), para comparações sem hora. */
function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

/** Verdadeiro se a string é uma data ISO `yyyy-mm-dd` válida. */
export function isValidIsoDate(iso: string): boolean {
  return parseIso(iso) !== null
}

/** Verdadeiro se a data não for futura (≤ hoje). `false` se inválida. */
export function isNotFutureDate(iso: string): boolean {
  const date = parseIso(iso)
  if (!date) return false
  return date.getTime() <= startOfToday().getTime()
}

/** Verdadeiro se a pessoa tiver ≥ `minYears` (default 18) hoje. `false` se inválida. */
export function isAdult(isoBirthDate: string, minYears = 18): boolean {
  const birth = parseIso(isoBirthDate)
  if (!birth) return false
  const today = startOfToday()
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--
  return age >= minYears
}

/** Formata uma data ISO como `dd/mm/aaaa` (pt-BR); `''` se nula/inválida. */
export function formatDateBR(iso: string | null): string {
  const date = parseIso(iso)
  if (!date) return ''
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  return `${day}/${month}/${date.getFullYear()}`
}
