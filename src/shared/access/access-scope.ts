/**
 * Papel e escopo de acesso — tipos transversais do controle multiempresa
 * (ver ADR-006). Vivem em `shared/access` porque alimentam autorização, menu,
 * filtros e qualquer módulo — não pertencem a um módulo específico.
 *
 * `accessScope` é o que filtra os dados por matriz/franquia/representante/
 * técnico/cliente. O módulo `auth` re-exporta estes tipos por compatibilidade.
 */
export type UserRole = 'admin' | 'franchisee' | 'representative' | 'technician' | 'customer'

export type AccessScope = 'global' | 'franchise' | 'representative' | 'technician' | 'customer'

export const USER_ROLES: readonly UserRole[] = [
  'admin',
  'franchisee',
  'representative',
  'technician',
  'customer',
]

export const ACCESS_SCOPES: readonly AccessScope[] = [
  'global',
  'franchise',
  'representative',
  'technician',
  'customer',
]

/** Converte string crua (API/mock) em `UserRole`, com fallback seguro. */
export function toUserRole(value: string): UserRole {
  return (USER_ROLES as readonly string[]).includes(value) ? (value as UserRole) : 'customer'
}

/** Converte string crua (API/mock) em `AccessScope`, com fallback seguro. */
export function toAccessScope(value: string): AccessScope {
  return (ACCESS_SCOPES as readonly string[]).includes(value) ? (value as AccessScope) : 'customer'
}
