import { normalizePermissionKey } from '@/shared/extensions'
import {
  type PermissionAction,
  type PermissionActions,
  ALL_ACTIONS,
  emptyActions,
} from './permission-action'

/**
 * Permission — um RECURSO permissionável do ERP (tela, botão ou feature).
 *
 * Composto por `code`, `label` (descrição amigável), `key` (descrição
 * normalizada — UPPER sem acento, é a chave de autorização), `section`
 * (agrupamento/sessão para a matriz) e as 9 ações booleanas.
 *
 * É a **fonte da verdade** de acesso quando ligada a um usuário. Imutável:
 * use `copyPermission`/`setAction` para alterações parciais.
 */
export interface Permission {
  code: string
  /** Descrição normalizada (UPPER, sem acento) — casa com `AccessRequest.permissionKey`. */
  key: string
  /** Descrição amigável exibida na UI. */
  label: string
  /** Sessão/grupo do recurso (organiza a matriz para a matriz/franquia). */
  section: string
  actions: PermissionActions
}

/** Contrato JSON do recurso permissionável (mock-first; alvo da futura API). */
export interface PermissionJson {
  code: string
  label: string
  section: string
  /** Chave normalizada opcional; quando ausente, é derivada de `label`. */
  key?: string
  actions: Partial<Record<string, boolean>>
}

function actionsFromJson(raw: Partial<Record<string, boolean>>): PermissionActions {
  const actions = emptyActions()
  for (const action of ALL_ACTIONS) {
    actions[action] = raw[action] === true
  }
  return actions
}

export function permissionFromJson(json: PermissionJson): Permission {
  return {
    code: json.code,
    label: json.label,
    section: json.section,
    key: json.key ? normalizePermissionKey(json.key) : normalizePermissionKey(json.label),
    actions: actionsFromJson(json.actions ?? {}),
  }
}

export function permissionToJson(permission: Permission): PermissionJson {
  return {
    code: permission.code,
    label: permission.label,
    section: permission.section,
    key: permission.key,
    actions: { ...permission.actions },
  }
}

/** Cria uma nova permissão preservando a imutabilidade do model original. */
export function copyPermission(permission: Permission, changes: Partial<Permission>): Permission {
  return {
    ...permission,
    ...changes,
    actions: changes.actions ? { ...changes.actions } : { ...permission.actions },
  }
}

/** Retorna uma cópia da permissão com uma ação ligada/desligada. */
export function setAction(
  permission: Permission,
  action: PermissionAction,
  enabled: boolean,
): Permission {
  return copyPermission(permission, { actions: { ...permission.actions, [action]: enabled } })
}

/** Lê uma ação de forma segura (false quando ausente). */
export function hasAction(permission: Permission, action: PermissionAction): boolean {
  return permission.actions[action] === true
}
