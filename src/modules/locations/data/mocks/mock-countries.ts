import type { CountryJson } from '../../domain/models'

/**
 * mock-countries — Brasil + alguns países (BACEN/ISO corretos) na fase mock-first.
 * O sistema opera com estrangeiros (decisão D2). TROCA POR API REAL:
 * `RestCountryProvider`; possível seed das tabelas BACEN/ISO.
 */
export const MOCK_COUNTRIES: CountryJson[] = [
  { codigo: 1, nome: 'Brasil', codigoBacen: '1058', iso2: 'BR', iso3: 'BRA', isoNumerico: '076', siscomex: '', ativo: true },
  { codigo: 2, nome: 'Argentina', codigoBacen: '0639', iso2: 'AR', iso3: 'ARG', isoNumerico: '032', siscomex: '', ativo: true },
  { codigo: 3, nome: 'Estados Unidos', codigoBacen: '2496', iso2: 'US', iso3: 'USA', isoNumerico: '840', siscomex: '', ativo: true },
  { codigo: 4, nome: 'Portugal', codigoBacen: '6076', iso2: 'PT', iso3: 'PRT', isoNumerico: '620', siscomex: '', ativo: true },
]
