<script setup lang="ts">
/**
 * StatCard — card de **totalizador** para o dashboard de pesquisa (Design System
 * §14.5). Contador **animado** (count-up, easeOutCubic) usando tokens. Reutilizável
 * por qualquer página de pesquisa de filtros simples (Fornecedor, etc.).
 */
import { ref, watch, onMounted } from 'vue'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    /** Cor do número (semântico, por tokens). */
    tone?: 'default' | 'success' | 'muted' | 'accent'
    icon?: string
  }>(),
  { tone: 'default' },
)

const TONE_CLASS: Record<string, string> = {
  default: 'text-content',
  success: 'text-success',
  muted: 'text-content-muted',
  accent: 'text-accent',
}

const display = ref(0)

function animate(to: number): void {
  const from = display.value
  const diff = to - from
  if (diff === 0 || typeof requestAnimationFrame === 'undefined') {
    display.value = to
    return
  }
  const steps = 24
  let frame = 0
  const tick = (): void => {
    frame += 1
    const t = frame / steps
    const eased = 1 - Math.pow(1 - t, 3)
    display.value = Math.round(from + diff * eased)
    if (frame < steps) requestAnimationFrame(tick)
    else display.value = to
  }
  requestAnimationFrame(tick)
}

watch(() => props.value, (v) => animate(v))
onMounted(() => animate(props.value))
</script>

<template>
  <div class="rounded-card border border-line-subtle bg-surface-2 px-4 py-3">
    <p class="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-content-muted">
      <i v-if="icon" :class="['pi', icon, 'text-xs']" aria-hidden="true"></i>
      {{ label }}
    </p>
    <p class="mt-1 text-2xl font-bold tabular-nums" :class="TONE_CLASS[tone]">{{ display }}</p>
  </div>
</template>
