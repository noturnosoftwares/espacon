import type { AsyncResult } from '@/shared/result'
import type { PermissionCatalogEntry } from '../../domain/models'
import type { PermissionCatalogRepository } from '../../domain/repositories'
import { PermissionCatalogRepositoryImpl } from '../repositories/permission-catalog-repository-impl'
import { MockPermissionCatalogProvider } from '../providers/mock-permission-catalog-provider'

export type GetPermissionCatalogUseCase = () => Promise<AsyncResult<PermissionCatalogEntry[]>>

export function makePermissionCatalogRepository(): PermissionCatalogRepository {
  return new PermissionCatalogRepositoryImpl(new MockPermissionCatalogProvider())
}

/**
 * makeGetPermissionCatalogUseCase — carrega a lista mestra de recursos.
 *
 * TROCA POR API REAL: trocar `MockPermissionCatalogProvider` por `Rest...`.
 */
export function makeGetPermissionCatalogUseCase(): GetPermissionCatalogUseCase {
  const repository = makePermissionCatalogRepository()
  return () => repository.getCatalog()
}
