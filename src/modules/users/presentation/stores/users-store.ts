import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseCrudStore, type CancelOutcome } from '@/shared/stores'
import { isOk } from '@/shared/result'
import type { Permission } from '@/shared/access'
import {
  type CashOperator,
  cashOperatorLabel,
} from '@/modules/cash-operators/domain/models'
import { makeCashOperatorsUseCases } from '@/modules/cash-operators/data/application'
import {
  type User,
  type UserProfile,
  copyUser,
  copyCashOperatorAssignment,
  emptyUser,
} from '../../domain/models'
import type { UserFilters } from '../../domain/repositories'
import { applyProfileToUser, makeUsersUseCases, makeUserProfilesUseCases } from '../../data/application'

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
  const profileUsecases = makeUserProfilesUseCases()
  const cashUsecases = makeCashOperatorsUseCases()

  // A lista já foi pesquisada ao menos uma vez nesta sessão de navegação?
  // Preserva o contexto ao voltar de um registro (não zera a tela).
  const searched = ref(false)
  const currentQuery = computed(() => crud.filters.value?.query ?? '')

  // Rótulo do perfil de origem (`sourceProfileId`) para exibir no campo de busca
  // sem carregar todos os perfis: resolvido pontualmente por id. É só cosmético —
  // a autorização lê `editing.permissions`, não o perfil.
  const sourceProfileLabel = ref<string | null>(null)

  /** Resolve a descrição do perfil de origem (fallback para `Perfil #id`). */
  async function resolveSourceProfileLabel(id: number | null): Promise<void> {
    if (id == null) {
      sourceProfileLabel.value = null
      return
    }
    const result = await profileUsecases.getUserProfileById(id)
    sourceProfileLabel.value = isOk(result) ? result.data.description : `Perfil #${id}`
  }

  // Rótulo "código — nome" do operador limitado vinculado (`operatorCode`), para
  // o campo de busca exibir além do código. Só cosmético — a referência gravada é
  // o `operatorCode`. Resolvido entre os operadores ativos do cadastro.
  const selectedOperatorLabel = ref<string | null>(null)

  /** Resolve o rótulo do operador pelo `code` (fallback para o próprio código). */
  async function resolveOperatorLabel(code: string | null): Promise<void> {
    if (!code) {
      selectedOperatorLabel.value = null
      return
    }
    const result = await cashUsecases.getActiveCashOperators()
    const found = isOk(result) ? result.data.find((operator) => operator.code === code) : undefined
    selectedOperatorLabel.value = found ? cashOperatorLabel(found) : code
  }

  /** Aplica o operador escolhido na listagem em modo seleção (grava o `code`). */
  function applyOperator(operator: CashOperator): void {
    if (!crud.editing.value) return
    patch({
      cashOperator: copyCashOperatorAssignment(crud.editing.value.cashOperator, {
        operatorCode: operator.code,
      }),
    })
    selectedOperatorLabel.value = cashOperatorLabel(operator)
  }

  /** Limpa o rótulo do operador (o `operatorCode` é zerado pelo campo). */
  function clearOperator(): void {
    selectedOperatorLabel.value = null
  }

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
    sourceProfileLabel.value = null
    selectedOperatorLabel.value = null
  }

  async function loadForEdit(id: number): Promise<boolean> {
    // Limpa o registro anterior ANTES de carregar (store singleton): evita o flash
    // do usuário velho enquanto o novo chega — a tela mostra o skeleton.
    crud.clearEditing()
    sourceProfileLabel.value = null
    selectedOperatorLabel.value = null
    const user = await crud.run(() => usecases.getUserById(id))
    if (user) {
      crud.beginEdit(user)
      await resolveSourceProfileLabel(user.sourceProfileId)
      await resolveOperatorLabel(user.cashOperator.operatorCode)
    }
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
    if (crud.editing.value) {
      crud.setEditing(applyProfileToUser(crud.editing.value, profile))
      sourceProfileLabel.value = profile.description
    }
  }

  /** Limpa apenas o vínculo de origem (não desfaz as ações já copiadas). */
  function clearProfile(): void {
    patch({ sourceProfileId: null })
    sourceProfileLabel.value = null
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
    sourceProfileLabel,
    selectedOperatorLabel,
    load,
    loadNext,
    applyFilters,
    refresh,
    startNew,
    loadForEdit,
    patch,
    setPermissions,
    applyProfile,
    clearProfile,
    applyOperator,
    clearOperator,
    cancelEdit,
    save,
    remove,
  }
})
