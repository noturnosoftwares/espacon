import { useSessionStore } from '@/modules/auth/presentation/stores'
import type { PermissionAction } from './permission-action'

/** Coringa de "libera tudo" carregado pela sessão de admin (mock atual). */
const WILDCARD = '*'

/**
 * useAccess — glue de presentation para autorização declarativa. Qualquer
 * componente pergunta `can('CONTRATO', PermissionAction.Open)` e o checker
 * resolve sobre o usuário em sessão.
 *
 * ┌─ Seam conhecido (ver plano/ADR-008) ───────────────────────────────────────┐
 * │ A sessão atual (`AuthUser`) carrega `permissions: string[]` com `'*'`        │
 * │ (admin = tudo). Enquanto a sessão não carregar `Permission[]` rico, a        │
 * │ resolução honra o coringa `'*'` e, na ausência dele, casa pela presença da   │
 * │ chave do recurso na lista. Quando o contrato de login passar a emitir        │
 * │ `Permission[]`, troca-se este corpo por `checkAccess(subject, request)` sem  │
 * │ alterar os consumidores (sidebar, guards, `v-can`).                          │
 * └─────────────────────────────────────────────────────────────────────────────┘
 */
export function useAccess() {
  const session = useSessionStore()

  function can(permissionKey: string, _action: PermissionAction): boolean {
    const permissions = session.user?.permissions ?? []
    if (permissions.length === 0) return false
    if (permissions.includes(WILDCARD)) return true
    return permissions.includes(permissionKey)
  }

  function cannot(permissionKey: string, action: PermissionAction): boolean {
    return !can(permissionKey, action)
  }

  return { can, cannot }
}
