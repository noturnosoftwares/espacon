import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseCrudStore, type CancelOutcome } from '@/shared/stores'
import type { Permission } from '@/shared/access'
import { type UserProfile, copyUserProfile, emptyUserProfile } from '../../domain/models'
import type { UserProfileFilters } from '../../domain/repositories'
import { makeUserProfilesUseCases } from '../../data/application'

/**
 * useUserProfilesStore — CRUD de perfis (modelos de cadastro). Mesmo padrão da
 * `useUsersStore`: lista via `useBaseCrudStore` com **scroll infinito** (ADR-002)
 * e edição com **snapshot imutável** (cancelar restaura e permanece — ADR-001).
 * Lembrete: o perfil é só um modelo de cadastro (não autoriza nada).
 */
export const useUserProfilesStore = defineStore('user-profiles', () => {
  const crud = useBaseCrudStore<UserProfile, UserProfileFilters>()
  const usecases = makeUserProfilesUseCases()

  // Preserva o contexto ao voltar de um registro (não zera a pesquisa).
  const searched = ref(false)
  const currentQuery = computed(() => crud.filters.value?.query ?? '')

  // Load
  async function load(): Promise<void> {
    await crud.loadPage((page, pageSize, filters) =>
      usecases.getUserProfiles({ page, pageSize, filters }),
    )
  }

  /** Carrega o próximo lote (scroll infinito — ADR-002). */
  async function loadNext(): Promise<void> {
    await crud.loadMore((page, pageSize, filters) =>
      usecases.getUserProfiles({ page, pageSize, filters }),
    )
  }

  function applyFilters(filters: UserProfileFilters): void {
    searched.value = true
    crud.setFilters(filters)
    void load()
  }

  /** Recarrega a listagem com os filtros atuais (ex.: ao voltar da edição). */
  async function refresh(): Promise<void> {
    if (searched.value) await load()
  }

  // Edição (estado de formulário) — delega o snapshot ao BaseCrudStore
  function startNew(): void {
    crud.beginCreate(emptyUserProfile())
  }

  async function loadForEdit(id: number): Promise<boolean> {
    const profile = await crud.run(() => usecases.getUserProfileById(id))
    if (profile) crud.beginEdit(profile)
    return profile !== null
  }

  function patch(changes: Partial<UserProfile>): void {
    if (crud.editing.value) crud.setEditing(copyUserProfile(crud.editing.value, changes))
  }

  function setPermissions(permissions: Permission[]): void {
    patch({ permissions })
  }

  /**
   * Cancela a edição (ADR-001): restaura o perfil original e devolve `'stay'`
   * (permanecer no detalhe) ou `'leave'` (registro novo → voltar à listagem).
   */
  function cancelEdit(): CancelOutcome {
    return crud.cancelEditing()
  }

  // Save / Delete
  async function save(): Promise<boolean> {
    if (!crud.editing.value) return false
    const saved = await crud.run(() => usecases.saveUserProfile(crud.editing.value as UserProfile), {
      flag: 'saving',
    })
    if (saved) {
      crud.commitEditing(saved)
      crud.setSuccess('Perfil salvo com sucesso.')
    }
    return saved !== null
  }

  async function remove(id: number): Promise<boolean> {
    await crud.run(() => usecases.deleteUserProfile(id), { flag: 'deleting' })
    if (!crud.hasError.value) {
      crud.setSuccess('Perfil excluído.')
      await load()
      return true
    }
    return false
  }

  return {
    ...crud,
    searched,
    currentQuery,
    load,
    loadNext,
    applyFilters,
    refresh,
    startNew,
    loadForEdit,
    patch,
    setPermissions,
    cancelEdit,
    save,
    remove,
  }
})
