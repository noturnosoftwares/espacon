import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseStore } from '@/shared/stores'
import type { PermissionCatalogEntry } from '../../domain/models'
import { makeGetPermissionCatalogUseCase } from '../../data/application'

/** Catálogo agrupado por sessão (uma seção da matriz). */
export interface CatalogSection {
  section: string
  entries: PermissionCatalogEntry[]
}

/**
 * usePermissionCatalogStore — cache da lista mestra de recursos do ERP.
 *
 * O catálogo muda pouco: carrega **uma vez** (`ensureLoaded`) e fica em cache
 * (singleton Pinia) para alimentar a matriz de permissões em usuário e perfil.
 */
export const usePermissionCatalogStore = defineStore('permission-catalog', () => {
  const base = useBaseStore()
  const getCatalog = makeGetPermissionCatalogUseCase()

  const entries = ref<PermissionCatalogEntry[]>([])

  /** Recursos agrupados por sessão, preservando a ordem de chegada. */
  const sections = computed<CatalogSection[]>(() => {
    const grouped = new Map<string, PermissionCatalogEntry[]>()
    for (const entry of entries.value) {
      const list = grouped.get(entry.section) ?? []
      list.push(entry)
      grouped.set(entry.section, list)
    }
    return [...grouped.entries()].map(([section, sectionEntries]) => ({
      section,
      entries: sectionEntries,
    }))
  })

  /** Carrega o catálogo apenas se ainda não houver dados (cache). */
  async function ensureLoaded(): Promise<void> {
    if (entries.value.length > 0) return
    const data = await base.run(() => getCatalog())
    if (data) {
      entries.value = data
      base.markInitialized()
    }
  }

  return { ...base, entries, sections, ensureLoaded }
})
