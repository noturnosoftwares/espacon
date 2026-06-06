<script setup lang="ts">
/**
 * KpiCard — card de um indicador (KPI) do topo do painel: ícone com acento,
 * número grande, rótulo e tendência. Componente puro (recebe o indicador).
 */
import type { KpiIndicator } from '../../domain/models'
import { accentChipClass, iconClass, trendTextClass } from './dashboard-ui'

const props = defineProps<{ indicator: KpiIndicator }>()

const formattedValue = props.indicator.value.toLocaleString('pt-BR')
</script>

<template>
  <div
    class="flex items-start gap-3 rounded-2xl border border-noturno-grey-light-clean-3 bg-noturno-black-secondary p-4"
  >
    <span
      class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
      :class="accentChipClass(indicator.accent)"
    >
      <i :class="iconClass(indicator.icon)" class="text-xl" aria-hidden="true"></i>
    </span>
    <div class="min-w-0">
      <div class="text-2xl font-bold leading-tight text-noturno-white tabular-nums">
        {{ formattedValue }}
      </div>
      <div class="text-xs text-noturno-grey-light">{{ indicator.label }}</div>
      <div
        v-if="indicator.trend"
        class="mt-1 text-xs font-medium"
        :class="trendTextClass(indicator.trendTone)"
      >
        {{ indicator.trend }}
      </div>
    </div>
  </div>
</template>
