import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseStore } from '@/shared/stores'
import { isValidEmail } from '@/shared/extensions'
import type { AuthSession } from '../../domain/models'
import {
  makeLoginUseCase,
  makeSessionRepository,
} from '../../data/application'

/**
 * useAuthStore — estado e ações do formulário de acesso (login).
 *
 * Estende `useBaseStore` (login **não** é CRUD). Composição via factory explícita
 * dos UseCases (sem DI global). A persistência de sessão/e-mail é provisória
 * (ver ADR-005); a senha **nunca** é persistida.
 *
 * A navegação (router) fica na page: `submit()` retorna a `AuthSession` em
 * sucesso (ou `null` em falha/validação), mantendo a store testável e desacoplada
 * do Vue Router.
 */
export const useAuthStore = defineStore('auth', () => {
  const base = useBaseStore()
  const login = makeLoginUseCase()
  const sessionRepository = makeSessionRepository()

  // -- Form state -----------------------------------------------------------
  const email = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const rememberEmail = ref(false)
  const keepSignedIn = ref(false)

  const canSubmit = computed(
    () => email.value.trim().length > 0 && password.value.length > 0 && !base.loading.value,
  )

  // -- Initialization -------------------------------------------------------

  /**
   * Prepara a tela: pré-preenche o e-mail lembrado (se houver) e marca a opção
   * "Lembrar e-mail". O redirecionamento por sessão salva é responsabilidade do
   * guard de rota (ver `src/router`).
   *
   * Reinicia o estado transitório a cada montagem (a store Pinia é singleton; a
   * spec pede comportamento "por tela").
   */
  function init(): void {
    base.resetBase()
    password.value = ''
    showPassword.value = false

    const remembered = sessionRepository.readEmail()
    email.value = remembered ?? ''
    rememberEmail.value = remembered !== null
    keepSignedIn.value = false
  }

  function toggleShowPassword(): void {
    showPassword.value = !showPassword.value
  }

  // -- Submit ---------------------------------------------------------------

  /**
   * Valida (pré-envio) e executa o login. Em sucesso, persiste a sessão e trata
   * o e-mail lembrado, devolvendo a sessão para a page navegar ao dashboard.
   *
   * @returns a `AuthSession` em sucesso; `null` em validação/erro (a mensagem
   *          fica em `errorMessage`).
   */
  async function submit(): Promise<AuthSession | null> {
    if (!validate()) return null

    const session = await base.run(() =>
      login({
        email: email.value.trim(),
        password: password.value,
        keepSignedIn: keepSignedIn.value,
      }),
    )

    if (session) {
      persistAfterLogin(session)
      // Segurança: senha só existe em memória durante o envio.
      password.value = ''
    }
    return session
  }

  /** Validação de formato antes do envio (ver Casos de Erro da spec). */
  function validate(): boolean {
    base.clearMessages()
    if (!isValidEmail(email.value)) {
      base.setError('Informe um e-mail válido.')
      return false
    }
    if (password.value.length === 0) {
      base.setError('Informe sua senha.')
      return false
    }
    return true
  }

  /** Persiste sessão (local/sessão conforme "Manter acesso") e e-mail lembrado. */
  function persistAfterLogin(session: AuthSession): void {
    sessionRepository.save(session, keepSignedIn.value)
    if (rememberEmail.value) {
      sessionRepository.rememberEmail(email.value)
    } else {
      sessionRepository.clearEmail()
    }
  }

  return {
    ...base,
    // state
    email,
    password,
    showPassword,
    rememberEmail,
    keepSignedIn,
    canSubmit,
    // actions
    init,
    toggleShowPassword,
    submit,
  }
})
