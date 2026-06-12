/**
 * City — Cidade/Município (spec `locations/location-registry` §9.2). Referencia
 * Estado (FK); UF e País são **denormalizados** do estado. Carrega os campos
 * fiscais da Reforma (IBS municipal) e geolocalização (reuso no mapa). Model
 * imutável (`copyCity`), em inglês, com mappers.
 */
export interface City {
  id: number | null
  stateId: number
  /** Denormalizado (do estado selecionado). */
  uf: string
  countryId: number
  countryName: string
  /** Código IBGE do município (`cMun`) — 7 dígitos com DV (Brasil). */
  ibgeCode: string
  name: string
  /** Código TOM/SIAFI (opcional). */
  tomCode: string
  isCapital: boolean
  latitude: number | null
  longitude: number | null
  // --- Fiscal (Reforma Tributária) ---
  ibsMunicipalRate: number | null
  ibsMunicipalReferenceRate: number | null
  /** Ex.: Fernando de Noronha (competência exercida por PE). */
  hasSpecialMunicipalCompetence: boolean
  active: boolean
}

export interface CityJson {
  codigo: number | null
  estadoId: number
  uf: string
  paisId: number
  paisNome: string
  codigoIbge: string
  nome: string
  codigoTom: string
  capital: boolean
  latitude: number | null
  longitude: number | null
  aliquotaIbsMunicipal: number | null
  aliquotaReferenciaMunicipal: number | null
  competenciaMunicipalEspecial: boolean
  ativo: boolean
}

/** Resumo leve para lookup consumido por outros cadastros (§9.2). */
export interface CitySummary {
  id: number
  name: string
  uf: string
  stateId: number
}

export function cityFromJson(json: CityJson): City {
  return {
    id: json.codigo ?? null,
    stateId: json.estadoId,
    uf: (json.uf ?? '').toUpperCase(),
    countryId: json.paisId,
    countryName: json.paisNome ?? '',
    ibgeCode: json.codigoIbge ?? '',
    name: json.nome ?? '',
    tomCode: json.codigoTom ?? '',
    isCapital: json.capital === true,
    latitude: json.latitude ?? null,
    longitude: json.longitude ?? null,
    ibsMunicipalRate: json.aliquotaIbsMunicipal ?? null,
    ibsMunicipalReferenceRate: json.aliquotaReferenciaMunicipal ?? null,
    hasSpecialMunicipalCompetence: json.competenciaMunicipalEspecial === true,
    active: json.ativo === true,
  }
}

export function cityToJson(city: City): CityJson {
  return {
    codigo: city.id,
    estadoId: city.stateId,
    uf: city.uf,
    paisId: city.countryId,
    paisNome: city.countryName,
    codigoIbge: city.ibgeCode,
    nome: city.name,
    codigoTom: city.tomCode,
    capital: city.isCapital,
    latitude: city.latitude,
    longitude: city.longitude,
    aliquotaIbsMunicipal: city.ibsMunicipalRate,
    aliquotaReferenciaMunicipal: city.ibsMunicipalReferenceRate,
    competenciaMunicipalEspecial: city.hasSpecialMunicipalCompetence,
    ativo: city.active,
  }
}

export function copyCity(base: City, changes: Partial<City>): City {
  return { ...base, ...changes }
}

export function emptyCity(): City {
  return {
    id: null,
    stateId: 0,
    uf: '',
    countryId: 0,
    countryName: '',
    ibgeCode: '',
    name: '',
    tomCode: '',
    isCapital: false,
    latitude: null,
    longitude: null,
    ibsMunicipalRate: null,
    ibsMunicipalReferenceRate: null,
    hasSpecialMunicipalCompetence: false,
    active: true,
  }
}

export function cityLabel(city: Pick<City, 'name' | 'uf'>): string {
  return city.uf ? `${city.name} — ${city.uf}` : city.name
}

export function toCitySummary(city: City): CitySummary {
  return { id: city.id ?? 0, name: city.name, uf: city.uf, stateId: city.stateId }
}
