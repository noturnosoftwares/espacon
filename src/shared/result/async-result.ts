// Scope: [S] shared-project   Reuse: [P] package-candidate (@noturno/result)
//
// AsyncResult é o retorno padronizado de toda chamada assíncrona das camadas
// Application / UseCase / Repository / Provider (equivalente ao AsyncResult do
// Flutter usado pela Noturno). A presentation nunca trata exception crua da API:
// exceptions devem ser capturadas em data/application e convertidas em AppError.

/**
 * Erro de aplicação padronizado.
 *
 * `message` é amigável e pode ser exibido ao usuário; `code` identifica o tipo
 * do erro para diagnóstico; `cause` guarda o erro técnico original (nunca exibido).
 */
export type AppError = {
  message: string;
  code?: string;
  cause?: unknown;
};

/**
 * Resultado assíncrono padronizado.
 *
 * - sucesso retorna `data`;
 * - falha retorna `error`.
 */
export type AsyncResult<T> =
  | { success: true; data: T }
  | { success: false; error: AppError };

/** Cria um resultado de sucesso. */
export function ok<T>(data: T): AsyncResult<T> {
  return { success: true, data };
}

/** Cria um resultado de falha a partir de uma mensagem ou de um AppError. */
export function fail<T = never>(error: AppError | string): AsyncResult<T> {
  const appError: AppError =
    typeof error === "string" ? { message: error } : error;
  return { success: false, error: appError };
}

/** Type guard de sucesso (estreita o tipo para o ramo `data`). */
export function isOk<T>(
  result: AsyncResult<T>,
): result is { success: true; data: T } {
  return result.success;
}
