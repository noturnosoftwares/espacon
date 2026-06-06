import type { HomeDashboardJson } from '../../domain/models'

/**
 * mock-home-dashboard — payload mock do painel inicial, espelhando o contrato
 * de `GET /home/dashboard`. Apenas dados **operacionais/não-financeiros**.
 *
 * Editar este arquivo reflete na UI sem tocar em componentes. Para trocar pelo
 * backend real, ver `MockHomeProvider`.
 */
export const MOCK_HOME_DASHBOARD: HomeDashboardJson = {
  kpis: [
    { id: 'online_users', label: 'Usuários online', value: 128, icon: 'users', accent: 'orange', trend: '+12 nas últimas 24h', trendTone: 'positive' },
    { id: 'active_clients', label: 'Clientes ativos', value: 1432, icon: 'building', accent: 'blue', trend: '+21 este mês', trendTone: 'positive' },
    { id: 'active_licenses', label: 'Licenças ativas', value: 2189, icon: 'file', accent: 'blueLight', trend: '+45 este mês', trendTone: 'positive' },
    { id: 'open_tickets', label: 'Chamados abertos', value: 47, icon: 'headphones', accent: 'green', trend: '8 críticos', trendTone: 'critical' },
    { id: 'expiring_contracts', label: 'Contratos vencendo', value: 23, icon: 'calendar', accent: 'yellow', trend: 'nos próximos 30 dias', trendTone: 'neutral' },
  ],
  favorites: [
    { id: 'cadastro-cliente', label: 'Cadastro de Cliente', icon: 'user-plus' },
    { id: 'contas-a-receber', label: 'Contas a Receber', icon: 'dollar' },
    { id: 'chamados', label: 'Chamados', icon: 'headphones' },
    { id: 'funcionarios', label: 'Funcionários', icon: 'user' },
    { id: 'contas-a-pagar', label: 'Contas a Pagar', icon: 'file' },
    { id: 'relatorios', label: 'Relatórios', icon: 'chart-bar' },
    { id: 'agenda-telefonica', label: 'Agenda Telefônica', icon: 'phone' },
    { id: 'enviar-contrato', label: 'Enviar Contrato', icon: 'send' },
  ],
  recentAccesses: [
    { id: 'ra-1', title: 'Cliente XPTO Ltda', category: 'atendimento', icon: 'user', timeAgo: 'há 8 min' },
    { id: 'ra-2', title: 'Contrato #CT-2025/043', category: 'sistema', icon: 'file', timeAgo: 'há 32 min' },
    { id: 'ra-3', title: 'Licença #LIC-78291', category: 'sistema', icon: 'file', timeAgo: 'há 1 hora' },
    { id: 'ra-4', title: 'Chamado #100845', category: 'atendimento', icon: 'headphones', timeAgo: 'há 2 horas' },
    { id: 'ra-5', title: 'Recibo #RC-55221', category: 'financeiro', icon: 'receipt', timeAgo: 'há 3 horas' },
  ],
  pendings: [
    { id: 'pd-1', label: 'Chamados aguardando retorno', icon: 'headphones', count: 12, tone: 'red' },
    { id: 'pd-2', label: 'Licenças vencendo em 7 dias', icon: 'calendar', count: 15, tone: 'yellow' },
    { id: 'pd-3', label: 'Contratos vencendo em 30 dias', icon: 'calendar', count: 23, tone: 'orange' },
    { id: 'pd-4', label: 'Atualizações disponíveis', icon: 'info-circle', count: 3, tone: 'blue' },
    { id: 'pd-5', label: 'Contas a receber em atraso', icon: 'money-bill', count: 8, tone: 'red' },
  ],
  activities: [
    { id: 'ac-1', text: 'Novo chamado #100921 foi aberto por Cliente ABC Ltda', category: 'atendimento', timeAgo: 'há 12 min' },
    { id: 'ac-2', text: 'Licença #LIC-78291 foi renovada', category: 'sistema', timeAgo: 'há 1 hora' },
    { id: 'ac-3', text: 'Pagamento recebido de Cliente XYZ Ltda', category: 'financeiro', timeAgo: 'há 4 horas' },
    { id: 'ac-4', text: 'Novo funcionário cadastrado: João Silva', category: 'pessoal', timeAgo: 'há 6 horas' },
    { id: 'ac-5', text: 'Contrato #CT-2025/040 foi assinado', category: 'sistema', timeAgo: 'há 3 dias' },
  ],
  network: {
    points: [
      { id: 'rr-boa-vista', city: 'Boa Vista', state: 'RR', latitude: 2.8235, longitude: -60.6758, activeUsers: 12 },
      { id: 'am-manaus', city: 'Manaus', state: 'AM', latitude: -3.119, longitude: -60.0217, activeUsers: 27 },
      { id: 'ce-fortaleza', city: 'Fortaleza', state: 'CE', latitude: -3.7319, longitude: -38.5267, activeUsers: 41 },
      { id: 'pe-recife', city: 'Recife', state: 'PE', latitude: -8.0476, longitude: -34.877, activeUsers: 49 },
      { id: 'ba-salvador', city: 'Salvador', state: 'BA', latitude: -12.9777, longitude: -38.5016, activeUsers: 58 },
      { id: 'df-brasilia', city: 'Brasília', state: 'DF', latitude: -15.7939, longitude: -47.8828, activeUsers: 64 },
      { id: 'mg-bh', city: 'Belo Horizonte', state: 'MG', latitude: -19.9167, longitude: -43.9345, activeUsers: 98 },
      { id: 'rj-rio', city: 'Rio de Janeiro', state: 'RJ', latitude: -22.9068, longitude: -43.1729, activeUsers: 145 },
      { id: 'sp-sao-paulo', city: 'São Paulo', state: 'SP', latitude: -23.5505, longitude: -46.6333, activeUsers: 312 },
      { id: 'pr-curitiba', city: 'Curitiba', state: 'PR', latitude: -25.4284, longitude: -49.2733, activeUsers: 76 },
      { id: 'rs-poa', city: 'Porto Alegre', state: 'RS', latitude: -30.0346, longitude: -51.2177, activeUsers: 71 },
    ],
    stats: [
      { id: 'cities', label: 'Cidades atendidas', value: 47, icon: 'map-marker' },
      { id: 'states', label: 'Estados', value: 9, icon: 'map' },
      { id: 'franchisees', label: 'Franqueados ativos', value: 23, icon: 'briefcase' },
      { id: 'online_users', label: 'Usuários online', value: 128, icon: 'users' },
    ],
  },
}
