import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { Supplier } from '../models'
import type { SupplierStatus } from '../enums/supplier-status'
import type { SupplierType } from '../enums/supplier-type'

export type SupplierStatusFilter = 'all' | SupplierStatus
export type SupplierTypeFilter = 'all' | SupplierType

export interface SupplierFilters {
  /** Casa por código, razão/fantasia ou documento. */
  search?: string
  status?: SupplierStatusFilter
  type?: SupplierTypeFilter
}

export interface ListSuppliersParams {
  page: number
  pageSize: number
  filters: SupplierFilters | null
}

/** Totais para o dashboard de pesquisa (§14.5). */
export interface SupplierTotals {
  total: number
  active: number
  inactive: number
  company: number
  individual: number
  generic: number
}

/**
 * SupplierRepository — CRUD do fornecedor (spec §12/§13). `inactivate` é a
 * **inativação soft** (padrão cash-operator); `remove` só quando nunca
 * referenciado (a autoridade é do backend — D7). `getTotals` alimenta o dashboard.
 */
export interface SupplierRepository {
  list(params: ListSuppliersParams): Promise<AsyncResult<PageResult<Supplier>>>
  getById(id: number): Promise<AsyncResult<Supplier>>
  save(supplier: Supplier): Promise<AsyncResult<Supplier>>
  inactivate(id: number): Promise<AsyncResult<void>>
  remove(id: number): Promise<AsyncResult<void>>
  getTotals(): Promise<AsyncResult<SupplierTotals>>
}
