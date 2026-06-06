import {
  type AuthUser,
  type AuthUserJson,
  authUserFromJson,
  authUserToJson,
} from './auth-user'

/**
 * AuthSession — sessão do usuário autenticado.
 *
 * O token/expiração ficam **deferidos** até o contrato da API real (ver ADR-003).
 * Por isso a sessão mock guarda apenas o usuário e o instante de emissão; a
 * persistência local é provisória (ver ADR-005). Model imutável com
 * `fromJson`/`toJson` para serializar no storage e, futuramente, na API.
 */
export interface AuthSession {
  user: AuthUser
  /** Instante de emissão (ISO 8601). */
  issuedAt: string
}

export interface AuthSessionJson {
  user: AuthUserJson
  issuedAt: string
}

export function authSessionFromJson(json: AuthSessionJson): AuthSession {
  return {
    user: authUserFromJson(json.user),
    issuedAt: json.issuedAt,
  }
}

export function authSessionToJson(session: AuthSession): AuthSessionJson {
  return {
    user: authUserToJson(session.user),
    issuedAt: session.issuedAt,
  }
}
