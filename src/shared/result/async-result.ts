import { type AppError, unknownError } from './app-error'

/**
 * AsyncResult — retorno padronizado de toda operação assíncrona em
 * Application/UseCase/Repository/Provider (equivalente ao AsyncResult do Flutter).
 *
 * - sucesso → `{ success: true, data }`
 * - falha   → `{ success: false, error }`
 *
 * A presentation nunca recebe exception crua: as camadas `data`/`application`
 * capturam exceptions e devolvem `AppError`.
 */
export type AsyncResult<T> = { success: true; data: T } | { success: false; error: AppError }

export function ok<T>(data: T): AsyncResult<T> {
  return { success: true, data }
}

export function fail<T = never>(error: AppError): AsyncResult<T> {
  return { success: false, error }
}

export function isOk<T>(result: AsyncResult<T>): result is { success: true; data: T } {
  return result.success
}

export function isFail<T>(result: AsyncResult<T>): result is { success: false; error: AppError } {
  return !result.success
}

/**
 * Executa uma função assíncrona capturando qualquer exception e convertendo-a
 * em `AppError`. Use nas camadas `data`/`application` para nunca vazar exception
 * crua para a presentation.
 *
 * @param fn       Operação assíncrona a executar.
 * @param onError  Conversor opcional de exception → AppError (ex.: mapear status
 *                 HTTP). Quando ausente, usa `unknownError`.
 */
export async function guard<T>(
  fn: () => Promise<T>,
  onError?: (cause: unknown) => AppError,
): Promise<AsyncResult<T>> {
  try {
    return ok(await fn())
  } catch (cause) {
    return fail(onError ? onError(cause) : unknownError(undefined, { cause }))
  }
}
