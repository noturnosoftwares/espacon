<script setup lang="ts">
/**
 * NetworkStatusCard — status da rede Noturno: mapa discreto de pontos de atuação
 * (widget compartilhado `BrazilPointsMap`) + legenda de indicadores agregados.
 * Componente puro (recebe `network` por prop).
 */
import { computed } from 'vue'
import type { NetworkStatus } from '../../domain/models'
import BrazilPointsMap from '@/shared/widgets/brazil-points-map.vue'
import DashboardCard from './dashboard-card.vue'
import { iconClass } from './dashboard-ui'

const props = defineProps<{ network: NetworkStatus }>()

const geoPoints = computed(() =>
  props.network.points.map((p) => ({
    id: p.id,
    latitude: p.latitude,
    longitude: p.longitude,
    value: p.activeUsers,
    title: `${p.city}/${p.state} — ${p.activeUsers} ativos`,
  })),
)
</script>

<template>
  <DashboardCard title="Status da Rede Noturno" icon="globe" icon-color="text-info">
    <div class="grid grid-cols-1 items-center gap-4 sm:grid-cols-[1.4fr_1fr]">
      <div class="h-48 overflow-hidden rounded-xl border border-line bg-surface-1/50">
        <BrazilPointsMap :points="geoPoints" />
      </div>

      <ul class="flex flex-col gap-3">
        <li v-for="stat in network.stats" :key="stat.id" class="flex items-center gap-3">
          <span
            class="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-1 text-content-muted"
          >
            <i :class="iconClass(stat.icon)" class="text-sm" aria-hidden="true"></i>
          </span>
          <div class="leading-tight">
            <div class="text-lg font-bold text-content tabular-nums">
              {{ stat.value.toLocaleString('pt-BR') }}
            </div>
            <div class="text-xs text-content-muted">{{ stat.label }}</div>
          </div>
        </li>
      </ul>
    </div>

    <template #footer>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-content-muted transition-colors hover:text-accent"
      >
        Ver mapa completo <i class="pi pi-angle-right text-[0.65rem]" aria-hidden="true"></i>
      </button>
    </template>
  </DashboardCard>
</template>
