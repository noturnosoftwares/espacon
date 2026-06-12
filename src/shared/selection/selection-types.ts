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

/**
 * Critério de **aceitação** opcional do modo seleção. A tela solicitante declara
 * quais registros podem ser escolhidos (ex.: só operador `active`, funcionário
 * não-demitido); a listagem, em `mode=select`, **restringe** a esse critério. É um
 * mapa livre por recurso — cada listagem interpreta as chaves que conhece (ex.:
 * `{ status: 'active' }`). Quando ausente, a listagem usa seu padrão seguro.
 */
export type SelectionFilter = Record<string, unknown>

/** Pedido de seleção registrado pela tela solicitante (antes de navegar). */
export interface SelectionRequest {
  /** Id único da requisição (gerado pela store ao abrir). */
  id: string
  /** Recurso pedido, ex.: `'perfis'`. */
  resource: string
  /** Rota da tela solicitante, para onde a listagem retorna ao confirmar/cancelar. */
  returnTo: string
  /**
   * Id do elemento (campo) que disparou a busca. Ao voltar, a tela solicitante
   * devolve o **foco** (e rola até) este elemento — o usuário não perde o lugar.
   */
  focusId?: string
  /** Critério de aceitação que a listagem deve respeitar em `mode=select`. */
  filter?: SelectionFilter
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
