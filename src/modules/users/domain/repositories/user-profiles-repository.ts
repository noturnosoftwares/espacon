import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { UserProfile } from '../models'

/** Filtros da listagem de perfis. */
export interface UserProfileFilters {
  query?: string
}

export interface ListUserProfilesParams {
  page: number
  pageSize: number
  filters: UserProfileFilters | null
}

/**
 * UserProfilesRepository — contrato de CRUD de perfis de usuário (modelos de
 * cadastro). Mesmo padrão `AsyncResult` do `UsersRepository`.
 */
export interface UserProfilesRepository {
  list(params: ListUserProfilesParams): Promise<AsyncResult<PageResult<UserProfile>>>
  getById(id: number): Promise<AsyncResult<UserProfile>>
  save(profile: UserProfile): Promise<AsyncResult<UserProfile>>
  remove(id: number): Promise<AsyncResult<void>>
}
