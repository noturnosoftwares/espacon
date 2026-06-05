// Scope: [M] module-auth   Reuse: [S] shared-project
//
// Model interno do usuário autenticado (em inglês, imutável). Nasce preparado
// para multiempresa: role + accessScope + vínculos de franquia/representante +
// permissões granulares. A conversão JSON externo → este model ocorrerá em
// data/mappers quando existir contrato real de autenticação.

import type { AccessScope } from "../enums/access-scope";
import type { UserRole } from "../enums/user-role";

export type AuthenticatedUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  /** Eixo de filtragem matriz/franquia/representante/técnico/cliente. */
  accessScope: AccessScope;
  /** Vínculo de franquia — ausente quando global/matriz. */
  franchiseId?: string;
  /** Vínculo de representante. */
  representativeId?: string;
  /** Permissões granulares. */
  permissions: string[];
};

/** copyWith: cria uma nova instância com alterações parciais (imutabilidade). */
export function copyAuthenticatedUser(
  user: AuthenticatedUser,
  changes: Partial<AuthenticatedUser>,
): AuthenticatedUser {
  return { ...user, ...changes };
}
