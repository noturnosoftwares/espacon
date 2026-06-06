<script setup lang="ts">
/**
 * IndicatorCard — card elegante de um indicador (não-financeiro) do dashboard.
 * Número grande com count-up sutil + label menor. Componente **puro**: recebe o
 * indicador por prop e não conhece a origem dos dados.
 */
import type { OverviewIndicator } from '../../domain/models'
import { overviewIconClass } from './overview-icon'
import CountUpNumber from './count-up-number.vue'

defineProps<{
  indicator: OverviewIndicator
}>()
</script>

<template>
  <div
    class="group flex flex-col gap-2 rounded-xl border border-noturno-grey-light-clean-3 bg-noturno-black-2/70 p-4 transition-colors hover:border-noturno-orange/40"
  >
    <span
      class="flex h-9 w-9 items-center justify-center rounded-lg bg-noturno-black-secondary text-noturno-orange"
      aria-hidden="true"
    >
      <i :class="overviewIconClass(indicator.icon)"></i>
    </span>
    <div class="text-3xl font-semibold leading-none text-noturno-white tabular-nums">
      <CountUpNumber :value="indicator.value" />
    </div>
    <div class="text-xs font-medium uppercase tracking-wide text-noturno-grey-light">
      {{ indicator.label }}
    </div>
  </div>
</template>
