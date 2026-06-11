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
    class="group flex flex-col gap-2 rounded-xl border border-line bg-surface-1/70 p-4 transition-colors hover:border-accent/40"
  >
    <span
      class="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-canvas text-accent"
      aria-hidden="true"
    >
      <i :class="overviewIconClass(indicator.icon)"></i>
    </span>
    <div class="text-3xl font-semibold leading-none text-content tabular-nums">
      <CountUpNumber :value="indicator.value" />
    </div>
    <div class="text-xs font-medium uppercase tracking-wide text-content-muted">
      {{ indicator.label }}
    </div>
  </div>
</template>
