import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseCrudStore, type CancelOutcome } from '@/shared/stores'
import type { Permission } from '@/shared/access'
import { type User, type UserProfile, copyUser, emptyUser } from '../../domain/models'
import type { UserFilters } from '../../domain/repositories'
import { applyProfileToUser, makeUsersUseCases } from '../../data/application'

/**
 * useUsersStore — estado do CRUD de usuários (lista + edição).
 *
 * Lista via `useBaseCrudStore`: filtro/seleção + **scroll infinito** (ADR-002).
 * A edição também vem do BaseCrudStore (`editing` + snapshot imutável), o que
 * dá o **cancelar com restauração** (ADR-001): cancelar uma edição restaura o
 * registro original e permanece no detalhe; cancelar um registro novo volta à
 * listagem. Toda mutação cria nova instância imutável (`copyUser`). Regra de
 * ouro: `applyProfile` **redefine** as ações, mas a autorização continua lendo
 * `editing.permissions`.
 */
export const useUsersStore = defineStore('users', () => {
  const crud = useBaseCrudStore<User, UserFilters>()
  const usecases = makeUsersUseCases()

  // A lista já foi pesquisada ao menos uma vez nesta sessão de navegação?
  // Preserva o contexto ao voltar de um registro (não zera a tela).
  const searched = ref(false)
  const currentQuery = computed(() => crud.filters.value?.query ?? '')

  // Load
  async function load(): Promise<void> {
    await crud.loadPage((page, pageSize, filters) =>
      usecases.getUsers({ page, pageSize, filters }),
    )
  }

  /** Carrega o próximo lote (scroll infinito — ADR-002). */
  async function loadNext(): Promise<void> {
    await crud.loadMore((page, pageSize, filters) =>
      usecases.getUsers({ page, pageSize, filters }),
    )
  }

  function applyFilters(filters: UserFilters): void {
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
    crud.beginCreate(emptyUser())
  }

  async function loadForEdit(id: number): Promise<boolean> {
    const user = await crud.run(() => usecases.getUserById(id))
    if (user) crud.beginEdit(user)
    return user !== null
  }

  /** Aplica uma alteração parcial ao usuário em edição (imutável). */
  function patch(changes: Partial<User>): void {
    if (crud.editing.value) crud.setEditing(copyUser(crud.editing.value, changes))
  }

  /** Substitui as permissões em edição (usado pela matriz). */
  function setPermissions(permissions: Permission[]): void {
    patch({ permissions })
  }

  /** Redefine as ações conforme o perfil selecionado (sobrescreve). */
  function applyProfile(profile: UserProfile): void {
    if (crud.editing.value) crud.setEditing(applyProfileToUser(crud.editing.value, profile))
  }

  /**
   * Cancela a edição (ADR-001): restaura o registro original e devolve `'stay'`
   * (permanecer no detalhe) ou `'leave'` (registro novo → voltar à listagem).
   */
  function cancelEdit(): CancelOutcome {
    return crud.cancelEditing()
  }

  // Save / Delete
  async function save(): Promise<boolean> {
    if (!crud.editing.value) return false
    const saved = await crud.run(() => usecases.saveUser(crud.editing.value as User), {
      flag: 'saving',
    })
    if (saved) {
      crud.commitEditing(saved)
      crud.setSuccess('Usuário salvo com sucesso.')
    }
    return saved !== null
  }

  async function remove(id: number): Promise<boolean> {
    await crud.run(() => usecases.deleteUser(id), { flag: 'deleting' })
    // `run` não distingue sucesso `void` de falha pelo retorno — checamos o erro.
    if (!crud.hasError.value) {
      crud.setSuccess('Usuário excluído.')
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
    applyProfile,
    cancelEdit,
    save,
    remove,
  }
})
