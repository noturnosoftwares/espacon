/** Situação do fornecedor (spec §4.6). */
export enum SupplierStatus {
  Active = 'ATIVO',
  Inactive = 'INATIVO',
}

export const SUPPLIER_STATUSES: readonly SupplierStatus[] = [
  SupplierStatus.Active,
  SupplierStatus.Inactive,
]

export function supplierStatusLabel(status: SupplierStatus): string {
  return status === SupplierStatus.Active ? 'Ativo' : 'Inativo'
}

export function supplierStatusSeverity(
  status: SupplierStatus,
): 'success' | 'danger' | 'warning' | 'info' | 'neutral' {
  return status === SupplierStatus.Active ? 'success' : 'neutral'
}

export function toSupplierStatus(value: string | null | undefined): SupplierStatus {
  return value === SupplierStatus.Inactive ? SupplierStatus.Inactive : SupplierStatus.Active
}
