import type { UserProfileJson } from '../../domain/models'
import { grant } from './mock-permission-builder'

/**
 * mock-user-profiles — perfis (modelos de cadastro) na fase mock-first.
 *
 * Lembrete da regra: o perfil **não concede acesso** — ao ser selecionado, suas
 * permissões apenas **redefinem** as ações do usuário (ver `applyProfileToUser`).
 *
 * TROCA POR API REAL: `RestUserProfilesProvider` → `GET /user-profiles`.
 */
const CURATED_USER_PROFILES: UserProfileJson[] = [
  {
    id: 1,
    description: 'Administrativo',
    permissions: [
      grant('ADM-001', 'open', 'search', 'create', 'update', 'delete', 'print', 'report'),
      grant('ADM-002', 'open', 'search', 'create', 'update', 'delete'),
      grant('ADM-003', 'open', 'search', 'create', 'update'),
      grant('ADM-004', 'open', 'search', 'report', 'chart'),
      grant('ADM-005', 'open', 'update'),
      grant('COM-001', 'open', 'search', 'create', 'update', 'print', 'report'),
      grant('COM-002', 'open', 'search', 'print'),
    ],
  },
  {
    id: 2,
    description: 'Caixa',
    permissions: [
      grant('FIN-001', 'open', 'search', 'print'),
      grant('FIN-002', 'open', 'search'),
      grant('FIN-003', 'open', 'search', 'report'),
      grant('FIN-005', 'open', 'create', 'print'),
    ],
  },
  {
    id: 3,
    description: 'Atendimento',
    permissions: [
      grant('ATD-001', 'open', 'search', 'create', 'update'),
      grant('ATD-002', 'open', 'search', 'create', 'update', 'print'),
      grant('ATD-003', 'open', 'search', 'create'),
      grant('ATD-004', 'open', 'search', 'report'),
      grant('COM-001', 'open', 'search'),
      grant('COM-007', 'create'),
    ],
  },
]

/**
 * Preenchimento gerado — volume suficiente para exercitar o **scroll infinito**
 * (ADR-002). Os 3 perfis curados acima cobrem os modelos reais; estes apenas dão
 * massa de dados, com contagens de recursos variadas.
 */
const FILLER_PROFILE_NAMES = [
  'Financeiro', 'Comercial', 'Suporte N1', 'Suporte N2', 'Cobrança', 'Estoque',
  'Compras', 'Logística', 'Marketing', 'RH', 'Auditoria', 'Diretoria',
  'Franqueado', 'Representante', 'Técnico de Campo', 'Recepção', 'Faturamento',
  'Contabilidade', 'Jurídico', 'TI', 'Qualidade', 'Treinamento', 'Pós-venda',
  'Televendas', 'Expedição', 'Almoxarifado', 'Manutenção', 'Projetos',
  'Atendimento Premium', 'Consultoria',
]
const FILLER_CODES = ['ADM-001', 'ADM-002', 'COM-001', 'COM-002', 'FIN-001', 'FIN-003', 'ATD-001', 'ATD-002']

function makeFillerProfiles(startId: number): UserProfileJson[] {
  return FILLER_PROFILE_NAMES.map((description, i) => {
    const count = (i % 4) + 1 // 1 a 4 recursos
    const permissions = Array.from({ length: count }, (_, j) =>
      grant(FILLER_CODES[(i + j) % FILLER_CODES.length] ?? 'ADM-001', 'open', 'search'),
    )
    return { id: startId + i, description, permissions }
  })
}

/** Lista mock completa: perfis curados + massa para o scroll infinito. */
export const MOCK_USER_PROFILES: UserProfileJson[] = [
  ...CURATED_USER_PROFILES,
  ...makeFillerProfiles(4),
]
