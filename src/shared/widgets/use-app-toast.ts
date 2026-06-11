import { useToast } from 'primevue/usetoast'
import type { ToastMessageOptions } from 'primevue/toast'

/**
 * useAppToast — wrapper do `useToast` do PrimeVue com **deduplicação por
 * conteúdo** (Design System §8.8).
 *
 * Problema: clicar repetidamente em "Salvar" (ou em qualquer gatilho) empilhava
 * dezenas de toasts idênticos. Aqui um `add` cujo conteúdo (severity + título +
 * mensagem) já está **vivo** é simplesmente ignorado — só reabre depois que o
 * anterior se dispensa.
 *
 * O registro é **module-level** (um único `Toast` global no `App.vue`), então a
 * dedupe vale para a aplicação inteira, independente do componente que dispara.
 * Cada chave se autolimpa após o `life` do toast (mesmo tempo em que ele some da
 * tela); sem `life`, usa-se um padrão seguro.
 */
const DEFAULT_LIFE = 5000

// Chaves de toasts atualmente "vivos" (mapeadas para o id do timer de limpeza).
const live = new Map<string, ReturnType<typeof setTimeout>>()

function keyOf(message: ToastMessageOptions): string {
  return [
    message.severity ?? 'info',
    message.summary ?? '',
    message.detail ?? '',
    message.group ?? '',
  ].join('|')
}

export function useAppToast() {
  const toast = useToast()

  /**
   * Dispara o toast só se um idêntico não estiver visível. Retorna `true` se
   * abriu, `false` se foi suprimido por duplicidade.
   */
  function add(message: ToastMessageOptions): boolean {
    const key = keyOf(message)
    if (live.has(key)) return false

    toast.add(message)
    const life = typeof message.life === 'number' ? message.life : DEFAULT_LIFE
    live.set(
      key,
      setTimeout(() => live.delete(key), life),
    )
    return true
  }

  return { add, toast }
}
