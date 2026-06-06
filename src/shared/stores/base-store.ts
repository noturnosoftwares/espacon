import { computed, ref } from 'vue'
import { type AsyncResult, isFail } from '@/shared/result'

/**
 * BaseStore — estado comum a qualquer store do projeto.
 *
 * Implementado como composable para ser usado dentro de Pinia *setup stores*
 * (composição em vez de herança de classe, que o Pinia não oferece):
 *
 * ```ts
 * export const useLoginStore = defineStore('login', () => {
 *   const base = useBaseStore()
 *   // ...estado/ações próprios...
 *   return { ...base }
 * })
 * ```
 *
 * Expõe: loading, isSaving, isDeleting, isInitialized, errorMessage,
 * successMessage, hasError — e helpers para executar `AsyncResult` controlando
 * loading/erro de forma padronizada.
 */
export function useBaseStore() {
  const loading = ref(false)
  const isSaving = ref(false)
  const isDeleting = ref(false)
  const isInitialized = ref(false)
  const errorMessage = ref<string | null>(null)
  const successMessage = ref<string | null>(null)

  const hasError = computed(() => errorMessage.value !== null)

  function setError(message: string | null): void {
    errorMessage.value = message
  }

  function setSuccess(message: string | null): void {
    successMessage.value = message
  }

  function clearMessages(): void {
    errorMessage.value = null
    successMessage.value = null
  }

  function markInitialized(): void {
    isInitialized.value = true
  }

  function resetBase(): void {
    loading.value = false
    isSaving.value = false
    isDeleting.value = false
    isInitialized.value = false
    clearMessages()
  }

  /**
   * Executa um UseCase que retorna `AsyncResult`, controlando uma flag de
   * carregamento (loading/saving/deleting) e populando `errorMessage` em falha.
   *
   * @returns o `data` em sucesso, ou `null` em falha (a mensagem já fica em
   *          `errorMessage`). Quem chama decide o que fazer com o `data`.
   */
  async function run<T>(
    operation: () => Promise<AsyncResult<T>>,
    options: { flag?: 'loading' | 'saving' | 'deleting'; clearMessagesBefore?: boolean } = {},
  ): Promise<T | null> {
    const { flag = 'loading', clearMessagesBefore = true } = options
    const flagRef = flag === 'saving' ? isSaving : flag === 'deleting' ? isDeleting : loading

    if (clearMessagesBefore) clearMessages()
    flagRef.value = true
    try {
      const result = await operation()
      if (isFail(result)) {
        errorMessage.value = result.error.message
        return null
      }
      return result.data
    } finally {
      flagRef.value = false
    }
  }

  return {
    // estado
    loading,
    isSaving,
    isDeleting,
    isInitialized,
    errorMessage,
    successMessage,
    hasError,
    // ações
    setError,
    setSuccess,
    clearMessages,
    markInitialized,
    resetBase,
    run,
  }
}

export type BaseStore = ReturnType<typeof useBaseStore>
