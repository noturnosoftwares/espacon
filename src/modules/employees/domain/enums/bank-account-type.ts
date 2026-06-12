/** Tipo de conta bancária (ver spec `employee-registration` R16). */
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
