import type { PermissionJson } from '@/shared/access'
import { MOCK_PERMISSION_CATALOG } from './mock-permission-catalog'

/**
 * Helpers de mock para montar `PermissionJson` a partir do catálogo, sem repetir
 * label/section. Usados por perfis e usuários mockados.
 */
const CATALOG_BY_CODE = new Map(MOCK_PERMISSION_CATALOG.map((entry) => [entry.code, entry]))

/**
 * grant — cria a permissão de um recurso (por `code` do catálogo) com as ações
 * informadas ligadas (as demais ficam `false`). Lança se o código não existir
 * no catálogo (erro de mock, nunca silencioso).
 */
export function grant(code: string, ...enabledActions: string[]): PermissionJson {
  const entry = CATALOG_BY_CODE.get(code)
  if (!entry) throw new Error(`Mock inválido: recurso "${code}" não está no catálogo.`)

  const actions: Record<string, boolean> = {}
  for (const action of enabledActions) actions[action] = true

  return { code: entry.code, label: entry.label, section: entry.section, actions }
}
