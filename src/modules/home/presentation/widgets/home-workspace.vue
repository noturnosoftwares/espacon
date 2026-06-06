<script setup lang="ts">
/**
 * HomeWorkspace — área central da Home: o **painel inicial** (dashboard).
 *
 * Container: carrega o dashboard via `useHomeStore` (mock → `GET /home/dashboard`)
 * e distribui cada bloco para componentes puros (KPIs, Favoritos, Acessos,
 * Pendências, Atividades, Status da Rede). Trata loading e erro. A saudação é
 * independente (vem da sessão) e aparece sempre.
 */
import { onMounted } from 'vue'
import { useHomeStore } from '../stores/home-store'
import DashboardGreeting from './dashboard-greeting.vue'
import KpiCard from './kpi-card.vue'
import FavoritesCard from './favorites-card.vue'
import RecentAccessCard from './recent-access-card.vue'
import PendingsCard from './pendings-card.vue'
import ActivitiesCard from './activities-card.vue'
import NetworkStatusCard from './network-status-card.vue'

const store = useHomeStore()

onMounted(() => {
  void store.load()
})
</script>

<template>
  <div class="scrollbar-noturno flex-1 overflow-y-auto p-5 lg:p-8">
    <div class="mx-auto flex max-w-[1500px] flex-col gap-6">
      <DashboardGreeting />

      <!-- Loading -->
      <div
        v-if="store.loading"
        class="flex flex-col items-center justify-center gap-3 py-24 text-noturno-grey-light"
      >
        <i class="pi pi-spinner animate-spin text-2xl" aria-hidden="true"></i>
        <span class="text-sm">Carregando painel…</span>
      </div>

      <!-- Erro -->
      <div
        v-else-if="store.hasError"
        class="flex flex-col items-center justify-center gap-2 py-24 text-center text-noturno-grey-light"
      >
        <i class="pi pi-cloud text-2xl" aria-hidden="true"></i>
        <p class="text-sm">{{ store.errorMessage ?? 'Não foi possível carregar o painel.' }}</p>
        <button
          type="button"
          class="text-sm text-noturno-orange transition-colors hover:text-noturno-orange-dark outline-none focus-visible:underline"
          @click="store.load()"
        >
          Tentar novamente
        </button>
      </div>

      <!-- Conteúdo -->
      <template v-else>
        <!-- KPIs -->
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
          <KpiCard v-for="kpi in store.kpis" :key="kpi.id" :indicator="kpi" />
        </div>

        <!-- Favoritos / Acessos / Pendências -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <FavoritesCard :favorites="store.favorites" />
          <RecentAccessCard :items="store.recentAccesses" />
          <PendingsCard :items="store.pendings" />
        </div>

        <!-- Atividades / Status da Rede -->
        <div class="grid grid-cols-1 gap-4 lg:grid-cols-[1.5fr_1fr]">
          <ActivitiesCard :items="store.activities" />
          <NetworkStatusCard :network="store.network" />
        </div>
      </template>
    </div>
  </div>
</template>
