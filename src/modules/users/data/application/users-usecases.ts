import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { User } from '../../domain/models'
import type { ListUsersParams, UsersRepository } from '../../domain/repositories'
import { UsersRepositoryImpl } from '../repositories/users-repository-impl'
import { MockUsersProvider } from '../providers/mock-users-provider'

/**
 * UseCases de usuário: `GetUsers`, `GetUserById`, `SaveUser`, `DeleteUser`.
 * Compostos por factory explícita — UseCases → Repository → Provider — seguindo
 * o padrão do módulo `home`.
 *
 * TROCA POR API REAL: trocar `MockUsersProvider` por `RestUsersProvider` aqui.
 */
export interface UsersUseCases {
  getUsers: (params: ListUsersParams) => Promise<AsyncResult<PageResult<User>>>
  getUserById: (id: number) => Promise<AsyncResult<User>>
  saveUser: (user: User) => Promise<AsyncResult<User>>
  deleteUser: (id: number) => Promise<AsyncResult<void>>
}

export function makeUsersRepository(): UsersRepository {
  return new UsersRepositoryImpl(new MockUsersProvider())
}

export function makeUsersUseCases(): UsersUseCases {
  const repository = makeUsersRepository()
  return {
    getUsers: (params) => repository.list(params),
    getUserById: (id) => repository.getById(id),
    saveUser: (user) => repository.save(user),
    deleteUser: (id) => repository.remove(id),
  }
}
