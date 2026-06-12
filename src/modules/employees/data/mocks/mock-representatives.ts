import type { RepresentativeSummaryJson } from '../../domain/models'

/**
 * mock-representatives — representantes fictícios para o lookup, até o cadastro de
 * representantes existir. TROCA POR API REAL: `RestRepresentativeProvider`.
 */
export const MOCK_REPRESENTATIVES: RepresentativeSummaryJson[] = [
  { id: 1, name: 'Aurora Distribuição Ltda' },
  { id: 2, name: 'Boreal Representações' },
  { id: 3, name: 'Cometa Vendas e Serviços' },
  { id: 4, name: 'Delta Comercial' },
]
