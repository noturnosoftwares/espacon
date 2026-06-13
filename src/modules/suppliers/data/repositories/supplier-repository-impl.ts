import { type AsyncResult, guard, notFoundError, serverError } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import { normalizeText } from '@/shared/extensions'
import {
  type Supplier,
  SupplierStatus,
  SupplierType,
  supplierDisplayName,
  supplierFromJson,
  supplierToJson,
} from '../../domain/models'
import type {
  ListSuppliersParams,
  SupplierRepository,
  SupplierTotals,
} from '../../domain/repositories'
import { MockSupplierProvider } from '../providers/mock-supplier-provider'

/**
 * SupplierRepositoryImpl — mappers + filtro/ordenação/paginação client-side +
 * `guard`. Busca casa por **código, razão/fantasia ou documento**. Ordena por
 * código. `getTotals` agrega o cache do mock.
 */
export class SupplierRepositoryImpl implements SupplierRepository {
  constructor(private readonly provider: MockSupplierProvider) {}

  list(params: ListSuppliersParams): Promise<AsyncResult<PageResult<Supplier>>> {
    return guard(
      async () => {
        const all = (await this.provider.list()).map(supplierFromJson)
        const search = params.filters?.search ? normalizeText(params.filters.search) : ''
        const status = params.filters?.status ?? 'all'
        const type = params.filters?.type ?? 'all'
        const filtered = all.filter((s) => {
          const matchesText =
            !search ||
            String(s.id ?? '').includes(search) ||
            normalizeText(supplierDisplayName(s)).includes(search) ||
            normalizeText(s.legalName).includes(search) ||
            normalizeText(s.document).includes(search)
          const matchesStatus = status === 'all' || s.status === status
          const matchesType = type === 'all' || s.type === type
          return matchesText && matchesStatus && matchesType
        })
        const sorted = filtered.sort((a, b) => (a.id ?? 0) - (b.id ?? 0))
        const start = (params.page - 1) * params.pageSize
        return { items: sorted.slice(start, start + params.pageSize), total: sorted.length }
      },
      (cause) => serverError('Não foi possível carregar os fornecedores.', { cause }),
    )
  }

  getById(id: number): Promise<AsyncResult<Supplier>> {
    return guard(
      async () => {
        const json = await this.provider.getById(id)
        if (!json) throw new Error('NOT_FOUND')
        return supplierFromJson(json)
      },
      (cause) => this.mapError(cause, 'Não foi possível carregar o fornecedor.'),
    )
  }

  save(supplier: Supplier): Promise<AsyncResult<Supplier>> {
    return guard(
      async () => supplierFromJson(await this.provider.save(supplierToJson(supplier))),
      (cause) => this.mapError(cause, 'Não foi possível salvar o fornecedor.'),
    )
  }

  inactivate(id: number): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.inactivate(id),
      (cause) => this.mapError(cause, 'Não foi possível inativar o fornecedor.'),
    )
  }

  remove(id: number): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.remove(id),
      (cause) => this.mapError(cause, 'Não foi possível excluir o fornecedor.'),
    )
  }

  getTotals(): Promise<AsyncResult<SupplierTotals>> {
    return guard(
      async () => {
        const all = (await this.provider.totals()).map(supplierFromJson)
        return {
          total: all.length,
          active: all.filter((s) => s.status === SupplierStatus.Active).length,
          inactive: all.filter((s) => s.status === SupplierStatus.Inactive).length,
          company: all.filter((s) => s.type === SupplierType.Company).length,
          individual: all.filter((s) => s.type === SupplierType.Individual).length,
          generic: all.filter((s) => s.type === SupplierType.Generic).length,
        }
      },
      (cause) => serverError('Não foi possível carregar os totais de fornecedores.', { cause }),
    )
  }

  private mapError(cause: unknown, fallback: string) {
    if (cause instanceof Error && cause.message === 'NOT_FOUND') {
      return notFoundError('Fornecedor não encontrado.', { cause })
    }
    return serverError(fallback, { cause })
  }
}
