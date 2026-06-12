import { BrazilRegion, toBrazilRegion } from '../enums/brazil-region'

/**
 * State — Estado/UF (spec `locations/location-registry` §9.2). Referencia País
 * (FK obrigatória) e carrega os campos fiscais da Reforma Tributária (IBS
 * estadual). Model imutável (`copyState`), em inglês, com mappers.
 */
export interface State {
  id: number | null
  countryId: number
  /** Denormalizado para exibição (vem do lookup de País). */
  countryName: string
  /** Código IBGE da UF (`cUF`) — 2 dígitos (Brasil). Vazio p/ estrangeiro. */
  ibgeCode: string
  /** Sigla — `SP`. Única no país. */
  uf: string
  name: string
  /** Derivada do `cUF` (só Brasil). */
  region: BrazilRegion | null
  // --- Fiscal (Reforma Tributária) ---
  /** Alíquota-padrão IBS estadual (%). */
  ibsStateRate: number | null
  /** Alíquota de referência estadual (%) — baliza do Senado. */
  ibsStateReferenceRate: number | null
  /** DF: exerce competência estadual + municipal. */
  hasHybridCompetence: boolean
  active: boolean
}

export interface StateJson {
  codigo: number | null
  paisId: number
  paisNome: string
  codigoIbge: string
  uf: string
  nome: string
  regiao: string | null
  aliquotaIbsEstadual: number | null
  aliquotaReferenciaEstadual: number | null
  competenciaHibrida: boolean
  ativo: boolean
}

/** Resumo leve para lookup (§9.2). */
export interface StateSummary {
  id: number
  uf: string
  name: string
  countryId: number
}

export function stateFromJson(json: StateJson): State {
  return {
    id: json.codigo ?? null,
    countryId: json.paisId,
    countryName: json.paisNome ?? '',
    ibgeCode: json.codigoIbge ?? '',
    uf: (json.uf ?? '').toUpperCase(),
    name: json.nome ?? '',
    region: toBrazilRegion(json.regiao),
    ibsStateRate: json.aliquotaIbsEstadual ?? null,
    ibsStateReferenceRate: json.aliquotaReferenciaEstadual ?? null,
    hasHybridCompetence: json.competenciaHibrida === true,
    active: json.ativo === true,
  }
}

export function stateToJson(state: State): StateJson {
  return {
    codigo: state.id,
    paisId: state.countryId,
    paisNome: state.countryName,
    codigoIbge: state.ibgeCode,
    uf: state.uf,
    nome: state.name,
    regiao: state.region,
    aliquotaIbsEstadual: state.ibsStateRate,
    aliquotaReferenciaEstadual: state.ibsStateReferenceRate,
    competenciaHibrida: state.hasHybridCompetence,
    ativo: state.active,
  }
}

export function copyState(base: State, changes: Partial<State>): State {
  return { ...base, ...changes }
}

export function emptyState(): State {
  return {
    id: null,
    countryId: 0,
    countryName: '',
    ibgeCode: '',
    uf: '',
    name: '',
    region: null,
    ibsStateRate: null,
    ibsStateReferenceRate: null,
    hasHybridCompetence: false,
    active: true,
  }
}

export function stateLabel(state: Pick<State, 'uf' | 'name'>): string {
  return state.uf ? `${state.uf} — ${state.name}` : state.name
}

export function toStateSummary(state: State): StateSummary {
  return { id: state.id ?? 0, uf: state.uf, name: state.name, countryId: state.countryId }
}
