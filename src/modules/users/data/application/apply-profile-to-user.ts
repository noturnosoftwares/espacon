import { copyPermission } from '@/shared/access'
import { type User, type UserProfile, copyUser } from '../../domain/models'

/**
 * applyProfileToUser — aplica um perfil (modelo) ao usuário: **redefine** todas
 * as ações conforme o perfil e registra `sourceProfileId` como rastro de
 * cadastro. Função **pura** (sem IO): a confirmação/sobrescrita é decidida na
 * presentation antes de chamar.
 *
 * Importante (regra inegociável): isto **não** concede acesso por si — apenas
 * copia ações para `user.permissions`, que continua sendo a única fonte de
 * autorização. As permissões são clonadas para não vazar referência do perfil.
 */
export function applyProfileToUser(user: User, profile: UserProfile): User {
  return copyUser(user, {
    permissions: profile.permissions.map((permission) => copyPermission(permission, {})),
    sourceProfileId: profile.id,
  })
}
