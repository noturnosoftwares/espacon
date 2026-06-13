/**
 * PersonAddress — endereço **compartilhado** de cadastro de pessoa (ADR-010).
 * Promovido a `shared/domain` quando surgiu o 2º consumidor (Fornecedor; antes só
 * Funcionário). **Todo cadastro de pessoa** (Funcionário, Fornecedor e, no futuro,
 * Cliente/Transportadora/Franquia) usa este model + a seção `AddressSection`.
 *
 * Model imutável (use `copyPersonAddress`), em inglês. Não tem `fromJson`/`toJson`
 * próprios: os campos vêm **achatados** no JSON do registro dono (`endereco`,
 * `cidadeId`…), então a conversão vive no mapper desse registro. `cityId` é FK do
 * módulo `locations`; `cityName`/`uf`/`countryId`/`countryName` são **denormalizados**
 * (somente leitura, derivados da cidade selecionada no lookup).
 */
export interface PersonAddress {
  /** Logradouro (campo de busca, modo texto por ora). */
  street: string
  number: string
  complement: string
  district: string
  /** Id da cidade (FK do módulo `locations`); preenchido pelo lookup de Cidade. */
  cityId: number | null
  /** Nome exibido da cidade selecionada. */
  cityName: string
  /** UF derivada da cidade selecionada (somente leitura). */
  uf: string
  /** Id do país (FK do módulo `locations`); derivado da cidade. */
  countryId: number | null
  /** Nome do país derivado da cidade (somente leitura). */
  countryName: string
  zipCode: string
}

export function emptyPersonAddress(): PersonAddress {
  return {
    street: '',
    number: '',
    complement: '',
    district: '',
    cityId: null,
    cityName: '',
    uf: '',
    countryId: null,
    countryName: '',
    zipCode: '',
  }
}

export function copyPersonAddress(
  base: PersonAddress,
  changes: Partial<PersonAddress>,
): PersonAddress {
  return { ...base, ...changes }
}
