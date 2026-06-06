import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { AuthUser, UserRole } from '../../domain/models'
import { makeSessionRepository } from '../../data/application'

/**
 * useSessionStore — sessão **corrente** do usuário autenticado (pós-login).
 *
 * Consome a persistência provisória de sessão (ADR-005) via factory do módulo,
 * expõe o usuário logado (para Header/perfil) e a ação de `logout`. Reutilizável
 * por qualquer tela autenticada — separada da `useAuthStore` (que é o formulário
 * de login).
 *
 * Singleton (Pinia): a sessão é global à aplicação. A estratégia definitiva
 * (token) substituirá a leitura local quando a API real existir (ADR-003).
 */
const ROLE_LABELS: Readonly<Record<UserRole, string>> = {
  admin: 'Administrador',
  franchisee: 'Franqueado',
  representative: 'Representante',
  technician: 'Técnico',
  customer: 'Cliente',
}

export const useSessionStore = defineStore('session', () => {
  const sessionRepository = makeSessionRepository()

  const user = ref<AuthUser | null>(null)

  const isAuthenticated = computed(() => user.value !== null)
  const roleLabel = computed(() => (user.value ? ROLE_LABELS[user.value.role] : ''))
  /** Iniciais para avatar (ex.: "Administrador Noturno" → "AN"). */
  const initials = computed(() => {
    if (!user.value) return ''
    const parts = user.value.name.trim().split(/\s+/)
    const first = parts[0]?.charAt(0) ?? ''
    const last = parts.length > 1 ? (parts[parts.length - 1]?.charAt(0) ?? '') : ''
    return (first + last).toUpperCase()
  })

  /** Carrega a sessão salva (chamado pelas telas autenticadas, ex.: Home). */
  function load(): void {
    const session = sessionRepository.read()
    user.value = session?.user ?? null
  }

  /** Encerra a sessão (limpa storage). O e-mail lembrado é preservado. */
  function logout(): void {
    sessionRepository.clear()
    user.value = null
  }

  return {
    user,
    isAuthenticated,
    roleLabel,
    initials,
    load,
    logout,
  }
})
