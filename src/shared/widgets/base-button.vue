<script setup lang="ts">
/**
 * BaseButton — botão único do Design System (§8.2). Nenhuma tela monta botão
 * "na mão". Variantes mapeiam a intenção:
 *
 * - `primary`  — ação que inicia algo (Novo, Salvar, Entrar). Dourado.
 * - `danger`   — ação destrutiva (Excluir).
 * - `neutral`  — secundário/Cancelar. Borda discreta.
 * - `icon`     — botão-ícone quadrado (toolbar, header de diálogo).
 *
 * Altura mínima 40px (toque). Loading mostra spinner sem trocar a largura.
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'danger' | 'neutral' | 'icon'
    type?: 'button' | 'submit'
    label?: string
    icon?: string
    iconRight?: string
    loading?: boolean
    disabled?: boolean
    block?: boolean
    size?: 'sm' | 'md'
  }>(),
  { variant: 'primary', type: 'button', size: 'md' },
)

const isIconOnly = computed(() => props.variant === 'icon')

const base =
  'ds-focus-ring inline-flex items-center justify-center gap-2 font-semibold ' +
  'transition-colors duration-[var(--duration-fast)] disabled:cursor-not-allowed disabled:opacity-40 ' +
  'whitespace-nowrap select-none'

const sizing = computed(() => {
  if (isIconOnly.value) return 'h-10 w-10 rounded-field text-base'
  const h = props.size === 'sm' ? 'h-9 px-3 text-sm' : 'h-10 px-4 text-sm'
  return `${h} rounded-field ${props.block ? 'w-full' : ''}`
})

const variantClass = computed(() => {
  switch (props.variant) {
    case 'danger':
      return 'bg-danger text-white hover:bg-danger/90'
    case 'neutral':
      return 'border border-line bg-surface-1 text-content-soft hover:bg-surface-2 hover:text-content'
    case 'icon':
      return 'text-content-muted hover:bg-surface-2 hover:text-content'
    case 'primary':
    default:
      return 'bg-accent text-on-accent hover:bg-accent-hover'
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[base, sizing, variantClass]"
  >
    <i v-if="loading" class="pi pi-spinner animate-spin" aria-hidden="true"></i>
    <i v-else-if="icon" :class="['pi', icon]" aria-hidden="true"></i>
    <span v-if="label && !isIconOnly">{{ label }}</span>
    <slot v-if="!isIconOnly" />
    <i v-if="iconRight && !loading && !isIconOnly" :class="['pi', iconRight]" aria-hidden="true"></i>
  </button>
</template>
