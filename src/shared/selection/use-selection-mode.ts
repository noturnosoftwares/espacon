import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSelectionStore } from './selection-store'

/**
 * useSelectionMode — liga **qualquer** tela de listagem ao canal de seleção
 * (ADR — "Tela de listagem como consulta reutilizável"). A listagem continua a
 * mesma página; este composable só lê `?mode=select&req=<id>` da rota e devolve
 * o registro à tela solicitante.
 *
 * Em **modo gestão** (sem `mode=select`) `isSelectMode` é `false` e a tela mantém
 * o comportamento normal (gestos abrem detalhes). Em **modo seleção**, a tela usa
 * `confirmSelection(record)` nos gestos de confirmar (clique/Enter) e
 * `cancelSelection()` para voltar sem escolher.
 *
 * `T` = tipo do registro devolvido. A navegação de retorno é `router.back()`
 * (preserva o histórico nativo); a solicitante recupera o resultado pela
 * `SelectionStore` ao ser reativada.
 */
export function useSelectionMode<T>() {
  const route = useRoute()
  const router = useRouter()
  const selection = useSelectionStore()

  const isSelectMode = computed(() => route.query.mode === 'select')
  const requestId = computed(() =>
    typeof route.query.req === 'string' ? route.query.req : null,
  )

  /** Confirma e devolve o registro à tela solicitante (não abre detalhes). */
  function confirmSelection(record: T): void {
    const id = requestId.value
    if (!id) return
    selection.resolve(id, record)
    router.back()
  }

  /** Volta sem escolher (registra o cancelamento e retorna à solicitante). */
  function cancelSelection(): void {
    const id = requestId.value
    if (id) selection.cancel(id)
    router.back()
  }

  return { isSelectMode, requestId, confirmSelection, cancelSelection }
}
