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
 * `T` = tipo do registro devolvido. A navegação de retorno é um
 * `router.push(returnTo)` **explícito** (o caminho da solicitante guardado na
 * requisição), e **não** `router.back()`: a listagem pode ter detours no
 * histórico (abrir "Ver detalhes", "Novo registro") e o `back()` cairia no
 * detalhe, não na solicitante. A solicitante recupera o resultado pela
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

  /**
   * Critério de aceitação declarado pela tela solicitante (ex.: `{ status:
   * 'active' }`). A listagem usa para **restringir** o que é selecionável. `null`
   * quando não há requisição/critério — a listagem aplica seu padrão.
   */
  const selectionFilter = computed(() => {
    const id = requestId.value
    return id ? (selection.get(id)?.filter ?? null) : null
  })

  /** Volta à solicitante pelo `returnTo` da requisição (robusto a detours). */
  function returnToRequester(id: string): void {
    const req = selection.get(id)
    if (req) void router.push(req.returnTo)
    else void router.back()
  }

  /** Confirma e devolve o registro à tela solicitante (não abre detalhes). */
  function confirmSelection(record: T): void {
    const id = requestId.value
    if (!id) return
    selection.resolve(id, record)
    returnToRequester(id)
  }

  /** Volta sem escolher (registra o cancelamento e retorna à solicitante). */
  function cancelSelection(): void {
    const id = requestId.value
    if (!id) {
      void router.back()
      return
    }
    selection.cancel(id)
    returnToRequester(id)
  }

  return { isSelectMode, requestId, selectionFilter, confirmSelection, cancelSelection }
}
