import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBaseStore } from '@/shared/stores'
import type {
  ActivityItem,
  FavoriteShortcut,
  KpiIndicator,
  NetworkStatus,
  PendingItem,
  RecentAccess,
} from '../../domain/models'
import { makeGetHomeDashboardUseCase } from '../../data/application'

/**
 * useHomeStore — estado do painel inicial (Home autenticada).
 *
 * Estende `useBaseStore`. Carrega o dashboard (`GET /home/dashboard`, mock nesta
 * fase) e expõe cada bloco como array dinâmico — a UI renderiza qualquer
 * quantidade recebida. Em falha, popula `errorMessage` (estado de erro tratado
 * na tela). Os componentes de exibição não conhecem a origem dos dados.
 */
export const useHomeStore = defineStore('home', () => {
  const base = useBaseStore()
  const getDashboard = makeGetHomeDashboardUseCase()

  const kpis = ref<KpiIndicator[]>([])
  const favorites = ref<FavoriteShortcut[]>([])
  const recentAccesses = ref<RecentAccess[]>([])
  const pendings = ref<PendingItem[]>([])
  const activities = ref<ActivityItem[]>([])
  const network = ref<NetworkStatus>({ points: [], stats: [] })

  async function load(): Promise<void> {
    const dashboard = await base.run(() => getDashboard())
    if (dashboard) {
      kpis.value = dashboard.kpis
      favorites.value = dashboard.favorites
      recentAccesses.value = dashboard.recentAccesses
      pendings.value = dashboard.pendings
      activities.value = dashboard.activities
      network.value = dashboard.network
      base.markInitialized()
    }
  }

  return {
    ...base,
    kpis,
    favorites,
    recentAccesses,
    pendings,
    activities,
    network,
    load,
  }
})
