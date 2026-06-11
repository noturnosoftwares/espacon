import { type AsyncResult, guard, serverError } from '@/shared/result'
import { type PermissionCatalogEntry, permissionCatalogEntryFromJson } from '../../domain/models'
import type { PermissionCatalogRepository } from '../../domain/repositories'
import { MockPermissionCatalogProvider } from '../providers/mock-permission-catalog-provider'

/**
 * PermissionCatalogRepositoryImpl — converte o JSON do catálogo em models e
 * protege a presentation de exceptions cruas. Provider injetado (mock → REST).
 */
export class PermissionCatalogRepositoryImpl implements PermissionCatalogRepository {
  constructor(private readonly provider: MockPermissionCatalogProvider) {}

  getCatalog(): Promise<AsyncResult<PermissionCatalogEntry[]>> {
    return guard(
      async () => (await this.provider.getCatalog()).map(permissionCatalogEntryFromJson),
      (cause) => serverError('Não foi possível carregar o catálogo de permissões.', { cause }),
    )
  }
}
