import type { AccessTimeRestriction, IpRestriction } from '@/shared/access'

/**
 * Restrições de acesso do usuário (horário e IP). Os **tipos** são transversais
 * e vivem no kernel (`shared/access`); aqui ficam apenas os mappers de
 * serialização (concern de `data`/model do módulo). Re-exportados por
 * conveniência para o restante do módulo.
 */
export type { AccessTimeRestriction, IpRestriction }

export type AccessTimeRestrictionJson = { start: string; end: string } | null
export type IpRestrictionJson = { allowedPublicIps: string[] } | null

export function accessTimeRestrictionFromJson(
  json: AccessTimeRestrictionJson,
): AccessTimeRestriction {
  if (!json) return null
  return { start: json.start, end: json.end }
}

export function accessTimeRestrictionToJson(
  restriction: AccessTimeRestriction,
): AccessTimeRestrictionJson {
  return restriction ? { start: restriction.start, end: restriction.end } : null
}

export function ipRestrictionFromJson(json: IpRestrictionJson): IpRestriction {
  if (!json) return null
  return { allowedPublicIps: [...(json.allowedPublicIps ?? [])] }
}

export function ipRestrictionToJson(restriction: IpRestriction): IpRestrictionJson {
  return restriction ? { allowedPublicIps: [...restriction.allowedPublicIps] } : null
}
