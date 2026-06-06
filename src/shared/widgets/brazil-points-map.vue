<script setup lang="ts">
/**
 * BrazilPointsMap — mapa **placeholder leve** do Brasil em SVG (sem lib de mapa).
 *
 * Widget **compartilhado**: desenha um contorno simplificado do Brasil e plota
 * pontos por lat/long usando a **mesma** projeção geográfica → viewBox, o que
 * garante que os pontos caiam sobre o mapa. O raio do ponto cresce com `value`
 * (ex.: usuários ativos). A adoção de uma lib de mapa real exigirá ADR próprio.
 *
 * Componente puro: recebe os pontos por prop e não conhece a origem dos dados.
 */
import { computed } from 'vue'

interface GeoPoint {
  id: string
  latitude: number
  longitude: number
  /** Peso opcional para dimensionar o raio do ponto. */
  value?: number
  /** Rótulo opcional para tooltip. */
  title?: string
}

const props = defineProps<{ points: GeoPoint[] }>()

// Limites geográficos aproximados do território brasileiro.
const LNG_MIN = -74
const LNG_MAX = -34
const LAT_MIN = -34
const LAT_MAX = 5.5
const INSET = 4
const SPAN = 100 - INSET * 2

function projectX(lng: number): number {
  return INSET + ((lng - LNG_MIN) / (LNG_MAX - LNG_MIN)) * SPAN
}
function projectY(lat: number): number {
  return INSET + ((LAT_MAX - lat) / (LAT_MAX - LAT_MIN)) * SPAN
}

// Contorno simplificado do Brasil em [lng, lat] (sentido horário). Estilizado.
const BRAZIL_OUTLINE: ReadonlyArray<[number, number]> = [
  [-60.2, 5.2], [-51.0, 4.1], [-50.0, 0.0], [-44.0, -2.5], [-38.5, -3.7],
  [-35.0, -5.8], [-34.8, -8.0], [-37.0, -11.0], [-39.0, -15.0], [-40.8, -20.3],
  [-43.0, -23.0], [-48.0, -25.5], [-50.0, -29.0], [-52.3, -33.0], [-57.6, -30.2],
  [-57.0, -27.0], [-55.0, -24.0], [-58.0, -20.0], [-58.0, -16.0], [-60.0, -13.5],
  [-65.0, -11.0], [-70.0, -11.0], [-73.8, -7.5], [-70.0, -4.0], [-69.5, -1.0],
  [-67.0, 1.0], [-64.0, 1.9],
]

const outlinePath = computed(() => {
  const pts = BRAZIL_OUTLINE.map(
    ([lng, lat]) => `${projectX(lng).toFixed(2)},${projectY(lat).toFixed(2)}`,
  )
  return `M${pts.join(' L')} Z`
})

function radiusFor(value: number | undefined): number {
  if (value === undefined) return 1.4
  return 0.9 + Math.sqrt(Math.max(value, 0)) / 7
}

const plotted = computed(() =>
  props.points.map((p) => ({
    key: p.id,
    cx: projectX(p.longitude),
    cy: projectY(p.latitude),
    r: radiusFor(p.value),
    title: p.title ?? '',
  })),
)
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    class="h-full w-full"
    role="img"
    aria-label="Mapa de pontos no Brasil"
    preserveAspectRatio="xMidYMid meet"
  >
    <path
      :d="outlinePath"
      fill="var(--color-noturno-black-2)"
      stroke="var(--color-noturno-grey-light-clean-3)"
      stroke-width="0.5"
      stroke-linejoin="round"
    />
    <g>
      <circle
        v-for="p in plotted"
        :key="p.key"
        :cx="p.cx"
        :cy="p.cy"
        :r="p.r"
        fill="var(--color-noturno-orange)"
        fill-opacity="0.8"
        stroke="var(--color-noturno-orange-dark)"
        stroke-width="0.25"
      >
        <title v-if="p.title">{{ p.title }}</title>
      </circle>
    </g>
  </svg>
</template>
