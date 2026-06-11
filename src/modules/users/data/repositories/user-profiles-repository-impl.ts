import { type AsyncResult, guard, notFoundError, serverError } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import { normalizeText } from '@/shared/extensions'
import { type UserProfile, userProfileFromJson, userProfileToJson } from '../../domain/models'
import type { ListUserProfilesParams, UserProfilesRepository } from '../../domain/repositories'
import { MockUserProfilesProvider } from '../providers/mock-user-profiles-provider'

/**
 * UserProfilesRepositoryImpl — CRUD de perfis. Mesmo padrão do
 * `UsersRepositoryImpl`: mappers, filtro/ordenação/paginação client-side e
 * `guard` para nunca vazar exception crua.
 */
export class UserProfilesRepositoryImpl implements UserProfilesRepository {
  constructor(private readonly provider: MockUserProfilesProvider) {}

  list(params: ListUserProfilesParams): Promise<AsyncResult<PageResult<UserProfile>>> {
    return guard(
      async () => {
        const all = (await this.provider.list()).map(userProfileFromJson)
        const query = params.filters?.query ? normalizeText(params.filters.query) : ''
        const filtered = query
          ? all.filter((profile) => normalizeText(profile.description).includes(query))
          : all
        const sorted = filtered.sort((a, b) => a.description.localeCompare(b.description, 'pt-BR'))
        const start = (params.page - 1) * params.pageSize
        return { items: sorted.slice(start, start + params.pageSize), total: sorted.length }
      },
      (cause) => serverError('Não foi possível carregar os perfis.', { cause }),
    )
  }

  getById(id: number): Promise<AsyncResult<UserProfile>> {
    return guard(
      async () => {
        const json = await this.provider.getById(id)
        if (!json) throw new Error('NOT_FOUND')
        return userProfileFromJson(json)
      },
      (cause) => this.mapError(cause, 'Não foi possível carregar o perfil.'),
    )
  }

  save(profile: UserProfile): Promise<AsyncResult<UserProfile>> {
    return guard(
      async () => userProfileFromJson(await this.provider.save(userProfileToJson(profile))),
      (cause) => this.mapError(cause, 'Não foi possível salvar o perfil.'),
    )
  }

  remove(id: number): Promise<AsyncResult<void>> {
    return guard(
      () => this.provider.remove(id),
      (cause) => this.mapError(cause, 'Não foi possível excluir o perfil.'),
    )
  }

  private mapError(cause: unknown, fallback: string) {
    if (cause instanceof Error && cause.message === 'NOT_FOUND') {
      return notFoundError('Perfil não encontrado.', { cause })
    }
    return serverError(fallback, { cause })
  }
}
