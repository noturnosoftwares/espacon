/**
 * Ações permissionáveis — as 9 flags booleanas de cada recurso do ERP
 * (ver spec `users-and-permissions`). Transversal: alimenta menu, guards e a
 * liberação de qualquer botão/tela/feature.
 *
 * Os valores são as descrições canônicas em português usadas na UI/contrato;
 * a chave do enum é o nome técnico em inglês (padrão de models do template).
 */
export enum PermissionAction {
  Open = 'open',
  Search = 'search',
  Create = 'create',
  Update = 'update',
  Delete = 'delete',
  Print = 'print',
  Report = 'report',
  Chart = 'chart',
  Remote = 'remote',
}

/** Mapa fechado ação → habilitada. Toda permissão carrega exatamente estas 9. */
export type PermissionActions = Record<PermissionAction, boolean>

/** Ordem canônica das ações (colunas da matriz, contadores e serialização). */
export const ALL_ACTIONS: readonly PermissionAction[] = [
  PermissionAction.Open,
  PermissionAction.Search,
  PermissionAction.Create,
  PermissionAction.Update,
  PermissionAction.Delete,
  PermissionAction.Print,
  PermissionAction.Report,
  PermissionAction.Chart,
  PermissionAction.Remote,
]

/** Rótulos curtos das colunas (UI). Não usar como chave de autorização. */
export const ACTION_LABELS: Record<PermissionAction, string> = {
  [PermissionAction.Open]: 'Abrir',
  [PermissionAction.Search]: 'Buscar',
  [PermissionAction.Create]: 'Novo',
  [PermissionAction.Update]: 'Modificar',
  [PermissionAction.Delete]: 'Apagar',
  [PermissionAction.Print]: 'Imprimir',
  [PermissionAction.Report]: 'Relatório',
  [PermissionAction.Chart]: 'Gráfico',
  [PermissionAction.Remote]: 'Remoto',
}

/** Cria um conjunto de ações, todas em `false` por padrão. */
export function emptyActions(): PermissionActions {
  return {
    [PermissionAction.Open]: false,
    [PermissionAction.Search]: false,
    [PermissionAction.Create]: false,
    [PermissionAction.Update]: false,
    [PermissionAction.Delete]: false,
    [PermissionAction.Print]: false,
    [PermissionAction.Report]: false,
    [PermissionAction.Chart]: false,
    [PermissionAction.Remote]: false,
  }
}

/** Converte string crua em `PermissionAction`, ou `null` se desconhecida. */
export function toPermissionAction(value: string): PermissionAction | null {
  return (ALL_ACTIONS as readonly string[]).includes(value) ? (value as PermissionAction) : null
}
