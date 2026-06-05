// Scope: [M] module-auth
//
// Dados mockados para desenvolvimento mock-first. Credencial fixa documentada
// na Base de Conhecimento e em docs/specifications/auth.

import type { AuthenticatedUser } from "../../domain/models/authenticated-user";

/** Credencial válida do mock (substituída pela API real futuramente). */
export const MOCK_CREDENTIAL = {
  email: "admin@noturno.com.br",
  password: "noturno",
} as const;

/** Usuário retornado pelo mock em caso de sucesso — admin de escopo global (matriz). */
export const MOCK_ADMIN_USER: AuthenticatedUser = {
  id: "usr_mock_admin",
  name: "Administrador Noturno",
  email: MOCK_CREDENTIAL.email,
  role: "admin",
  accessScope: "global",
  permissions: ["*"],
};
