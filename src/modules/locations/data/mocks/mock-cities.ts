import type { CityJson } from '../../domain/models'

/**
 * mock-cities — capitais brasileiras com `cMun` IBGE (DV válido) e lat/long
 * (reuso no mapa). `estadoId` referencia o id do estado em `mock-states`.
 * Alíquotas IBS `null` (D3). TROCA POR API REAL: `RestCityProvider` (seed IBGE).
 */
const RAW: ReadonlyArray<readonly [number, number, string, string, string, number, number]> = [
  // id, estadoId, uf, cMun, nome, lat, long
  [1, 20, 'SP', '3550308', 'São Paulo', -23.5505, -46.6333],
  [2, 19, 'RJ', '3304557', 'Rio de Janeiro', -22.9068, -43.1729],
  [3, 17, 'MG', '3106200', 'Belo Horizonte', -19.9167, -43.9345],
  [4, 16, 'BA', '2927408', 'Salvador', -12.9714, -38.5014],
  [5, 10, 'CE', '2304400', 'Fortaleza', -3.7319, -38.5267],
  [6, 13, 'PE', '2611606', 'Recife', -8.0476, -34.877],
  [7, 21, 'PR', '4106902', 'Curitiba', -25.4284, -49.2733],
  [8, 23, 'RS', '4314902', 'Porto Alegre', -30.0346, -51.2177],
  [9, 22, 'SC', '4205407', 'Florianópolis', -27.5949, -48.5482],
  [10, 27, 'DF', '5300108', 'Brasília', -15.7939, -47.8828],
  [11, 26, 'GO', '5208707', 'Goiânia', -16.6869, -49.2648],
  [12, 3, 'AM', '1302603', 'Manaus', -3.119, -60.0217],
]

export const MOCK_CITIES: CityJson[] = RAW.map(
  ([codigo, estadoId, uf, codigoIbge, nome, latitude, longitude]) => ({
    codigo,
    estadoId,
    uf,
    paisId: 1,
    paisNome: 'Brasil',
    codigoIbge,
    nome,
    codigoTom: '',
    capital: true,
    latitude,
    longitude,
    aliquotaIbsMunicipal: null,
    aliquotaReferenciaMunicipal: null,
    competenciaMunicipalEspecial: false,
    ativo: true,
  }),
)
