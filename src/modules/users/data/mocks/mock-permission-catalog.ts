import type { PermissionCatalogEntryJson } from '../../domain/models'

/**
 * mock-permission-catalog — lista mestra de recursos do ERP (mock-first).
 *
 * Reflete os módulos do EspaçoN (Comercial, Atendimento, Financeiro,
 * Administrativo, Conhecimento). Convivem itens de **menu** (ex.: "Cadastro de
 * Cliente", "Contrato") e **não-menu** (ex.: "Desbloquear Cliente", uma ação de
 * botão). Catálogo ≠ menu lateral.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ TROCA POR API REAL: `RestPermissionCatalogProvider` busca este mesmo JSON  │
 * │ em `GET /permissions/catalog`. Padronizar a descrição (UPPER, sem acento)  │
 * │ no backend; o frontend normaliza defensivamente (`normalizePermissionKey`).│
 * └──────────────────────────────────────────────────────────────────────────┘
 */
export const MOCK_PERMISSION_CATALOG: PermissionCatalogEntryJson[] = [
  // Comercial
  { code: 'COM-001', label: 'Cadastro de Cliente', section: 'Comercial' },
  { code: 'COM-002', label: 'Contrato', section: 'Comercial' },
  { code: 'COM-003', label: 'Plano', section: 'Comercial' },
  { code: 'COM-004', label: 'Licença', section: 'Comercial' },
  { code: 'COM-005', label: 'Representante', section: 'Comercial' },
  { code: 'COM-006', label: 'Franquia', section: 'Comercial' },
  // Recurso não-menu (ação de botão): só faz sentido "novo" e "remoto".
  { code: 'COM-007', label: 'Desbloquear Cliente', section: 'Comercial', supportedActions: ['create', 'remote'] },
  { code: 'COM-008', label: 'Fornecedor', section: 'Comercial' },

  // Atendimento
  { code: 'ATD-001', label: 'Atendimento', section: 'Atendimento' },
  { code: 'ATD-002', label: 'Chamado', section: 'Atendimento' },
  { code: 'ATD-003', label: 'Solicitação', section: 'Atendimento' },
  { code: 'ATD-004', label: 'Histórico do Cliente', section: 'Atendimento', supportedActions: ['open', 'search', 'report'] },

  // Financeiro
  { code: 'FIN-001', label: 'Contas a Receber', section: 'Financeiro' },
  { code: 'FIN-002', label: 'Contas a Pagar', section: 'Financeiro' },
  { code: 'FIN-003', label: 'Fluxo de Caixa', section: 'Financeiro' },
  { code: 'FIN-004', label: 'Comissão', section: 'Financeiro' },
  { code: 'FIN-005', label: 'Lançamento de Saída de Caixa', section: 'Financeiro' },
  { code: 'FIN-006', label: 'Inadimplência', section: 'Financeiro' },
  { code: 'FIN-007', label: 'Operador de Caixa', section: 'Financeiro' },

  // Administrativo
  { code: 'ADM-001', label: 'Usuário', section: 'Administrativo' },
  { code: 'ADM-002', label: 'Perfil de Usuário', section: 'Administrativo' },
  { code: 'ADM-003', label: 'Funcionário', section: 'Administrativo' },
  { code: 'ADM-004', label: 'Auditoria', section: 'Administrativo', supportedActions: ['open', 'search', 'report', 'chart'] },
  { code: 'ADM-005', label: 'Configurações', section: 'Administrativo', supportedActions: ['open', 'update'] },

  // Conhecimento
  { code: 'CON-001', label: 'Base de Conhecimento', section: 'Conhecimento' },
  { code: 'CON-002', label: 'Documentação', section: 'Conhecimento', supportedActions: ['open', 'search'] },

  // Sistema — Localização (fonte única consumida por todo o sistema; ADR-006).
  { code: 'SIS-001', label: 'País', section: 'Sistema' },
  { code: 'SIS-002', label: 'Estado', section: 'Sistema' },
  { code: 'SIS-003', label: 'Cidade', section: 'Sistema' },
]
