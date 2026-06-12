/**
 * Situação do funcionário (ver spec `employee-registration` §4.5 / R15).
 * Mapa de cor no Design System §2.3/§10.9: ATIVO→success, AFASTADO→warning,
 * DEMITIDO→danger.
 */
export enum EmployeeStatus {
  Active = 'ATIVO',
  Dismissed = 'DEMITIDO',
  OnLeave = 'AFASTADO',
}

export const EMPLOYEE_STATUSES: readonly EmployeeStatus[] = [
  EmployeeStatus.Active,
  EmployeeStatus.OnLeave,
  EmployeeStatus.Dismissed,
]

/** Converte string crua em `EmployeeStatus`, com fallback para `Active`. */
export function toEmployeeStatus(value: string | null | undefined): EmployeeStatus {
  return (EMPLOYEE_STATUSES as readonly string[]).includes(value ?? '')
    ? (value as EmployeeStatus)
    : EmployeeStatus.Active
}

/** Rótulo pt-BR para exibição. */
export function employeeStatusLabel(status: EmployeeStatus): string {
  switch (status) {
    case EmployeeStatus.Active:
      return 'Ativo'
    case EmployeeStatus.OnLeave:
      return 'Afastado'
    case EmployeeStatus.Dismissed:
      return 'Demitido'
  }
}

/** Severidade do `StatusBadge` para a situação. */
export function employeeStatusSeverity(status: EmployeeStatus): 'success' | 'warning' | 'danger' {
  switch (status) {
    case EmployeeStatus.Active:
      return 'success'
    case EmployeeStatus.OnLeave:
      return 'warning'
    case EmployeeStatus.Dismissed:
      return 'danger'
  }
}
