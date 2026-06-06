/**
 * HomeDashboard — dados do painel inicial (Home autenticada).
 *
 * Contrato-alvo do endpoint futuro **`GET /home/dashboard`** (mock-first nesta
 * fase). São indicadores **operacionais/não-financeiros de gestão** da rede;
 * nenhum dado fica fixo nos componentes (vem deste contrato → mock → API).
 *
 * Models em inglês (padrão corporativo), imutáveis, com `fromJson`. `icon` e
 * `accent` são **chaves semânticas** mapeadas para o Design System na presentation
 * (ver `presentation/widgets/dashboard-ui.ts`) — mantém o contrato livre de CSS.
 */

/** Cores de acento permitidas — todas na paleta oficial da Noturno. */
export type AccentTone = 'orange' | 'blue' | 'blueLight' | 'green' | 'yellow' | 'red'

/** Tom do indicador de tendência do KPI. */
export type TrendTone = 'positive' | 'critical' | 'neutral'

/** Categoria de negócio (badge/legenda). */
export type BusinessCategory = 'atendimento' | 'sistema' | 'financeiro' | 'pessoal' | 'comercial'

/** Indicador (KPI) do topo do dashboard. */
export interface KpiIndicator {
  id: string
  label: string
  value: number
  icon: string
  accent: AccentTone
  /** Texto curto de tendência (ex.: "+12 nas últimas 24h"); opcional. */
  trend?: string
  trendTone: TrendTone
}

/** Atalho favorito do usuário. */
export interface FavoriteShortcut {
  id: string
  label: string
  icon: string
  /** Rota de destino quando o módulo existir; ausente = inerte ("em breve"). */
  route?: string
}

/** Registro de acesso recente. */
export interface RecentAccess {
  id: string
  title: string
  category: BusinessCategory
  icon: string
  /** Tempo relativo já formatado pelo backend/mock (ex.: "há 8 min"). */
  timeAgo: string
}

/** Pendência operacional com contador. */
export interface PendingItem {
  id: string
  label: string
  icon: string
  count: number
  tone: AccentTone
}

/** Atividade recente da rede. */
export interface ActivityItem {
  id: string
  text: string
  category: BusinessCategory
  timeAgo: string
}

/** Ponto da rede no mapa (agregado por cidade). */
export interface NetworkPoint {
  id: string
  city: string
  state: string
  latitude: number
  longitude: number
  activeUsers: number
}

/** Indicador resumido do status da rede (legenda do mapa). */
export interface NetworkStat {
  id: string
  label: string
  value: number
  icon: string
}

export interface NetworkStatus {
  points: NetworkPoint[]
  stats: NetworkStat[]
}

export interface HomeDashboard {
  kpis: KpiIndicator[]
  favorites: FavoriteShortcut[]
  recentAccesses: RecentAccess[]
  pendings: PendingItem[]
  activities: ActivityItem[]
  network: NetworkStatus
}

// ---------------------------------------------------------------------------
// Contratos JSON (mock-first; alvo de `GET /home/dashboard`)
// ---------------------------------------------------------------------------

export interface HomeDashboardJson {
  kpis: Array<{
    id: string
    label: string
    value: number
    icon: string
    accent: string
    trend?: string
    trendTone: string
  }>
  favorites: Array<{ id: string; label: string; icon: string; route?: string }>
  recentAccesses: Array<{ id: string; title: string; category: string; icon: string; timeAgo: string }>
  pendings: Array<{ id: string; label: string; icon: string; count: number; tone: string }>
  activities: Array<{ id: string; text: string; category: string; timeAgo: string }>
  network: {
    points: Array<{
      id: string
      city: string
      state: string
      latitude: number
      longitude: number
      activeUsers: number
    }>
    stats: Array<{ id: string; label: string; value: number; icon: string }>
  }
}

const ACCENTS: readonly AccentTone[] = ['orange', 'blue', 'blueLight', 'green', 'yellow', 'red']
const TREND_TONES: readonly TrendTone[] = ['positive', 'critical', 'neutral']
const CATEGORIES: readonly BusinessCategory[] = [
  'atendimento',
  'sistema',
  'financeiro',
  'pessoal',
  'comercial',
]

function toAccent(value: string): AccentTone {
  return (ACCENTS as readonly string[]).includes(value) ? (value as AccentTone) : 'orange'
}
function toTrendTone(value: string): TrendTone {
  return (TREND_TONES as readonly string[]).includes(value) ? (value as TrendTone) : 'neutral'
}
function toCategory(value: string): BusinessCategory {
  return (CATEGORIES as readonly string[]).includes(value) ? (value as BusinessCategory) : 'sistema'
}

export function homeDashboardFromJson(json: HomeDashboardJson): HomeDashboard {
  return {
    kpis: json.kpis.map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      icon: k.icon,
      accent: toAccent(k.accent),
      trend: k.trend,
      trendTone: toTrendTone(k.trendTone),
    })),
    favorites: json.favorites.map((f) => ({
      id: f.id,
      label: f.label,
      icon: f.icon,
      route: f.route,
    })),
    recentAccesses: json.recentAccesses.map((r) => ({
      id: r.id,
      title: r.title,
      category: toCategory(r.category),
      icon: r.icon,
      timeAgo: r.timeAgo,
    })),
    pendings: json.pendings.map((p) => ({
      id: p.id,
      label: p.label,
      icon: p.icon,
      count: p.count,
      tone: toAccent(p.tone),
    })),
    activities: json.activities.map((a) => ({
      id: a.id,
      text: a.text,
      category: toCategory(a.category),
      timeAgo: a.timeAgo,
    })),
    network: {
      points: json.network.points.map((pt) => ({
        id: pt.id,
        city: pt.city,
        state: pt.state,
        latitude: pt.latitude,
        longitude: pt.longitude,
        activeUsers: pt.activeUsers,
      })),
      stats: json.network.stats.map((s) => ({
        id: s.id,
        label: s.label,
        value: s.value,
        icon: s.icon,
      })),
    },
  }
}
