const BRL_FORMATTER = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** Formata um número como moeda brasileira (ex.: `R$ 1.234,56`). */
export function formatBRL(value: number): string {
  return BRL_FORMATTER.format(value)
}

/**
 * Converte texto de moeda digitado (ex.: `R$ 1.234,56`, `1234,56`, `1234.56`)
 * em número, ou null se inválido. Trata `.` como separador de milhar e `,` como
 * decimal (padrão brasileiro).
 */
export function parseBRL(value: string): number | null {
  const cleaned = value.replace(/[^\d,.-]/g, '').replace(/\./g, '').replace(',', '.')
  if (cleaned === '' || cleaned === '-') return null
  const parsed = Number(cleaned)
  return Number.isFinite(parsed) ? parsed : null
}
