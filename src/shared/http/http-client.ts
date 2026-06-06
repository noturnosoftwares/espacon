/**
 * Contrato de cliente HTTP compartilhado.
 *
 * Quem consome são apenas os **providers** (camada `data/providers`) — nunca a
 * presentation nem a application diretamente. Enquanto o projeto é mock-first
 * (ver ADR-001), nenhum provider real usa este cliente; o contrato existe para
 * que a integração REST futura entre sem refatorar as camadas superiores.
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface HttpRequestConfig {
  headers?: Record<string, string>
  params?: Record<string, string | number | boolean | undefined>
  signal?: AbortSignal
}

export interface HttpResponse<T> {
  status: number
  data: T
  headers: Record<string, string>
}

export interface HttpClient {
  get<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>
  post<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>
  put<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>
  patch<T>(url: string, body?: unknown, config?: HttpRequestConfig): Promise<HttpResponse<T>>
  delete<T>(url: string, config?: HttpRequestConfig): Promise<HttpResponse<T>>
}

/**
 * Cliente HTTP placeholder usado enquanto não há API real. Qualquer chamada
 * falha explicitamente — garante que nenhum provider tente rede antes de o
 * cliente real ser configurado (ver ADR-001, mock-first).
 */
export class NotConfiguredHttpClient implements HttpClient {
  private fail(): never {
    throw new Error(
      'HttpClient não configurado: o projeto está em modo mock-first. ' +
        'Implemente um HttpClient real antes de criar providers de API.',
    )
  }

  get<T>(): Promise<HttpResponse<T>> {
    return this.fail()
  }
  post<T>(): Promise<HttpResponse<T>> {
    return this.fail()
  }
  put<T>(): Promise<HttpResponse<T>> {
    return this.fail()
  }
  patch<T>(): Promise<HttpResponse<T>> {
    return this.fail()
  }
  delete<T>(): Promise<HttpResponse<T>> {
    return this.fail()
  }
}
