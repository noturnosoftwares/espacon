/**
 * Validação de e-mail (formato). Não garante existência da caixa — apenas que o
 * formato é plausível. Mantida simples e previsível de propósito.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}

/**
 * Normaliza um e-mail para **minúsculas** (sem espaços nas pontas). E-mail é
 * case-insensitive no domínio e, na prática, no local-part — então o sistema
 * sempre grava em lowercase, **inclusive vindo do backend**, para evitar
 * duplicidade e divergência de login. Use no `set` dos campos de e-mail e nos
 * mappers `fromJson`.
 */
export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}
