/**
 * Contratos do **canal de seleção** (ADR — "Tela de listagem como consulta
 * reutilizável: modo gestão × modo seleção").
 *
 * Uma tela solicitante (ex.: cadastro de usuário escolhendo um perfil) registra
 * uma `SelectionRequest`, navega para a listagem do dado em `?mode=select&req=<id>`
 * e recebe de volta um `SelectionResult` pela `SelectionStore`. O canal carrega
 * apenas o **registro já carregado** pela listagem — não cria UseCase/Repository
 * só para "devolver".
 */

/** Pedido de seleção registrado pela tela solicitante (antes de navegar). */
export interface SelectionRequest {
  /** Id único da requisição (gerado pela store ao abrir). */
  id: string
  /** Recurso pedido, ex.: `'perfis'`. */
  resource: string
  /** Rota da tela solicitante, para onde a listagem retorna ao confirmar/cancelar. */
  returnTo: string
  /** Seleção múltipla (reservado para uso futuro). */
  multiple?: boolean
}

/**
 * Resultado entregue pela listagem à tela solicitante. `selected` carrega o
 * registro escolhido (genérico em `T`); `cancelled` indica que o usuário voltou
 * sem escolher.
 */
export type SelectionResult<T = unknown> =
  | { status: 'selected'; data: T }
  | { status: 'cancelled' }
