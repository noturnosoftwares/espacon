/** Remove tudo que não for dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, '')
}

/**
 * Normaliza texto para comparação/busca: minúsculas, sem acentos e sem espaços
 * nas pontas. Útil em filtros de grid e buscas client-side.
 *
 * Remove marcas diacríticas combinantes (Unicode U+0300–U+036F) após NFD.
 */
export function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
}

/** Converte string (com vírgula ou ponto decimal) em número, ou null se inválida. */
export function toNumber(value: string): number | null {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  if (normalized === '') return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}
