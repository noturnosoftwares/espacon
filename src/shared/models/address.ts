/**
 * Address — endereço **compartilhado** do EspaçoN (decisão de produto P5 da spec
 * `employee-registration`): nasce em `shared` porque Funcionário, Cliente,
 * Fornecedor e Imóvel referenciam o mesmo conjunto de campos.
 *
 * Model imutável (use `copyAddress`), em inglês. Não tem `fromJson`/`toJson`
 * próprios: nos contratos atuais os campos vêm **achatados** no JSON do registro
 * dono (ex.: `endereco`, `numero`, `cidadeId`…), então a conversão vive no mapper
 * desse registro. `cityId`/`uf` são preenchidos pelo **lookup de cidade** (a UF
 * deriva da cidade selecionada). Campos de geolocalização (lat/long) entram no
 * futuro com o NoturnoMAPS.
 */
export interface Address {
  /** Logradouro (campo de busca, modo texto por ora). */
  street: string
  number: string
  complement: string
  district: string
  /** Id da cidade (futuro Cadastro de Cidades); preenchido pelo lookup. */
  cityId: number | null
  /** Nome exibido da cidade selecionada. */
  cityName: string
  /** UF derivada da cidade selecionada (somente leitura na UI). */
  uf: string
  zipCode: string
}

export function emptyAddress(): Address {
  return {
    street: '',
    number: '',
    complement: '',
    district: '',
    cityId: null,
    cityName: '',
    uf: '',
    zipCode: '',
  }
}

export function copyAddress(base: Address, changes: Partial<Address>): Address {
  return { ...base, ...changes }
}
