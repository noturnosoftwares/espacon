/**
 * LoginOverview — panorama institucional **público** exibido ao lado do login
 * (ver ADR-007). Contrato-alvo do endpoint futuro:
 *
 *   GET /public/login-overview
 *
 * Recorte público/agregado/anonimizado, **sem dados financeiros** e sem
 * identificar cliente: indicadores de rede (usuários online, clientes ativos,
 * cidades, estados, franqueados, sistemas, chamados…), pontos de atuação no mapa
 * (agregados por cidade) e o ecossistema de produtos da Noturno.
 *
 * Models imutáveis, em inglês (padrão corporativo), com `fromJson` — a tela só
 * consome estes dados. A estrutura é **genérica e dinâmica**: o dashboard aceita
 * qualquer quantidade de indicadores e a lista de apps cresce sem alterar a UI.
 */

/** Indicador genérico do dashboard (não-financeiro). */
export interface OverviewIndicator {
  /** Chave estável do indicador (ex.: `online_users`). */
  id: string
  /** Rótulo amigável (ex.: "Usuários online"). */
  label: string
  /** Valor numérico agregado. */
  value: number
  /** Chave semântica de ícone (ex.: `users`); a UI a mapeia para o Design System. */
  icon: string
}

/** Ponto de atuação no mapa (agregado por cidade — sem dado de cliente). */
export interface OverviewMapPoint {
  id: string
  city: string
  state: string
  latitude: number
  longitude: number
  activeUsers: number
}

export type AppStatus = 'active' | 'inactive' | 'soon'

/** Produto do ecossistema Noturno. */
export interface OverviewApp {
  id: string
  name: string
  description: string
  /** Chave semântica de ícone (ex.: `car`); mapeada para o Design System na UI. */
  icon: string
  status: AppStatus
}

export interface LoginOverview {
  dashboard: OverviewIndicator[]
  map: OverviewMapPoint[]
  apps: OverviewApp[]
}

// ---------------------------------------------------------------------------
// Contratos JSON do endpoint `GET /public/login-overview` (mock-first → REST)
// ---------------------------------------------------------------------------

export interface OverviewIndicatorJson {
  id: string
  label: string
  value: number
  icon: string
}

export interface OverviewMapPointJson {
  id: string
  city: string
  state: string
  latitude: number
  longitude: number
  activeUsers: number
}

export interface OverviewAppJson {
  id: string
  name: string
  description: string
  icon: string
  status: string
}

export interface LoginOverviewJson {
  dashboard: OverviewIndicatorJson[]
  map: OverviewMapPointJson[]
  apps: OverviewAppJson[]
}

const APP_STATUSES: readonly AppStatus[] = ['active', 'inactive', 'soon']

function toAppStatus(value: string): AppStatus {
  return (APP_STATUSES as readonly string[]).includes(value) ? (value as AppStatus) : 'inactive'
}

export function loginOverviewFromJson(json: LoginOverviewJson): LoginOverview {
  return {
    dashboard: (json.dashboard ?? []).map((item) => ({
      id: item.id,
      label: item.label,
      value: item.value,
      icon: item.icon,
    })),
    map: (json.map ?? []).map((point) => ({
      id: point.id,
      city: point.city,
      state: point.state,
      latitude: point.latitude,
      longitude: point.longitude,
      activeUsers: point.activeUsers,
    })),
    apps: (json.apps ?? []).map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description,
      icon: app.icon,
      status: toAppStatus(app.status),
    })),
  }
}
