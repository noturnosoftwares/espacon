import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useBaseStore } from '@/shared/stores'
import type { OverviewApp, OverviewIndicator, OverviewMapPoint } from '../../domain/models'
import { makeGetLoginOverviewUseCase } from '../../data/application'

/**
 * useLoginOverviewStore — panorama público do login (painel direito).
 *
 * Carrega em paralelo ao formulário e **nunca** bloqueia o login: em falha apenas
 * popula `errorMessage` (herdado do BaseStore) e a UI mostra estado discreto
 * (ver ADR-007). Separada da `useAuthStore` para não acoplar a vitrine à ação.
 *
 * Expõe os três blocos do contrato como arrays dinâmicos — a UI renderiza
 * qualquer quantidade de indicadores/pontos/apps recebida.
 */
export const useLoginOverviewStore = defineStore('login-overview', () => {
  const base = useBaseStore()
  const getOverview = makeGetLoginOverviewUseCase()

  const dashboard = ref<OverviewIndicator[]>([])
  const map = ref<OverviewMapPoint[]>([])
  const apps = ref<OverviewApp[]>([])

  /** Carrega o panorama público (`GET /public/login-overview`). */
  async function load(): Promise<void> {
    const overview = await base.run(() => getOverview())
    if (overview) {
      dashboard.value = overview.dashboard
      map.value = overview.map
      apps.value = overview.apps
      base.markInitialized()
    }
  }

  return {
    ...base,
    dashboard,
    map,
    apps,
    load,
  }
})
