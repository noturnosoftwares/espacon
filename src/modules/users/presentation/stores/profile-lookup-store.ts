import { defineStore } from 'pinia'
import { useBaseCrudStore } from '@/shared/stores'
import type { UserProfile } from '../../domain/models'
import type { UserProfileFilters } from '../../domain/repositories'
import { makeUserProfilesUseCases } from '../../data/application'

/**
 * useProfileLookupStore — fonte de dados **isolada** para o campo de busca de
 * perfis (LookupField) usado no cadastro de usuário.
 *
 * Por que um store próprio (e não o `useUserProfilesStore`): o perfil é um **dado
 * de referência vindo do backend** (DS §9.2 — usa **search**, não listbox), e o
 * picker não pode contaminar o estado de pesquisa/scroll da tela de listagem de
 * perfis (mesmo singleton). Aqui o conjunto é pequeno: carrega tudo uma vez e o
 * widget filtra no cliente (cache — §9.1).
 */
export const useProfileLookupStore = defineStore('profile-lookup', () => {
  const crud = useBaseCrudStore<UserProfile, UserProfileFilters>()
  const usecases = makeUserProfilesUseCases()

  /** Carrega todos os perfis uma vez (para busca client-side no picker). */
  async function ensureLoaded(): Promise<void> {
    if (crud.items.value.length > 0 || crud.loading.value) return
    crud.setPageSize(500)
    crud.setFilters(null)
    await crud.loadPage((page, pageSize, filters) =>
      usecases.getUserProfiles({ page, pageSize, filters }),
    )
  }

  return { ...crud, ensureLoaded }
})
