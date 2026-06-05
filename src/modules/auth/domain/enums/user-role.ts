// Scope: [M] module-auth   Reuse: [S] shared-project (perfis de acesso são usados por vários módulos)
//
// Papel do usuário no HelpDesk (estrutura multiempresa: matriz e franquias).

export type UserRole =
  | "admin"
  | "franqueado"
  | "representante"
  | "tecnico"
  | "cliente";
