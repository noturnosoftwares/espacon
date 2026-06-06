<script setup lang="ts">
/**
 * DashboardSummary — grade de indicadores não-financeiros do panorama.
 *
 * Componente **puro/dinâmico**: renderiza **qualquer quantidade** de indicadores
 * recebidos por prop (o grid se adapta) e não conhece a origem dos dados.
 */
import type { OverviewIndicator } from '../../domain/models'
import IndicatorCard from './indicator-card.vue'

defineProps<{
  indicators: OverviewIndicator[]
}>()
</script>

<template>
  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
    <IndicatorCard
      v-for="indicator in indicators"
      :key="indicator.id"
      :indicator="indicator"
    />
  </div>
</template>
