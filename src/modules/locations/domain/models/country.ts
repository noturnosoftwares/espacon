/**
 * Country — País (spec `locations/location-registry` §9.2). Fonte única; Estado
 * referencia País. Model imutável (`copyCountry`), em inglês, com `fromJson`/
 * `toJson`. Campos ISO/BACEN/SISCOMEX preparam NF-e e comércio exterior.
 */
export interface Country {
  id: number | null
  name: string
  /** Código BACEN (`cPais` da NF-e) — 4 dígitos. Brasil = `1058`. Único. */
  bacenCode: string
  /** ISO 3166-1 alpha-2 — `BR`. Único. */
  iso2: string
  /** ISO 3166-1 alpha-3 — `BRA`. */
  iso3: string
  /** ISO numérico — `076`. */
  isoNumeric: string
  /** Código SISCOMEX (comércio exterior). */
  siscomexCode: string
  active: boolean
}

export interface CountryJson {
  codigo: number | null
  nome: string
  codigoBacen: string
  iso2: string
  iso3: string
  isoNumerico: string
  siscomex: string
  ativo: boolean
}

/** Resumo leve para lookup consumido por outros cadastros (§9.2). */
export interface CountrySummary {
  id: number
  name: string
  iso2: string
}

export function countryFromJson(json: CountryJson): Country {
  return {
    id: json.codigo ?? null,
    name: json.nome ?? '',
    bacenCode: json.codigoBacen ?? '',
    iso2: (json.iso2 ?? '').toUpperCase(),
    iso3: (json.iso3 ?? '').toUpperCase(),
    isoNumeric: json.isoNumerico ?? '',
    siscomexCode: json.siscomex ?? '',
    active: json.ativo === true,
  }
}

export function countryToJson(country: Country): CountryJson {
  return {
    codigo: country.id,
    nome: country.name,
    codigoBacen: country.bacenCode,
    iso2: country.iso2,
    iso3: country.iso3,
    isoNumerico: country.isoNumeric,
    siscomex: country.siscomexCode,
    ativo: country.active,
  }
}

export function copyCountry(base: Country, changes: Partial<Country>): Country {
  return { ...base, ...changes }
}

export function emptyCountry(): Country {
  return {
    id: null,
    name: '',
    bacenCode: '',
    iso2: '',
    iso3: '',
    isoNumeric: '',
    siscomexCode: '',
    active: true,
  }
}

/** Rótulo exibido nos campos de referência. */
export function countryLabel(country: Pick<Country, 'name' | 'iso2'>): string {
  return country.iso2 ? `${country.iso2} — ${country.name}` : country.name
}

export function toCountrySummary(country: Country): CountrySummary {
  return { id: country.id ?? 0, name: country.name, iso2: country.iso2 }
}
