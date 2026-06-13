import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { Supplier } from '../../domain/models'
import type {
  ListSuppliersParams,
  SupplierRepository,
  SupplierTotals,
} from '../../domain/repositories'
import { SupplierRepositoryImpl } from '../repositories/supplier-repository-impl'
import { MockSupplierProvider } from '../providers/mock-supplier-provider'

/**
 * UseCases do fornecedor (spec §12): pesquisa paginada (scroll infinito), busca
 * por id, salvar, **inativar** (soft), excluir (físico, só se nunca referenciado)
 * e totais (dashboard). Factory explícita; troca por REST não afeta store/widget.
 */
export interface SuppliersUseCases {
  getSuppliers: (params: ListSuppliersParams) => Promise<AsyncResult<PageResult<Supplier>>>
  getSupplierById: (id: number) => Promise<AsyncResult<Supplier>>
  saveSupplier: (supplier: Supplier) => Promise<AsyncResult<Supplier>>
  inactivateSupplier: (id: number) => Promise<AsyncResult<void>>
  deleteSupplier: (id: number) => Promise<AsyncResult<void>>
  getSupplierTotals: () => Promise<AsyncResult<SupplierTotals>>
}

export function makeSupplierRepository(): SupplierRepository {
  return new SupplierRepositoryImpl(new MockSupplierProvider())
}

export function makeSuppliersUseCases(): SuppliersUseCases {
  const repository = makeSupplierRepository()
  return {
    getSuppliers: (params) => repository.list(params),
    getSupplierById: (id) => repository.getById(id),
    saveSupplier: (supplier) => repository.save(supplier),
    inactivateSupplier: (id) => repository.inactivate(id),
    deleteSupplier: (id) => repository.remove(id),
    getSupplierTotals: () => repository.getTotals(),
  }
}
