/**
 * Restrições opcionais de acesso (horário e IP). São avaliadas pelo
 * `AccessChecker` no login e a cada ação. O **frontend modela e reflete**; em
 * produção o backend é a autoridade de segurança (ver spec).
 *
 * Tipos transversais (vivem no kernel de acesso). O model `User` os reusa.
 */

/** Janela simples de horário `HH:mm`. `null` = sem restrição. */
export type AccessTimeRestriction = { start: string; end: string } | null

/** Lista de IPs públicos liberados. `null` = sem restrição. */
export type IpRestriction = { allowedPublicIps: string[] } | null

/** Converte `HH:mm` em minutos desde a meia-noite, ou `null` se inválido. */
function toMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value.trim())
  if (!match) return null
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 23 || minutes > 59) return null
  return hours * 60 + minutes
}

/**
 * Verifica se `at` está dentro da janela de horário. Suporta janela que cruza a
 * meia-noite (ex.: 22:00–06:00). Sem restrição (`null`) sempre passa. Janela
 * malformada falha de forma segura (bloqueia), nunca silenciosamente libera.
 */
export function isWithinTimeRestriction(restriction: AccessTimeRestriction, at: Date): boolean {
  if (!restriction) return true
  const start = toMinutes(restriction.start)
  const end = toMinutes(restriction.end)
  if (start === null || end === null) return false

  const current = at.getHours() * 60 + at.getMinutes()
  // Janela normal (start <= end) ou que cruza a meia-noite (start > end).
  return start <= end ? current >= start && current <= end : current >= start || current <= end
}

/**
 * Verifica o IP público contra a lista liberada. Sem restrição passa. Quando há
 * restrição mas o IP não foi informado, o frontend **não bloqueia** (não tem como
 * verificar com segurança) e delega ao backend; quando informado, exige match.
 */
export function isIpAllowed(restriction: IpRestriction, publicIp?: string): boolean {
  if (!restriction) return true
  if (!publicIp) return true
  return restriction.allowedPublicIps.includes(publicIp.trim())
}
