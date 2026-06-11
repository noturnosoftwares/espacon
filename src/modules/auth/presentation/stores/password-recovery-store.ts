import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useBaseStore } from '@/shared/stores'
import { isValidEmail } from '@/shared/extensions'
import { makeRecoverPasswordUseCase } from '../../data/application'

/**
 * usePasswordRecoveryStore — estado e ação da tela "Recuperar senha"
 * (ver `docs/specifications/auth/password-recovery.md`).
 *
 * Estende `useBaseStore` (não é CRUD). Composição via factory explícita do
 * UseCase (sem DI global). A page navega/decide UI; a store apenas valida e
 * executa o envio, expondo `sent` para a tela mostrar a confirmação.
 *
 * **Anti-enumeração:** em sucesso a mensagem é genérica e **não** revela se o
 * e-mail existe — a UI mostra sempre o mesmo estado de "enviado".
 */
export const usePasswordRecoveryStore = defineStore('password-recovery', () => {
  const base = useBaseStore()
  const recover = makeRecoverPasswordUseCase()

  const email = ref('')
  const sent = ref(false)

  const canSubmit = computed(() => email.value.trim().length > 0 && !base.loading.value)

  /** Reinicia o estado a cada montagem da tela (store é singleton). */
  function init(): void {
    base.resetBase()
    email.value = ''
    sent.value = false
  }

  /** Valida o formato e dispara o envio. Em sucesso, marca `sent`. */
  async function submit(): Promise<void> {
    base.clearMessages()
    if (!isValidEmail(email.value)) {
      base.setError('Informe um e-mail válido.')
      return
    }
    await base.run(() => recover(email.value.trim()))
    // Resultado é `void`: distinguimos sucesso/falha pelo estado de erro que o
    // `run` populou (anti-enumeração — a UI mostra sempre o mesmo "enviado").
    if (!base.hasError.value) sent.value = true
  }

  /** Permite reenviar (volta ao formulário a partir da confirmação). */
  function reset(): void {
    sent.value = false
    base.clearMessages()
  }

  return {
    ...base,
    email,
    sent,
    canSubmit,
    init,
    submit,
    reset,
  }
})
