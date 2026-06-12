/**
 * Situação do funcionário (ver spec `employee-registration` §4.5 / R15).
 * Mapa de cor no Design System §2.3/§10.9 via `StatusBadge`. Inclui os estados de
 * afastamento legais (férias, atestado, licenças, aviso prévio, afastado INSS).
 */
export enum EmployeeStatus {
  Active = 'ATIVO',
  Vacation = 'FERIAS',
  MedicalLeave = 'ATESTADO',
  MaternityLeave = 'LICENCA_MATERNIDADE',
  PaternityLeave = 'LICENCA_PATERNIDADE',
  Notice = 'AVISO',
  OnLeave = 'AFASTADO',
  InssLeave = 'AFASTADO_INSS',
  Dismissed = 'DEMITIDO',
}

export const EMPLOYEE_STATUSES: readonly EmployeeStatus[] = [
  EmployeeStatus.Active,
  EmployeeStatus.Vacation,
  EmployeeStatus.MedicalLeave,
  EmployeeStatus.MaternityLeave,
  EmployeeStatus.PaternityLeave,
  EmployeeStatus.Notice,
  EmployeeStatus.OnLeave,
  EmployeeStatus.InssLeave,
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
    case EmployeeStatus.Vacation:
      return 'Férias'
    case EmployeeStatus.MedicalLeave:
      return 'Atestado'
    case EmployeeStatus.MaternityLeave:
      return 'Licença maternidade'
    case EmployeeStatus.PaternityLeave:
      return 'Licença paternidade'
    case EmployeeStatus.Notice:
      return 'Aviso prévio'
    case EmployeeStatus.OnLeave:
      return 'Afastado'
    case EmployeeStatus.InssLeave:
      return 'Afastado (INSS)'
    case EmployeeStatus.Dismissed:
      return 'Demitido'
  }
}

/** Severidade do `StatusBadge` para a situação. */
export function employeeStatusSeverity(
  status: EmployeeStatus,
): 'success' | 'warning' | 'danger' | 'info' {
  switch (status) {
    case EmployeeStatus.Active:
      return 'success'
    case EmployeeStatus.Vacation:
    case EmployeeStatus.MaternityLeave:
    case EmployeeStatus.PaternityLeave:
      return 'info'
    case EmployeeStatus.MedicalLeave:
    case EmployeeStatus.Notice:
    case EmployeeStatus.OnLeave:
    case EmployeeStatus.InssLeave:
      return 'warning'
    case EmployeeStatus.Dismissed:
      return 'danger'
  }
}
