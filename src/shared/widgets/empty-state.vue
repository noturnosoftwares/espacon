<script setup lang="ts">
/**
 * EmptyState — arte de vazio do Design System (§9.1). Ícone que remete ao
 * domínio/propósito com **pulse gentil**, título e copy amigável. Usado na
 * página de pesquisa antes da busca e quando não há resultados. O `tone` casa a
 * cor com o propósito: `accent` (convite à busca), `danger` (nada encontrado),
 * `muted` (neutro). Slot default para ações.
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    icon: string
    /** Título; pode ser substituído pelo slot `title` (ex.: destacar o termo buscado). */
    title?: string
    hint?: string
    tone?: 'accent' | 'danger' | 'muted'
  }>(),
  { tone: 'accent' },
)

const toneClass = computed(() => {
  switch (props.tone) {
    case 'danger':
      return 'bg-danger-soft text-danger'
    case 'muted':
      return 'bg-surface-2 text-content-muted'
    case 'accent':
    default:
      return 'bg-accent-soft text-accent'
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
    <div
      class="flex h-16 w-16 items-center justify-center rounded-full ds-soft-pulse"
      :class="toneClass"
    >
      <i :class="['pi', icon, 'text-2xl']" aria-hidden="true"></i>
    </div>
    <div class="flex flex-col gap-1">
      <p class="text-base font-semibold text-content">
        <slot name="title">{{ title }}</slot>
      </p>
      <p v-if="hint || $slots.hint" class="text-sm text-content-muted">
        <slot name="hint">{{ hint }}</slot>
      </p>
    </div>
    <div v-if="$slots.default" class="mt-1">
      <slot />
    </div>
  </div>
</template>
