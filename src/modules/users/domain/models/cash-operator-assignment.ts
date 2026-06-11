import { CashOperatorType, toCashOperatorType } from '../enums/cash-operator-type'

/**
 * CashOperatorAssignment — **value object** do vínculo de operador de caixa no
 * usuário (ver spec `users-and-permissions` / `financial/cash-operator`).
 *
 * Não confundir com a **entidade** `CashOperator` (registro mestre, em
 * `modules/cash-operators`): aqui descrevemos apenas o vínculo — se o usuário é
 * operador, o tipo (ilimitado | limitado) e, quando limitado, o `operatorCode`
 * que **referencia** um operador cadastrado e ativo.
 *
 * Regra: se `isOperator` → `type` é obrigatório; se `type === Limited` →
 * `operatorCode` é obrigatório. A validação de fluxo vive na application/store,
 * não no model (o model só representa o estado, de forma imutável).
 */
export interface CashOperatorAssignment {
  isOperator: boolean
  type: CashOperatorType | null
  /** Obrigatório quando `type === Limited`. Referencia o `code` de um operador. */
  operatorCode: string | null
}

export interface CashOperatorAssignmentJson {
  isOperator: boolean
  type: string | null
  operatorCode: string | null
}

/** Vínculo padrão (não-operador) — estado inicial de um novo usuário. */
export function notOperator(): CashOperatorAssignment {
  return { isOperator: false, type: null, operatorCode: null }
}

export function cashOperatorAssignmentFromJson(
  json: CashOperatorAssignmentJson,
): CashOperatorAssignment {
  const isOperator = json.isOperator === true
  if (!isOperator) return notOperator()
  return {
    isOperator: true,
    type: toCashOperatorType(json.type),
    operatorCode: json.operatorCode ?? null,
  }
}

export function cashOperatorAssignmentToJson(
  assignment: CashOperatorAssignment,
): CashOperatorAssignmentJson {
  return {
    isOperator: assignment.isOperator,
    type: assignment.type,
    operatorCode: assignment.operatorCode,
  }
}

export function copyCashOperatorAssignment(
  assignment: CashOperatorAssignment,
  changes: Partial<CashOperatorAssignment>,
): CashOperatorAssignment {
  return { ...assignment, ...changes }
}
