/**
 * BankAccount — conta bancária **compartilhada** de cadastro de pessoa (ADR-010).
 * Promovida a `shared/domain` (antes vivia no Funcionário). Inclui `holderName`
 * (favorecido) e `holderDocument` (CNPJ/CPF do favorecido) — **opcionais**, para
 * não quebrar quem já usa (Funcionário não preenche favorecido). Model imutável.
 */

/** Tipo de conta bancária. */
export enum BankAccountType {
  Checking = 'CORRENTE',
  Savings = 'POUPANCA',
}

export const BANK_ACCOUNT_TYPES: readonly BankAccountType[] = [
  BankAccountType.Checking,
  BankAccountType.Savings,
]

/** Converte string crua em `BankAccountType`, ou `null` se desconhecida. */
export function toBankAccountType(value: string | null | undefined): BankAccountType | null {
  return (BANK_ACCOUNT_TYPES as readonly string[]).includes(value ?? '')
    ? (value as BankAccountType)
    : null
}

/** Rótulo pt-BR para exibição. */
export function bankAccountTypeLabel(type: BankAccountType): string {
  return type === BankAccountType.Checking ? 'Corrente' : 'Poupança'
}

export interface BankAccount {
  type: BankAccountType | null
  bank: string
  branch: string
  number: string
  /** Favorecido (titular) — opcional. */
  holderName: string
  /** CNPJ/CPF do favorecido — opcional (só dígitos/alfanum.). */
  holderDocument: string
}

export function emptyBankAccount(): BankAccount {
  return { type: null, bank: '', branch: '', number: '', holderName: '', holderDocument: '' }
}

export function copyBankAccount(base: BankAccount, changes: Partial<BankAccount>): BankAccount {
  return { ...base, ...changes }
}
