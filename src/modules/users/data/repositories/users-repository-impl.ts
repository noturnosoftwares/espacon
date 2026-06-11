import { type AsyncResult, guard, notFoundError, serverError } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import { normalizeText } from '@/shared/extensions'
import { type User, userFromJson, userToJson } from '../../domain/models'
import type { ListUsersParams, UsersRepository } from '../../domain/repositories'
import { MockUsersProvider } from '../providers/mock-users-provider'

/**
 * UsersRepositoryImpl — implementação do CRUD de usuários.
 *
 * Converte JSON ↔ model (mappers), aplica filtro/ordenação/paginação
 * client-side sobre o mock (na API real isso migra para query params) e protege
 * a presentation de exceptions cruas (`guard`). Provider injetado (mock → REST).
 */
export class UsersRepositoryImpl implements UsersRepository {
  constructor(private readonly provider: MockUsersProvider) {}

  list(params: ListUsersParams): Promise<AsyncResult<PageResult<User>>> {
    return guard(
      async () => {
        const all = (await this.provider.list()).map(userFromJson)
        const filtered = this.applyFilters(all, params)
        const sorted = filtered.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
        return this.paginate(sorted, params)
      },
      (cause) => serverError('Não foi possível carregar os usuários.', { cause }),
    )
  }

  getById(id: number): Promise<AsyncResult<User>> {
    return guard(
      async () => {
        const json = await this.provider.getById(id)
        if (!json) throw new Error('NOT_FOUND')
        return userFromJson(json)
      },
      (cause) => this.mapError(cause, 'Não foi possível carregar o usuário.'),
    )
  }

  save(user: User): Promise<AsyncResult<User>> {
    return guard(
      async () => userFromJson(await this.provider.save(userToJson(user))),
      (cause) => this.mapError(cause, 'Não foi possível salvar o usuário.'),
    )
  }

  remove(id: number): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.remove(id),
      (cause) => this.mapError(cause, 'Não foi possível excluir o usuário.'),
    )
  }

  // Filters
  private applyFilters(users: User[], params: ListUsersParams): User[] {
    const filters = params.filters
    if (!filters) return users

    const query = filters.query ? normalizeText(filters.query) : ''
    return users.filter((user) => {
      if (filters.active != null && user.active !== filters.active) return false
      if (!query) return true
      const haystack = normalizeText(`${user.name} ${user.login} ${user.email}`)
      return haystack.includes(query)
    })
  }

  private paginate(users: User[], params: ListUsersParams): PageResult<User> {
    const start = (params.page - 1) * params.pageSize
    return { items: users.slice(start, start + params.pageSize), total: users.length }
  }

  private mapError(cause: unknown, fallback: string) {
    if (cause instanceof Error && cause.message === 'NOT_FOUND') {
      return notFoundError('Usuário não encontrado.', { cause })
    }
    return serverError(fallback, { cause })
  }
}
