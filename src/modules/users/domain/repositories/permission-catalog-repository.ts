import type { AsyncResult } from '@/shared/result'
import type { PermissionCatalogEntry } from '../models'

/**
 * PermissionCatalogRepository — fornece a lista mestra de recursos do ERP
 * (catálogo) que alimenta a matriz de permissões. Muda pouco → bom candidato a
 * cache (ver store do catálogo).
 */
export interface PermissionCatalogRepository {
  getCatalog(): Promise<AsyncResult<PermissionCatalogEntry[]>>
}
