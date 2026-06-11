/**
 * AuthUser — usuário autenticado, preparado para multiempresa desde o início
 * (ver ADR-006). `accessScope` é o que filtra os dados por
 * matriz/franquia/representante/técnico/cliente.
 *
 * Model imutável, em inglês (padrão corporativo), com `fromJson`/`toJson`.
 *
 * `UserRole`/`AccessScope` são tipos transversais do kernel de acesso
 * (`shared/access`) — re-exportados aqui por compatibilidade com os imports
 * atuais. Importamos o arquivo-folha (não o barrel) para evitar ciclo.
 */
import { type AccessScope, type UserRole, toAccessScope, toUserRole } from '@/shared/access/access-scope'

export type { AccessScope, UserRole }

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
