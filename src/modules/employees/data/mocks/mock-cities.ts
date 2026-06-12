import type { CityJson } from '../../domain/models'

/**
 * mock-cities — capitais brasileiras com UF (id = código IBGE do município), até o
 * **Cadastro de Cidades** existir. Suficiente para exercitar o lookup de cidade
 * (que preenche a UF do endereço). CEPs dos mocks de funcionário são coerentes com
 * estas UFs (ver `isCepWithinUf`).
 *
 * TROCA POR API REAL: `RestCityProvider` (`GET /cities?q=`).
 */
export const MOCK_CITIES: CityJson[] = [
  { id: 3550308, name: 'São Paulo', uf: 'SP' },
  { id: 3304557, name: 'Rio de Janeiro', uf: 'RJ' },
  { id: 3106200, name: 'Belo Horizonte', uf: 'MG' },
  { id: 2927408, name: 'Salvador', uf: 'BA' },
  { id: 2304400, name: 'Fortaleza', uf: 'CE' },
  { id: 2611606, name: 'Recife', uf: 'PE' },
  { id: 4106902, name: 'Curitiba', uf: 'PR' },
  { id: 4314902, name: 'Porto Alegre', uf: 'RS' },
  { id: 4205407, name: 'Florianópolis', uf: 'SC' },
  { id: 5300108, name: 'Brasília', uf: 'DF' },
  { id: 5208707, name: 'Goiânia', uf: 'GO' },
  { id: 1302603, name: 'Manaus', uf: 'AM' },
  { id: 1501402, name: 'Belém', uf: 'PA' },
  { id: 2111300, name: 'São Luís', uf: 'MA' },
  { id: 2408102, name: 'Natal', uf: 'RN' },
  { id: 5103403, name: 'Cuiabá', uf: 'MT' },
]
