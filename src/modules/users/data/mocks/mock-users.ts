import type { UserJson } from '../../domain/models'
import { grant } from './mock-permission-builder'

/**
 * mock-users — usuários de exemplo cobrindo os cenários da spec: operador
 * limitado/ilimitado/não-operador, remoto on/off, restrição de horário on/off,
 * IP on/off e vínculo de funcionário on/off.
 *
 * TROCA POR API REAL: `RestUsersProvider` → `GET /users`, `GET /users/:id`,
 * `POST/PUT /users`, `DELETE /users/:id`. Contrato JSON idêntico.
 */
const CURATED_USERS: UserJson[] = [
  {
    id: 1,
    login: 'admin',
    name: 'Administrador Noturno',
    email: 'admin@noturno.com.br',
    active: true,
    role: 'admin',
    accessScope: 'global',
    franchiseId: null,
    representativeId: null,
    employeeId: 1001,
    cashOperator: { isOperator: false, type: null, operatorCode: null },
    remote: true,
    accessTimeRestriction: null,
    ipRestriction: null,
    sourceProfileId: 1,
    permissions: [
      grant('ADM-001', 'open', 'search', 'create', 'update', 'delete', 'print', 'report'),
      grant('ADM-002', 'open', 'search', 'create', 'update', 'delete'),
      grant('COM-001', 'open', 'search', 'create', 'update', 'print', 'report', 'remote'),
      grant('COM-007', 'create', 'remote'),
    ],
  },
  {
    id: 2,
    login: 'maria.caixa',
    name: 'Maria Oliveira',
    email: 'maria@noturno.com.br',
    active: true,
    role: 'technician',
    accessScope: 'franchise',
    franchiseId: 10,
    representativeId: null,
    employeeId: 1002,
    // Operador LIMITADO → travado no operatorCode; com restrição de horário.
    cashOperator: { isOperator: true, type: 'limited', operatorCode: '07' },
    remote: false,
    accessTimeRestriction: { start: '08:00', end: '18:00' },
    ipRestriction: null,
    sourceProfileId: 2,
    permissions: [
      grant('FIN-001', 'open', 'search', 'print'),
      grant('FIN-005', 'open', 'create', 'print'),
    ],
  },
  {
    id: 3,
    login: 'joao.atende',
    name: 'João Pereira',
    email: 'joao@noturno.com.br',
    active: true,
    role: 'technician',
    accessScope: 'franchise',
    franchiseId: 10,
    representativeId: null,
    employeeId: null, // sem vínculo de funcionário
    // Operador ILIMITADO → pode ver/escolher qualquer operador.
    cashOperator: { isOperator: true, type: 'unlimited', operatorCode: null },
    remote: false,
    accessTimeRestriction: null,
    ipRestriction: { allowedPublicIps: ['200.150.0.10', '200.150.0.11'] },
    sourceProfileId: 3,
    permissions: [
      grant('ATD-001', 'open', 'search', 'create', 'update'),
      grant('ATD-002', 'open', 'search', 'create', 'update', 'print'),
      grant('COM-007', 'create'),
    ],
  },
  {
    id: 4,
    login: 'ana.franquia',
    name: 'Ana Costa',
    email: 'ana@franquia.com.br',
    active: true,
    role: 'franchisee',
    accessScope: 'franchise',
    franchiseId: 20,
    representativeId: null,
    employeeId: null,
    cashOperator: { isOperator: false, type: null, operatorCode: null },
    remote: false,
    accessTimeRestriction: null,
    ipRestriction: null,
    sourceProfileId: null, // cadastrado sem partir de perfil
    permissions: [
      grant('COM-001', 'open', 'search'),
      grant('FIN-001', 'open', 'search'),
    ],
  },
  {
    id: 5,
    login: 'carlos.rep',
    name: 'Carlos Souza',
    email: 'carlos@rep.com.br',
    active: true,
    role: 'representative',
    accessScope: 'representative',
    franchiseId: null,
    representativeId: 55,
    employeeId: null,
    cashOperator: { isOperator: false, type: null, operatorCode: null },
    // Remoto habilitado → features cross-company (ex.: débitos de cliente de outra loja).
    remote: true,
    accessTimeRestriction: null,
    ipRestriction: null,
    sourceProfileId: null,
    permissions: [
      grant('COM-001', 'open', 'search', 'remote'),
      grant('FIN-004', 'open', 'search', 'report'),
    ],
  },
  {
    id: 6,
    login: 'inativo.teste',
    name: 'Usuário Inativo',
    email: 'inativo@noturno.com.br',
    active: false,
    role: 'customer',
    accessScope: 'customer',
    franchiseId: null,
    representativeId: null,
    employeeId: null,
    cashOperator: { isOperator: false, type: null, operatorCode: null },
    remote: false,
    accessTimeRestriction: null,
    ipRestriction: null,
    sourceProfileId: null,
    permissions: [],
  },
]

/**
 * Preenchimento gerado — volume suficiente para exercitar o **scroll infinito**
 * (ADR-002): com lote de 30, a lista carrega em dois passos. Os 6 usuários
 * curados acima cobrem os cenários de negócio; estes apenas dão massa de dados.
 */
const FILLER_FIRST_NAMES = [
  'Beatriz', 'Rafael', 'Camila', 'Diego', 'Fernanda', 'Gustavo', 'Helena', 'Igor',
  'Juliana', 'Leonardo', 'Mariana', 'Nicolas', 'Patrícia', 'Rodrigo', 'Sabrina',
  'Thiago', 'Vanessa', 'William', 'Bruna', 'Eduardo', 'Larissa', 'Marcelo',
]
const FILLER_LAST_NAMES = [
  'Almeida', 'Barbosa', 'Cardoso', 'Dias', 'Fernandes', 'Gomes', 'Lima', 'Martins',
  'Nunes', 'Pinto', 'Ribeiro', 'Santos', 'Teixeira', 'Vieira',
]
const FILLER_ROLES: UserJson['role'][] = ['admin', 'franchisee', 'representative', 'technician', 'customer']
const FILLER_SCOPES: UserJson['accessScope'][] = ['global', 'franchise', 'representative', 'technician', 'customer']

function makeFillerUsers(count: number, startId: number): UserJson[] {
  return Array.from({ length: count }, (_, i): UserJson => {
    const id = startId + i
    const first = FILLER_FIRST_NAMES[i % FILLER_FIRST_NAMES.length] ?? 'Usuário'
    const last = FILLER_LAST_NAMES[(i * 3 + 1) % FILLER_LAST_NAMES.length] ?? 'Noturno'
    const login = `${first}.${last}`.toLowerCase()
    return {
      id,
      login,
      name: `${first} ${last}`,
      email: `${login}@noturno.com.br`,
      active: i % 7 !== 0, // alguns inativos para variar a situação
      role: FILLER_ROLES[i % FILLER_ROLES.length] ?? 'customer',
      accessScope: FILLER_SCOPES[i % FILLER_SCOPES.length] ?? 'customer',
      franchiseId: i % 2 === 0 ? 10 : null,
      representativeId: null,
      employeeId: null,
      cashOperator: { isOperator: false, type: null, operatorCode: null },
      remote: false,
      accessTimeRestriction: null,
      ipRestriction: null,
      sourceProfileId: null,
      permissions: [],
    }
  })
}

/** Lista mock completa: cenários curados + massa para o scroll infinito. */
export const MOCK_USERS: UserJson[] = [...CURATED_USERS, ...makeFillerUsers(42, 7)]
