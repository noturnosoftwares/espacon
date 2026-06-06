<script setup lang="ts">
/**
 * CountUpNumber — microinteração flat: anima um contador de 0 até o valor alvo
 * ao montar/quando o valor muda. Respeita `prefers-reduced-motion` (mostra o
 * valor final sem animar). Formata em pt-BR (ex.: 1.432).
 *
 * Widget específico do módulo auth (vitrine do login). Estado local apenas —
 * sem regra de negócio (ver template: estado local para visual simples).
 */
import { onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    value: number
    durationMs?: number
  }>(),
  { durationMs: 1200 },
)

const display = ref(0)
let frameId: number | null = null

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** easeOutCubic — desaceleração suave no fim da contagem. */
function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

function cancel(): void {
  if (frameId !== null) {
    cancelAnimationFrame(frameId)
    frameId = null
  }
}

function animateTo(target: number): void {
  cancel()
  if (prefersReducedMotion || props.durationMs <= 0) {
    display.value = target
    return
  }

  const from = 0
  const start = performance.now()

  const step = (now: number): void => {
    const progress = Math.min((now - start) / props.durationMs, 1)
    display.value = Math.round(from + (target - from) * easeOutCubic(progress))
    if (progress < 1) {
      frameId = requestAnimationFrame(step)
    } else {
      frameId = null
    }
  }

  frameId = requestAnimationFrame(step)
}

watch(() => props.value, animateTo, { immediate: true })
onBeforeUnmount(cancel)
</script>

<template>
  <span>{{ display.toLocaleString('pt-BR') }}</span>
</template>
