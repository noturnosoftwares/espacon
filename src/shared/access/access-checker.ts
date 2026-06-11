import type { AccessRequest, AuthorizationResult } from './deny-reason'
import { type Permission, hasAction } from './permission'
import { type PermissionAction, ALL_ACTIONS } from './permission-action'
import {
  type AccessTimeRestriction,
  type IpRestriction,
  isIpAllowed,
  isWithinTimeRestriction,
} from './restrictions'

/**
 * Sujeito da autorização — o mínimo que o checker precisa do usuário em sessão.
 * Estrutural (não acopla o kernel ao model `User` nem ao `AuthUser`): qualquer
 * objeto com estes campos serve.
 */
export interface AccessSubject {
  /** FONTE DA VERDADE de acesso (o perfil nunca é consultado). */
  permissions: Permission[]
  /** Habilita features que atravessam empresas (portão remoto). */
  remote: boolean
  accessTimeRestriction: AccessTimeRestriction
  ipRestriction: IpRestriction
}

function findPermission(permissions: Permission[], key: string): Permission | undefined {
  return permissions.find((permission) => permission.key === key)
}

/**
 * checkAccess — função **pura** que aplica os portões da spec sobre as
 * permissões já carregadas do usuário. Síncrona, sem efeitos colaterais.
 *
 * Portões, na ordem:
 * 1. **Base:** a ação precisa estar `true` no recurso, senão nega.
 * 2. **Remoto (cross-company):** quando `remoteContext`, exige `user.remote` e a
 *    ação `remote` `true` no próprio recurso.
 * 3. **Horário/IP:** quando houver restrição, precisa estar dentro da janela e o
 *    IP precisa ser permitido.
 *
 * @param subject  Usuário em sessão (permissões + remoto + restrições).
 * @param request  Recurso/ação declarados pelo consumidor (sidebar, guard, botão).
 */
export function checkAccess(subject: AccessSubject, request: AccessRequest): AuthorizationResult {
  const permission = findPermission(subject.permissions, request.permissionKey)

  // 1. Base
  if (!permission || !hasAction(permission, request.action)) {
    return { allowed: false, reason: 'NO_PERMISSION' }
  }

  // 2. Remoto (apenas quando a operação atravessa empresas)
  if (request.remoteContext) {
    if (!subject.remote) {
      return { allowed: false, reason: 'REMOTE_NOT_ALLOWED_FOR_USER' }
    }
    if (!permission.actions.remote) {
      return { allowed: false, reason: 'REMOTE_NOT_ALLOWED_FOR_RESOURCE' }
    }
  }

  // 3. Restrições opcionais (horário e IP)
  const now = request.now ?? new Date()
  if (!isWithinTimeRestriction(subject.accessTimeRestriction, now)) {
    return { allowed: false, reason: 'OUTSIDE_ALLOWED_TIME' }
  }
  if (!isIpAllowed(subject.ipRestriction, request.publicIp)) {
    return { allowed: false, reason: 'IP_NOT_ALLOWED' }
  }

  return { allowed: true }
}

/**
 * countByAction — contadores ao vivo por ação (quantos recursos têm cada ação
 * ligada). Alimenta os 9 contadores da matriz e relatórios. Puro.
 */
export function countByAction(permissions: Permission[]): Record<PermissionAction, number> {
  const counters = Object.fromEntries(ALL_ACTIONS.map((action) => [action, 0])) as Record<
    PermissionAction,
    number
  >
  for (const permission of permissions) {
    for (const action of ALL_ACTIONS) {
      if (permission.actions[action]) counters[action] += 1
    }
  }
  return counters
}
