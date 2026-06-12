import { BankAccountType } from '../enums/bank-account-type'

/**
 * BankAccount — dados bancários do funcionário (ver spec `employee-registration`
 * §9.2). Todos obrigatórios na regra de negócio (R/§4.1); o model só representa o
 * estado, a validação vive na presentation/application.
 */
export interface BankAccount {
  type: BankAccountType | null
  bank: string
  branch: string
  number: string
}

export function emptyBankAccount(): BankAccount {
  return { type: null, bank: '', branch: '', number: '' }
}

export function copyBankAccount(base: BankAccount, changes: Partial<BankAccount>): BankAccount {
  return { ...base, ...changes }
}
