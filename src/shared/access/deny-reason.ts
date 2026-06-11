import type { PermissionAction } from './permission-action'

/**
 * Motivos de negação da autorização (ver spec `users-and-permissions`).
 * A presentation usa para mensagens/diagnóstico; nunca expõe regra do backend.
 */
export type DenyReason =
  | 'NO_PERMISSION'
  | 'REMOTE_NOT_ALLOWED_FOR_USER'
  | 'REMOTE_NOT_ALLOWED_FOR_RESOURCE'
  | 'OUTSIDE_ALLOWED_TIME'
  | 'IP_NOT_ALLOWED'

/**
 * O que qualquer parte do app declara precisar. O checker resolve sobre o
 * usuário em sessão. Padrão declarativo: `can('CONTRATO', 'open')`.
 */
export interface AccessRequest {
  /** Chave normalizada do recurso (UPPER, sem acento). */
  permissionKey: string
  action: PermissionAction
  /** Operação que atravessa empresas (ativa o portão "remoto"). */
  remoteContext?: boolean
  /** Instante da avaliação (default: agora) — usado na restrição de horário. */
  now?: Date
  /** IP público do cliente — usado na restrição de IP. */
  publicIp?: string
}

/** Resultado puro da autorização. */
export type AuthorizationResult = { allowed: true } | { allowed: false; reason: DenyReason }

/** Mensagens amigáveis por motivo (UI/log). */
export const DENY_REASON_MESSAGES: Record<DenyReason, string> = {
  NO_PERMISSION: 'Você não tem permissão para esta ação.',
  REMOTE_NOT_ALLOWED_FOR_USER: 'Seu usuário não está habilitado para acesso remoto.',
  REMOTE_NOT_ALLOWED_FOR_RESOURCE: 'Este recurso não permite acesso remoto.',
  OUTSIDE_ALLOWED_TIME: 'Ação fora do horário permitido para o seu acesso.',
  IP_NOT_ALLOWED: 'Acesso bloqueado para o seu endereço de rede.',
}
