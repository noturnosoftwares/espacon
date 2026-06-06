/**
 * Validação de e-mail (formato). Não garante existência da caixa — apenas que o
 * formato é plausível. Mantida simples e previsível de propósito.
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value: string): boolean {
  return EMAIL_REGEX.test(value.trim())
}
