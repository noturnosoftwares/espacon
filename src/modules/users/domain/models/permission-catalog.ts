import { normalizePermissionKey } from '@/shared/extensions'
import { type PermissionAction, toPermissionAction } from '@/shared/access'

/**
 * PermissionCatalogEntry — uma entrada da **lista mestra** de recursos do ERP
 * (telas, botões e features), agrupada por sessão. O catálogo é a fonte da
 * matriz de permissões; a sidebar é apenas um de seus consumidores (catálogo ≠
 * menu). Itens de menu e não-menu convivem (ex.: "Desbloquear Cliente").
 */
export interface PermissionCatalogEntry {
  code: string
  /** Descrição normalizada (UPPER, sem acento) — chave de autorização. */
  key: string
  label: string
  section: string
  /** Dica de UI: ações suportadas pelo recurso. Ausente = todas as 9. */
  supportedActions?: PermissionAction[]
}

export interface PermissionCatalogEntryJson {
  code: string
  label: string
  section: string
  key?: string
  supportedActions?: string[]
}

export function permissionCatalogEntryFromJson(
  json: PermissionCatalogEntryJson,
): PermissionCatalogEntry {
  const supported = json.supportedActions
    ?.map(toPermissionAction)
    .filter((action): action is PermissionAction => action !== null)

  return {
    code: json.code,
    label: json.label,
    section: json.section,
    key: json.key ? normalizePermissionKey(json.key) : normalizePermissionKey(json.label),
    ...(supported && supported.length > 0 ? { supportedActions: supported } : {}),
  }
}
