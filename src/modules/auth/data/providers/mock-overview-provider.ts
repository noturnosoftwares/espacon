import type { LoginOverviewJson } from '../../domain/models'

/**
 * MockOverviewProvider — provider do panorama público do login na fase mock-first
 * (ADR-001). Devolve o **JSON exato** do contrato-alvo de
 * `GET /public/login-overview`, com dados fictícios porém realistas e **somente
 * não-financeiros** (ver ADR-007).
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │ TROCA POR API REAL: substitua este provider por um `RestOverviewProvider`  │
 * │ que chame `httpClient.get('/public/login-overview')` e retorne o body.     │
 * │ O contrato JSON é idêntico — repository, usecase, store e widgets não mudam.│
 * └──────────────────────────────────────────────────────────────────────────┘
 *
 * Nenhum dado visual fica fixo nos componentes: tudo nasce aqui (mock) e, no
 * futuro, virá da API.
 */
const MOCK_LATENCY_MS = 600

/**
 * Resposta mock — espelha o contrato `GET /public/login-overview`.
 * Indicadores são **dinâmicos**: adicionar/remover itens aqui reflete na UI sem
 * alterar componente. Idem para `map` e `apps`.
 */
const MOCK_OVERVIEW: LoginOverviewJson = {
  dashboard: [
    { id: 'online_users', label: 'Usuários online', value: 128, icon: 'users' },
    { id: 'active_clients', label: 'Clientes ativos', value: 1432, icon: 'building' },
    { id: 'cities', label: 'Cidades', value: 47, icon: 'map-pin' },
    { id: 'states', label: 'Estados', value: 9, icon: 'map' },
    { id: 'franchisees', label: 'Franqueados', value: 14, icon: 'briefcase' },
    { id: 'active_systems', label: 'Sistemas ativos', value: 5, icon: 'th-large' },
    { id: 'open_tickets', label: 'Chamados em atendimento', value: 23, icon: 'inbox' },
  ],
  map: [
    { id: 'rr-boa-vista', city: 'Boa Vista', state: 'RR', latitude: 2.8235, longitude: -60.6758, activeUsers: 12 },
    { id: 'sp-sao-paulo', city: 'São Paulo', state: 'SP', latitude: -23.5505, longitude: -46.6333, activeUsers: 312 },
    { id: 'rj-rio', city: 'Rio de Janeiro', state: 'RJ', latitude: -22.9068, longitude: -43.1729, activeUsers: 145 },
    { id: 'mg-bh', city: 'Belo Horizonte', state: 'MG', latitude: -19.9167, longitude: -43.9345, activeUsers: 98 },
    { id: 'pr-curitiba', city: 'Curitiba', state: 'PR', latitude: -25.4284, longitude: -49.2733, activeUsers: 76 },
    { id: 'rs-poa', city: 'Porto Alegre', state: 'RS', latitude: -30.0346, longitude: -51.2177, activeUsers: 71 },
    { id: 'df-brasilia', city: 'Brasília', state: 'DF', latitude: -15.7939, longitude: -47.8828, activeUsers: 64 },
    { id: 'ba-salvador', city: 'Salvador', state: 'BA', latitude: -12.9777, longitude: -38.5016, activeUsers: 58 },
    { id: 'pe-recife', city: 'Recife', state: 'PE', latitude: -8.0476, longitude: -34.877, activeUsers: 49 },
    { id: 'ce-fortaleza', city: 'Fortaleza', state: 'CE', latitude: -3.7319, longitude: -38.5267, activeUsers: 41 },
    { id: 'am-manaus', city: 'Manaus', state: 'AM', latitude: -3.119, longitude: -60.0217, activeUsers: 27 },
  ],
  apps: [
    { id: 'doctorcar', name: 'DoctorCar', description: 'Gestão para auto centers', icon: 'car', status: 'active' },
    { id: 'sales', name: 'Sales', description: 'Força de vendas', icon: 'shopping-bag', status: 'active' },
    { id: 'stock', name: 'Stock', description: 'Gestão de estoque e WMS', icon: 'boxes', status: 'active' },
    { id: 'zw', name: 'ZW', description: 'Comunicação corporativa', icon: 'message-circle', status: 'active' },
    { id: 'delivery', name: 'Delivery', description: 'Controle de entregas', icon: 'truck', status: 'active' },
  ],
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export class MockOverviewProvider {
  async getOverview(): Promise<LoginOverviewJson> {
    await delay(MOCK_LATENCY_MS)
    return MOCK_OVERVIEW
  }
}
