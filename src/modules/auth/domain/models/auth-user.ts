/**
 * AuthUser — usuário autenticado, preparado para multiempresa desde o início
 * (ver ADR-006). `accessScope` é o que filtra os dados por
 * matriz/franquia/representante/técnico/cliente.
 *
 * Model imutável, em inglês (padrão corporativo), com `fromJson`/`toJson`.
 */
export type UserRole = 'admin' | 'franchisee' | 'representative' | 'technician' | 'customer'

export type AccessScope = 'global' | 'franchise' | 'representative' | 'technician' | 'customer'

export interface AuthUser {
  id: string
  name: string
  email: string
  role: UserRole
  accessScope: AccessScope
  franchiseId?: string | null
  representativeId?: string | null
  permissions: string[]
}

/** Contrato JSON do usuário (mock-first; alvo da futura API REST). */
export interface AuthUserJson {
  id: string
  name: string
  email: string
  role: string
  accessScope: string
  franchiseId?: string | null
  representativeId?: string | null
  permissions: string[]
}

const USER_ROLES: readonly UserRole[] = [
  'admin',
  'franchisee',
  'representative',
  'technician',
  'customer',
]

const ACCESS_SCOPES: readonly AccessScope[] = [
  'global',
  'franchise',
  'representative',
  'technician',
  'customer',
]

function toUserRole(value: string): UserRole {
  return (USER_ROLES as readonly string[]).includes(value) ? (value as UserRole) : 'customer'
}

function toAccessScope(value: string): AccessScope {
  return (ACCESS_SCOPES as readonly string[]).includes(value) ? (value as AccessScope) : 'customer'
}

export function authUserFromJson(json: AuthUserJson): AuthUser {
  return {
    id: json.id,
    name: json.name,
    email: json.email,
    role: toUserRole(json.role),
    accessScope: toAccessScope(json.accessScope),
    franchiseId: json.franchiseId ?? null,
    representativeId: json.representativeId ?? null,
    permissions: [...(json.permissions ?? [])],
  }
}

export function authUserToJson(user: AuthUser): AuthUserJson {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    accessScope: user.accessScope,
    franchiseId: user.franchiseId ?? null,
    representativeId: user.representativeId ?? null,
    permissions: [...user.permissions],
  }
}
