/**
 * City — registro de cidade para o **lookup** de endereço (ver spec
 * `employee-registration` §10). Vem do futuro Cadastro de Cidades e já traz a UF,
 * que preenche automaticamente a UF do endereço ao selecionar.
 */
export interface City {
  id: number
  name: string
  uf: string
}

export interface CityJson {
  id: number
  name: string
  uf: string
}

export function cityFromJson(json: CityJson): City {
  return { id: json.id, name: json.name, uf: json.uf }
}
