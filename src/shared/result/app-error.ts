/**
 * AppError — erro de domínio/aplicação padronizado da Noturno.
 *
 * Toda exception crua (rede, parsing, API) deve ser convertida para `AppError`
 * nas camadas `data`/`application`. A `presentation` nunca trata exception crua:
 * ela só conhece `AppError.message` (mensagem amigável).
 *
 * `cause` preserva o erro técnico original para logs/diagnóstico — nunca deve
 * ser exibido ao usuário.
 */
export type AppErrorKind =
  | 'validation'
  | 'auth'
  | 'network'
  | 'notFound'
  | 'conflict'
  | 'server'
  | 'unknown'

export interface AppError {
  /** Categoria do erro — permite tratamento/roteamento por tipo. */
  kind: AppErrorKind
  /** Mensagem amigável, pronta para exibição na UI. */
  message: string
  /** Código opcional (ex.: do backend) para rastreio. */
  code?: string
  /** Erro técnico original (uso interno: logs/diagnóstico). Nunca exibir. */
  cause?: unknown
}

export function appError(
  kind: AppErrorKind,
  message: string,
  options: { code?: string; cause?: unknown } = {},
): AppError {
  return { kind, message, code: options.code, cause: options.cause }
}

export const validationError = (message: string, options?: { code?: string; cause?: unknown }) =>
  appError('validation', message, options)

export const authError = (message: string, options?: { code?: string; cause?: unknown }) =>
  appError('auth', message, options)

export const networkError = (
  message = 'Falha de conexão. Verifique sua internet e tente novamente.',
  options?: { code?: string; cause?: unknown },
) => appError('network', message, options)

export const notFoundError = (message = 'Registro não encontrado.', options?: { code?: string; cause?: unknown }) =>
  appError('notFound', message, options)

export const serverError = (
  message = 'Ocorreu um erro no servidor. Tente novamente mais tarde.',
  options?: { code?: string; cause?: unknown },
) => appError('server', message, options)

export const unknownError = (
  message = 'Ocorreu um erro inesperado.',
  options?: { code?: string; cause?: unknown },
) => appError('unknown', message, options)
