import type { StateJson } from '../../domain/models'

/**
 * mock-states — as 27 UFs do Brasil (`paisId = 1`) com `cUF` IBGE, sigla, nome e
 * região; DF com competência híbrida (D7). Alíquotas IBS ficam `null` (definidas
 * por lei depois — D3). TROCA POR API REAL: `RestStateProvider`.
 */
const RAW: ReadonlyArray<readonly [number, string, string, string, string]> = [
  // id, cUF, sigla, nome, região
  [1, '11', 'RO', 'Rondônia', 'NORTE'],
  [2, '12', 'AC', 'Acre', 'NORTE'],
  [3, '13', 'AM', 'Amazonas', 'NORTE'],
  [4, '14', 'RR', 'Roraima', 'NORTE'],
  [5, '15', 'PA', 'Pará', 'NORTE'],
  [6, '16', 'AP', 'Amapá', 'NORTE'],
  [7, '17', 'TO', 'Tocantins', 'NORTE'],
  [8, '21', 'MA', 'Maranhão', 'NORDESTE'],
  [9, '22', 'PI', 'Piauí', 'NORDESTE'],
  [10, '23', 'CE', 'Ceará', 'NORDESTE'],
  [11, '24', 'RN', 'Rio Grande do Norte', 'NORDESTE'],
  [12, '25', 'PB', 'Paraíba', 'NORDESTE'],
  [13, '26', 'PE', 'Pernambuco', 'NORDESTE'],
  [14, '27', 'AL', 'Alagoas', 'NORDESTE'],
  [15, '28', 'SE', 'Sergipe', 'NORDESTE'],
  [16, '29', 'BA', 'Bahia', 'NORDESTE'],
  [17, '31', 'MG', 'Minas Gerais', 'SUDESTE'],
  [18, '32', 'ES', 'Espírito Santo', 'SUDESTE'],
  [19, '33', 'RJ', 'Rio de Janeiro', 'SUDESTE'],
  [20, '35', 'SP', 'São Paulo', 'SUDESTE'],
  [21, '41', 'PR', 'Paraná', 'SUL'],
  [22, '42', 'SC', 'Santa Catarina', 'SUL'],
  [23, '43', 'RS', 'Rio Grande do Sul', 'SUL'],
  [24, '50', 'MS', 'Mato Grosso do Sul', 'CENTRO_OESTE'],
  [25, '51', 'MT', 'Mato Grosso', 'CENTRO_OESTE'],
  [26, '52', 'GO', 'Goiás', 'CENTRO_OESTE'],
  [27, '53', 'DF', 'Distrito Federal', 'CENTRO_OESTE'],
]

export const MOCK_STATES: StateJson[] = RAW.map(([codigo, codigoIbge, uf, nome, regiao]) => ({
  codigo,
  paisId: 1,
  paisNome: 'Brasil',
  codigoIbge,
  uf,
  nome,
  regiao,
  aliquotaIbsEstadual: null,
  aliquotaReferenciaEstadual: null,
  competenciaHibrida: uf === 'DF',
  ativo: true,
}))
