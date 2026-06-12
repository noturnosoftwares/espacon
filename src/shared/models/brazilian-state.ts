import { normalizeText } from '@/shared/extensions'

/**
 * BrazilianState — lista estática **leve** das 27 UFs do Brasil, para usos rápidos
 * (selecionar/validar sigla sem abrir um lookup). A **fonte única** de Estados é o
 * módulo `locations` (cadastro com país, cUF, região e campos fiscais); este helper
 * é só uma conveniência compartilhada, não substitui aquele cadastro.
 *
 * Contrato: `uf` (sigla de 2 letras) é o que se grava; `label` (`'SP — São Paulo'`)
 * é o que se exibe e por onde se pesquisa.
 */
export interface BrazilianState {
  uf: string
  name: string
  label: string
}

const RAW: ReadonlyArray<readonly [string, string]> = [
  ['AC', 'Acre'],
  ['AL', 'Alagoas'],
  ['AP', 'Amapá'],
  ['AM', 'Amazonas'],
  ['BA', 'Bahia'],
  ['CE', 'Ceará'],
  ['DF', 'Distrito Federal'],
  ['ES', 'Espírito Santo'],
  ['GO', 'Goiás'],
  ['MA', 'Maranhão'],
  ['MT', 'Mato Grosso'],
  ['MS', 'Mato Grosso do Sul'],
  ['MG', 'Minas Gerais'],
  ['PA', 'Pará'],
  ['PB', 'Paraíba'],
  ['PR', 'Paraná'],
  ['PE', 'Pernambuco'],
  ['PI', 'Piauí'],
  ['RJ', 'Rio de Janeiro'],
  ['RN', 'Rio Grande do Norte'],
  ['RS', 'Rio Grande do Sul'],
  ['RO', 'Rondônia'],
  ['RR', 'Roraima'],
  ['SC', 'Santa Catarina'],
  ['SP', 'São Paulo'],
  ['SE', 'Sergipe'],
  ['TO', 'Tocantins'],
]

export const BRAZILIAN_STATES: BrazilianState[] = RAW.map(([uf, name]) => ({
  uf,
  name,
  label: `${uf} — ${name}`,
}))

/** Resolve um estado pela sigla (UF). */
export function findStateByUf(uf: string | null | undefined): BrazilianState | null {
  if (!uf) return null
  const wanted = uf.trim().toUpperCase()
  return BRAZILIAN_STATES.find((state) => state.uf === wanted) ?? null
}

/** Filtro local por sigla **ou** nome (sem acento, case-insensitive). */
export function searchBrazilianStates(query: string): BrazilianState[] {
  const term = normalizeText(query)
  if (!term) return BRAZILIAN_STATES
  return BRAZILIAN_STATES.filter(
    (state) => normalizeText(state.label).includes(term) || normalizeText(state.uf).includes(term),
  )
}
