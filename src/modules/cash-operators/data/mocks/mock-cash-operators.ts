import type { CashOperatorJson } from '../../domain/models'

/**
 * mock-cash-operators — registro mestre de operadores na fase mock-first.
 *
 * Inclui um inativo (`Caixa Eventos`) para exercitar o filtro de situação e o
 * código `07`, referenciado pelo usuário "operador limitado" do mock de usuários
 * (mantém o vínculo demonstrável de ponta a ponta).
 *
 * TROCA POR API REAL: `RestCashOperatorProvider` busca este mesmo JSON
 * (`GET /financial/cash-operators`). Unicidade de `code` definida no backend.
 */
export const MOCK_CASH_OPERATORS: CashOperatorJson[] = [
  { id: 1, code: '001', name: 'Caixa Principal', active: true },
  { id: 2, code: '002', name: 'Caixa Loja Centro', active: true },
  { id: 3, code: '003', name: 'Caixa Eventos', active: false },
  { id: 4, code: '07', name: 'Caixa Recepção', active: true },
]
