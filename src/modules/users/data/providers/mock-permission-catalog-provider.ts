import type { PermissionCatalogEntryJson } from '../../domain/models'
import { MOCK_PERMISSION_CATALOG } from '../mocks/mock-permission-catalog'

/**
 * MockPermissionCatalogProvider — fornece a lista mestra de recursos (catálogo)
 * na fase mock-first. Catálogo muda pouco → cache na store de presentation.
 *
 * TROCA POR API REAL: `RestPermissionCatalogProvider` (`GET /permissions/catalog`).
 */
const MOCK_LATENCY_MS = 300

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockPermissionCatalogProvider {
  async getCatalog(): Promise<PermissionCatalogEntryJson[]> {
    await delay(MOCK_LATENCY_MS)
    return MOCK_PERMISSION_CATALOG
  }
}
