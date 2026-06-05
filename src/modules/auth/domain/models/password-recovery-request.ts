// Scope: [M] module-auth
//
// Modelos do fluxo de recuperação de senha (entrada e recibo de confirmação).
// Mantidos em inglês e preparados para evolução: quando existir contrato real de
// API, o mapeamento JSON externo → estes models ocorrerá em data/mappers.

/** Entrada do fluxo: o e-mail para o qual o link de recuperação será enviado. */
export type PasswordRecoveryRequest = {
  email: string;
};

/**
 * Recibo retornado em caso de sucesso. Por segurança (anti-enumeração) não
 * confirma se a conta existe — apenas ecoa o e-mail-alvo da solicitação.
 */
export type PasswordRecoveryReceipt = {
  email: string;
};
