/**
 * Credentials — credenciais de acesso informadas no login.
 *
 * `keepSignedIn` define se a sessão persiste entre sessões do navegador
 * (ver ADR-005). A senha existe apenas em memória durante o envio e **nunca**
 * é serializada para storage (ver `docs/specifications/auth/login.md`).
 */
export interface Credentials {
  email: string
  password: string
  keepSignedIn: boolean
}

/** Contrato JSON enviado no login (mock-first; alvo da futura API REST). */
export interface CredentialsJson {
  email: string
  password: string
  keepSignedIn: boolean
}

/** Serializa as credenciais para o payload de envio (camada `data`). */
export function credentialsToJson(credentials: Credentials): CredentialsJson {
  return {
    email: credentials.email.trim(),
    password: credentials.password,
    keepSignedIn: credentials.keepSignedIn,
  }
}
