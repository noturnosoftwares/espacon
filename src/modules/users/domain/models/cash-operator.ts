import { CashOperatorType, toCashOperatorType } from '../enums/cash-operator-type'

/**
 * CashOperator — dado de operador de caixa do usuário (ver spec).
 *
 * Regra: se `isOperator` → `type` é obrigatório; se `type === Limited` →
 * `operatorCode` é obrigatório. A validação de fluxo vive na application/store,
 * não no model (o model só representa o estado, de forma imutável).
 */
export interface CashOperator {
  isOperator: boolean
  type: CashOperatorType | null
  /** Obrigatório quando `type === Limited`. */
  operatorCode: string | null
}

export interface CashOperatorJson {
  isOperator: boolean
  type: string | null
  operatorCode: string | null
}

/** Operador padrão (não-operador) — estado inicial de um novo usuário. */
export function notOperator(): CashOperator {
  return { isOperator: false, type: null, operatorCode: null }
}

export function cashOperatorFromJson(json: CashOperatorJson): CashOperator {
  const isOperator = json.isOperator === true
  if (!isOperator) return notOperator()
  return {
    isOperator: true,
    type: toCashOperatorType(json.type),
    operatorCode: json.operatorCode ?? null,
  }
}

export function cashOperatorToJson(operator: CashOperator): CashOperatorJson {
  return {
    isOperator: operator.isOperator,
    type: operator.type,
    operatorCode: operator.operatorCode,
  }
}

export function copyCashOperator(
  operator: CashOperator,
  changes: Partial<CashOperator>,
): CashOperator {
  return { ...operator, ...changes }
}
