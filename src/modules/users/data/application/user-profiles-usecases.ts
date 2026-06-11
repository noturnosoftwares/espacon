import type { AsyncResult } from '@/shared/result'
import type { PageResult } from '@/shared/stores'
import type { UserProfile } from '../../domain/models'
import type { ListUserProfilesParams, UserProfilesRepository } from '../../domain/repositories'
import { UserProfilesRepositoryImpl } from '../repositories/user-profiles-repository-impl'
import { MockUserProfilesProvider } from '../providers/mock-user-profiles-provider'

/**
 * UseCases de perfil: `GetUserProfiles`, `GetUserProfileById`, `SaveUserProfile`,
 * `DeleteUserProfile`. Factory explícita (UseCases → Repository → Provider).
 *
 * TROCA POR API REAL: trocar `MockUserProfilesProvider` por `RestUserProfilesProvider`.
 */
export interface UserProfilesUseCases {
  getUserProfiles: (params: ListUserProfilesParams) => Promise<AsyncResult<PageResult<UserProfile>>>
  getUserProfileById: (id: number) => Promise<AsyncResult<UserProfile>>
  saveUserProfile: (profile: UserProfile) => Promise<AsyncResult<UserProfile>>
  deleteUserProfile: (id: number) => Promise<AsyncResult<void>>
}

export function makeUserProfilesRepository(): UserProfilesRepository {
  return new UserProfilesRepositoryImpl(new MockUserProfilesProvider())
}

export function makeUserProfilesUseCases(): UserProfilesUseCases {
  const repository = makeUserProfilesRepository()
  return {
    getUserProfiles: (params) => repository.list(params),
    getUserProfileById: (id) => repository.getById(id),
    saveUserProfile: (profile) => repository.save(profile),
    deleteUserProfile: (id) => repository.remove(id),
  }
}
