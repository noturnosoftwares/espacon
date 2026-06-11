import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { User } from '../models'

/** Filtros da listagem de usuários (busca textual + situação). */
export interface UserFilters {
  /** Busca livre por nome/login/e-mail (normalizada client-side). */
  query?: string
  /** Situação: `true` ativos, `false` inativos, ausente = todos. */
  active?: boolean | null
}

/** Parâmetros de listagem paginada de usuários. */
export interface ListUsersParams {
  page: number
  pageSize: number
  filters: UserFilters | null
}

/**
 * UsersRepository — contrato de CRUD de usuários (camada `domain`).
 *
 * A implementação decide o provider (mock agora, REST depois) e converte tudo em
 * `AsyncResult` — a presentation nunca trata exception crua.
 */
export interface UsersRepository {
  list(params: ListUsersParams): Promise<AsyncResult<PageResult<User>>>
  getById(id: number): Promise<AsyncResult<User>>
  save(user: User): Promise<AsyncResult<User>>
  remove(id: number): Promise<AsyncResult<void>>
}
