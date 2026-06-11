/**
 * CashOperator — **entidade** (registro mestre) de operador de caixa.
 *
 * Diferente do *value object* do usuário (`CashOperatorAssignment`, em
 * `modules/users`), que apenas descreve o vínculo (`isOperator`, `type`,
 * `operatorCode`): aqui é o cadastro em si, fonte única referenciada por usuários
 * e, futuramente, pelos módulos financeiros.
 *
 * **Entidade dumb** (spec `financial/cash-operator`): carrega só `code` + `name`
 * + `active`. A semântica de limitado/ilimitado **não** é do operador — é do
 * vínculo no usuário. Model imutável (use `copyCashOperator`), em inglês, com
 * `fromJson`/`toJson`.
 */
export interface CashOperator {
  id: number
  /** Código de negócio (único) — chave de vínculo usada por outros módulos. */
  code: string
  name: string
  active: boolean
}

export interface CashOperatorJson {
  id: number
  code: string
  name: string
  active: boolean
}

export function cashOperatorFromJson(json: CashOperatorJson): CashOperator {
  return {
    id: json.id,
    code: json.code,
    name: json.name,
    active: json.active === true,
  }
}

export function cashOperatorToJson(operator: CashOperator): CashOperatorJson {
  return {
    id: operator.id,
    code: operator.code,
    name: operator.name,
    active: operator.active,
  }
}

export function copyCashOperator(
  operator: CashOperator,
  changes: Partial<CashOperator>,
): CashOperator {
  return { ...operator, ...changes }
}

/** Operador novo (vazio) — estado inicial do formulário; nasce ativo. */
export function emptyCashOperator(): CashOperator {
  return { id: 0, code: '', name: '', active: true }
}

/** Rótulo de referência exibido nos campos de busca de outros módulos. */
export function cashOperatorLabel(operator: CashOperator): string {
  return `${operator.code} — ${operator.name}`
}
