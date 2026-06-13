/**
 * SupplierType — **natureza** do fornecedor (spec §4.1). Define rótulos, máscara do
 * documento e obrigatoriedade. **Genérico** = sem dados da pessoa (DAS/DARF/DARE…).
 */
export enum SupplierType {
  Generic = 'GENERICO', // sem dados da pessoa (guias/recolhimentos)
  Individual = 'FISICA', // CPF
  Company = 'JURIDICA', // CNPJ
}

export const SUPPLIER_TYPES: readonly SupplierType[] = [
  SupplierType.Company,
  SupplierType.Individual,
  SupplierType.Generic,
]

export function supplierTypeLabel(type: SupplierType): string {
  switch (type) {
    case SupplierType.Company:
      return 'Pessoa Jurídica'
    case SupplierType.Individual:
      return 'Pessoa Física'
    case SupplierType.Generic:
      return 'Genérico'
  }
}

/** Rótulo curto para badge no grid. */
export function supplierTypeShortLabel(type: SupplierType): string {
  switch (type) {
    case SupplierType.Company:
      return 'PJ'
    case SupplierType.Individual:
      return 'PF'
    case SupplierType.Generic:
      return 'Genérico'
  }
}

export function toSupplierType(value: string | null | undefined): SupplierType {
  return (SUPPLIER_TYPES as readonly string[]).includes(value ?? '')
    ? (value as SupplierType)
    : SupplierType.Company
}

/** Fornecedor sem dados da pessoa (só Razão + Situação). */
export function isGenericType(type: SupplierType): boolean {
  return type === SupplierType.Generic
}

/** Rótulo do campo documento conforme a natureza. */
export function documentLabel(type: SupplierType): string {
  return type === SupplierType.Individual ? 'CPF' : 'CNPJ'
}

/** Rótulo do campo "razão/nome" conforme a natureza. */
export function legalNameLabel(type: SupplierType): string {
  return type === SupplierType.Individual ? 'Nome' : 'Razão Social'
}

/** Rótulo de IE/RG conforme a natureza. */
export function stateRegistrationLabel(type: SupplierType): string {
  return type === SupplierType.Individual ? 'RG' : 'Inscrição Estadual'
}
