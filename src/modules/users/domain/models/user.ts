import {
  type AccessScope,
  type Permission,
  type PermissionJson,
  type UserRole,
  permissionFromJson,
  permissionToJson,
  toAccessScope,
  toUserRole,
} from '@/shared/access'
import {
  type CashOperator,
  type CashOperatorJson,
  cashOperatorFromJson,
  cashOperatorToJson,
  notOperator,
} from './cash-operator'
import {
  type AccessTimeRestriction,
  type AccessTimeRestrictionJson,
  type IpRestriction,
  type IpRestrictionJson,
  accessTimeRestrictionFromJson,
  accessTimeRestrictionToJson,
  ipRestrictionFromJson,
  ipRestrictionToJson,
} from './access-restrictions'

/**
 * User — usuário do sistema, alvo do CRUD do módulo (≠ `AuthUser`, que é a
 * sessão). Multiempresa desde o início (ADR-006). `permissions` é a **fonte da
 * verdade** de acesso; `sourceProfileId` é só rastro do modelo de cadastro e
 * **nunca** autoriza nada.
 *
 * Model imutável (use `copyUser`), em inglês, com `fromJson`/`toJson`.
 */
export interface User {
  id: number
  login: string
  name: string
  email: string
  active: boolean

  // multiempresa (ADR-006)
  role: UserRole
  accessScope: AccessScope
  franchiseId: number | null
  representativeId: number | null

  /** Vínculo opcional com funcionário (nem todo usuário é funcionário). */
  employeeId: number | null

  cashOperator: CashOperator
  /** Habilita features que atravessam empresas (cross-company). */
  remote: boolean
  accessTimeRestriction: AccessTimeRestriction
  ipRestriction: IpRestriction

  /** FONTE DA VERDADE de acesso (por recurso × ação). */
  permissions: Permission[]
  /** Perfil usado como modelo no cadastro — NUNCA consultado na autorização. */
  sourceProfileId: number | null
}

export interface UserJson {
  id: number
  login: string
  name: string
  email: string
  active: boolean
  role: string
  accessScope: string
  franchiseId: number | null
  representativeId: number | null
  employeeId: number | null
  cashOperator: CashOperatorJson
  remote: boolean
  accessTimeRestriction: AccessTimeRestrictionJson
  ipRestriction: IpRestrictionJson
  permissions: PermissionJson[]
  sourceProfileId: number | null
}

export function userFromJson(json: UserJson): User {
  return {
    id: json.id,
    login: json.login,
    name: json.name,
    email: json.email,
    active: json.active === true,
    role: toUserRole(json.role),
    accessScope: toAccessScope(json.accessScope),
    franchiseId: json.franchiseId ?? null,
    representativeId: json.representativeId ?? null,
    employeeId: json.employeeId ?? null,
    cashOperator: json.cashOperator ? cashOperatorFromJson(json.cashOperator) : notOperator(),
    remote: json.remote === true,
    accessTimeRestriction: accessTimeRestrictionFromJson(json.accessTimeRestriction ?? null),
    ipRestriction: ipRestrictionFromJson(json.ipRestriction ?? null),
    permissions: (json.permissions ?? []).map(permissionFromJson),
    sourceProfileId: json.sourceProfileId ?? null,
  }
}

export function userToJson(user: User): UserJson {
  return {
    id: user.id,
    login: user.login,
    name: user.name,
    email: user.email,
    active: user.active,
    role: user.role,
    accessScope: user.accessScope,
    franchiseId: user.franchiseId,
    representativeId: user.representativeId,
    employeeId: user.employeeId,
    cashOperator: cashOperatorToJson(user.cashOperator),
    remote: user.remote,
    accessTimeRestriction: accessTimeRestrictionToJson(user.accessTimeRestriction),
    ipRestriction: ipRestrictionToJson(user.ipRestriction),
    permissions: user.permissions.map(permissionToJson),
    sourceProfileId: user.sourceProfileId,
  }
}

export function copyUser(user: User, changes: Partial<User>): User {
  return { ...user, ...changes }
}

/** Usuário novo (vazio) — estado inicial do formulário de cadastro. */
export function emptyUser(): User {
  return {
    id: 0,
    login: '',
    name: '',
    email: '',
    active: true,
    role: 'admin',
    accessScope: 'global',
    franchiseId: null,
    representativeId: null,
    employeeId: null,
    cashOperator: notOperator(),
    remote: false,
    accessTimeRestriction: null,
    ipRestriction: null,
    permissions: [],
    sourceProfileId: null,
  }
}
