// Scope: [M] module-auth   Reuse: [S] shared-project (escopo de acesso filtra dados em todos os módulos)
//
// accessScope é o eixo que filtra os dados por matriz/franquia/representante/
// técnico/cliente. Nasce no model de usuário mesmo com mocks simples, para que o
// sistema cresça (rede de franquias) sem refatoração estrutural.

export type AccessScope =
  | "global"
  | "franchise"
  | "representative"
  | "technician"
  | "customer";
