<script setup lang="ts">
/**
 * MapPreview — mapa discreto de pontos de atuação na vitrine do login.
 *
 * Fino wrapper sobre o widget compartilhado `BrazilPointsMap`: adapta os
 * `ClientCluster`/pontos da vitrine (agregados por cidade, ver ADR-007) para o
 * formato genérico do mapa. Componente puro (recebe `points` por prop).
 */
import { computed } from 'vue'
import type { OverviewMapPoint } from '../../domain/models'
import BrazilPointsMap from '@/shared/widgets/brazil-points-map.vue'

const props = defineProps<{ points: OverviewMapPoint[] }>()

const geoPoints = computed(() =>
  props.points.map((p) => ({
    id: p.id,
    latitude: p.latitude,
    longitude: p.longitude,
    value: p.activeUsers,
    title: `${p.city}/${p.state} — ${p.activeUsers} ativos`,
  })),
)
</script>

<template>
  <BrazilPointsMap :points="geoPoints" />
</template>
