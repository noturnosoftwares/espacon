/**
 * restoreSelectionFocus — ao **voltar** de uma listagem em modo seleção, devolve o
 * **foco** (e rola até) o campo que disparou a busca, pelo `focusId` registrado na
 * requisição. Assim o usuário não perde o lugar na tela (ADR-003).
 *
 * Use no `onMounted` da tela solicitante, após consumir o resultado:
 * `restoreSelectionFocus(request?.focusId)`.
 */
export function restoreSelectionFocus(focusId: string | null | undefined): void {
  if (!focusId || typeof document === 'undefined') return
  requestAnimationFrame(() => {
    const el = document.getElementById(focusId)
    if (!el) return
    el.scrollIntoView({ block: 'center', behavior: 'auto' })
    el.focus({ preventScroll: true })
  })
}
