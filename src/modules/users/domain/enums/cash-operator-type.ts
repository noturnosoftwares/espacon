/**
 * Tipo do operador de caixa (ver spec `users-and-permissions`).
 *
 * - `Unlimited`: pode escolher/filtrar/ver dados de qualquer operador.
 * - `Limited`: operações financeiras ficam travadas no `operatorCode` do usuário.
 *
 * **Não é portão do checker de permissões** — é um dado do usuário consumido
 * pelos módulos financeiros.
 */
export enum CashOperatorType {
  Unlimited = 'unlimited',
  Limited = 'limited',
}

export const CASH_OPERATOR_TYPES: readonly CashOperatorType[] = [
  CashOperatorType.Unlimited,
  CashOperatorType.Limited,
]

/** Converte string crua em `CashOperatorType`, ou `null` se desconhecida. */
export function toCashOperatorType(value: string | null | undefined): CashOperatorType | null {
  if (!value) return null
  return (CASH_OPERATOR_TYPES as readonly string[]).includes(value)
    ? (value as CashOperatorType)
    : null
}
