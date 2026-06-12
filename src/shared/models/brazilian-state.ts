import { normalizeText } from '@/shared/extensions'

/**
 * BrazilianState — Unidade Federativa (estado) do Brasil. Referência **estável**
 * usada em endereços e naturalidade. Hoje é uma lista estática; quando o
 * **Cadastro de Estados/UF** existir no backend, o `searchStates` passa a vir da
 * API sem alterar o widget/form (regra do produto: campo de referência nasce como
 * **busca inline**).
 *
 * Contrato: `uf` (sigla de 2 letras, ex.: `'SP'`) é o que se grava; `label`
 * (`'SP — São Paulo'`) é o que se exibe e por onde se pesquisa.
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

/** Resolve um estado pela sigla (UF) — usado para exibir a seleção atual. */
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
