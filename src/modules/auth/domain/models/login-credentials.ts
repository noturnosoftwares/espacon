// Scope: [M] module-auth
//
// Credenciais de login (entrada do fluxo de autenticação).

export type LoginCredentials = {
  email: string;
  password: string;
  /** "Manter acesso" — intenção de sessão persistente (tratada quando houver sessão real). */
  keepSignedIn: boolean;
};
