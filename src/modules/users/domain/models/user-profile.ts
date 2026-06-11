import {
  type Permission,
  type PermissionJson,
  permissionFromJson,
  permissionToJson,
} from '@/shared/access'

/**
 * UserProfile — **modelo** de cadastro que acelera a atribuição de permissões.
 *
 * Ao selecioná-lo no usuário, suas `permissions` **redefinem** (sobrescrevem) as
 * ações do usuário. O perfil **nunca** é consultado na autorização — quem
 * autoriza é sempre `user.permissions` (ver spec / `applyProfileToUser`).
 */
export interface UserProfile {
  id: number
  description: string
  permissions: Permission[]
}

export interface UserProfileJson {
  id: number
  description: string
  permissions: PermissionJson[]
}

export function userProfileFromJson(json: UserProfileJson): UserProfile {
  return {
    id: json.id,
    description: json.description,
    permissions: (json.permissions ?? []).map(permissionFromJson),
  }
}

export function userProfileToJson(profile: UserProfile): UserProfileJson {
  return {
    id: profile.id,
    description: profile.description,
    permissions: profile.permissions.map(permissionToJson),
  }
}

export function copyUserProfile(profile: UserProfile, changes: Partial<UserProfile>): UserProfile {
  return { ...profile, ...changes }
}

export function emptyUserProfile(): UserProfile {
  return { id: 0, description: '', permissions: [] }
}
