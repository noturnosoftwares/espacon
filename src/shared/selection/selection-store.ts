import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { SelectionRequest, SelectionResult } from './selection-types'

/**
 * useSelectionStore — **canal de handoff** entre a tela solicitante e a listagem
 * aberta em modo seleção (ADR — "Tela de listagem como consulta reutilizável").
 *
 * Mantém um mapa `requestId → { request, result }`. A solicitante chama `open`
 * (recebe o id e navega), a listagem `resolve`/`cancel`, e a solicitante `consume`
 * ao ser reativada. Como as páginas **remontam** ao navegar (não há keep-alive),
 * a solicitante recupera o id da sua requisição por `pendingFor(returnTo)` — não
 * depende de estado local que não sobrevive ao ida-e-volta.
 *
 * Esta store é **apenas canal**: não guarda regra de negócio. O carregamento dos
 * dados continua passando por Store → Application → Repository → Provider.
 */
interface SelectionEntry {
  request: SelectionRequest
  result: SelectionResult | null
}

export const useSelectionStore = defineStore('selection', () => {
  // Reatividade não é essencial (as leituras são imperativas no ciclo de vida),
  // mas a store é singleton e o estado precisa sobreviver às navegações.
  const entries = ref(new Map<string, SelectionEntry>())
  let seq = 0

  // ── Commands ───────────────────────────────────────────────────────────────
  /**
   * Registra uma requisição e devolve o seu id (a solicitante navega em seguida).
   * Disciplina de fluxo único: descarta requisições **pendentes** anteriores da
   * mesma tela (`returnTo`) para não vazar estado entre fluxos.
   */
  function open(req: Omit<SelectionRequest, 'id'>): string {
    for (const [id, entry] of entries.value) {
      if (entry.request.returnTo === req.returnTo && entry.result === null) {
        entries.value.delete(id)
      }
    }
    const id = `sel-${++seq}`
    entries.value.set(id, { request: { id, ...req }, result: null })
    return id
  }

  /** A listagem confirma a seleção, anexando o registro escolhido. */
  function resolve<T>(id: string, data: T): void {
    const entry = entries.value.get(id)
    if (entry) entry.result = { status: 'selected', data }
  }

  /** A listagem cancela (usuário voltou sem escolher). */
  function cancel(id: string): void {
    const entry = entries.value.get(id)
    if (entry) entry.result = { status: 'cancelled' }
  }

  // ── Queries ──────────────────────────────────────────────────────────────
  /** Dados da requisição (ex.: `returnTo`), sem consumi-la. */
  function get(id: string): SelectionRequest | null {
    return entries.value.get(id)?.request ?? null
  }

  /**
   * Id da requisição associada a uma tela (`returnTo`), pendente ou resolvida.
   * Permite à solicitante recuperar a sua requisição após remontar. Devolve a
   * mais recente quando houver mais de uma.
   */
  function pendingFor(returnTo: string): string | null {
    let found: string | null = null
    for (const [id, entry] of entries.value) {
      if (entry.request.returnTo === returnTo) found = id
    }
    return found
  }

  /** A solicitante lê o resultado e **limpa** a requisição. */
  function consume(id: string): SelectionResult | null {
    const entry = entries.value.get(id)
    if (!entry) return null
    entries.value.delete(id)
    return entry.result
  }

  return { open, resolve, cancel, get, pendingFor, consume }
})
