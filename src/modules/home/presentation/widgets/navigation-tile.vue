<script setup lang="ts">
/**
 * NavigationTile — item de navegação da Sidebar (padrão proprietário Noturno).
 *
 * Linha **densa** com ícone à esquerda + rótulo em **uma linha** (ellipsis quando
 * faltar espaço). No estado **ativo**: realce laranja limpo (tint + texto/ícone
 * accent). Inativo: cinza com hover suave. Suporta modo **recolhido** (só ícone).
 *
 * Componente puro: recebe estado por prop e emite `activate`.
 */
import { computed } from 'vue'

const props = defineProps<{
  label: string
  icon: string
  active?: boolean
  /** Inerte ("em breve") — sem destino nesta fase. */
  soon?: boolean
  /** Sidebar recolhida (somente ícone). */
  collapsed?: boolean
}>()

const emit = defineEmits<{ activate: [] }>()

const iconClass = computed(() => `pi pi-${props.icon}`)
</script>

<template>
  <button
    type="button"
    :aria-current="active ? 'page' : undefined"
    :title="collapsed || soon ? (soon ? `${label} — em breve` : label) : undefined"
    class="group flex w-full min-w-0 items-center gap-2.5 rounded-lg py-2 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent"
    :class="[
      collapsed ? 'justify-center px-0' : 'px-2.5',
      active
        ? 'bg-accent-soft text-accent'
        : 'text-content-muted hover:bg-surface-1/60 hover:text-content',
    ]"
    @click="emit('activate')"
  >
    <i
      :class="[iconClass, active ? 'text-accent' : 'group-hover:text-content']"
      class="w-5 shrink-0 text-center text-base"
      aria-hidden="true"
    ></i>
    <span v-if="!collapsed" class="min-w-0 flex-1 truncate text-left text-sm font-medium">
      {{ label }}
    </span>
  </button>
</template>
