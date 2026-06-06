<script setup lang="ts">
/**
 * NavigationTile — item de navegação da Sidebar (padrão proprietário Noturno).
 *
 * Linha com **ícone à esquerda** + rótulo, área clicável ampla e espaçamento
 * confortável. No estado **ativo**: fundo mais escuro, ícone/texto laranja,
 * leve profundidade e **cantos em "L" laranja**. Inativo: cinza com hover suave.
 * Suporta modo **recolhido** (somente ícone). Não é uma lista simples — cada
 * item tem presença visual.
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
    class="group relative flex w-full items-center gap-3 rounded-xl py-3 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-noturno-orange"
    :class="[
      collapsed ? 'justify-center px-0' : 'px-3',
      active
        ? 'bg-noturno-black-2 text-noturno-orange shadow-sm shadow-black/40'
        : 'text-noturno-grey-light hover:bg-noturno-black-2/60 hover:text-noturno-white',
    ]"
    @click="emit('activate')"
  >
    <!-- Cantos em "L" (apenas no item ativo) -->
    <template v-if="active && !collapsed">
      <span
        class="pointer-events-none absolute left-1.5 top-1.5 h-3 w-3 rounded-tl-md border-l-2 border-t-2 border-noturno-orange"
        aria-hidden="true"
      ></span>
      <span
        class="pointer-events-none absolute bottom-1.5 left-1.5 h-3 w-3 rounded-bl-md border-b-2 border-l-2 border-noturno-orange"
        aria-hidden="true"
      ></span>
    </template>

    <i
      :class="[iconClass, active ? 'text-noturno-orange' : 'group-hover:text-noturno-white']"
      class="w-5 text-center text-lg"
      aria-hidden="true"
    ></i>
    <span v-if="!collapsed" class="text-sm font-medium">{{ label }}</span>
  </button>
</template>
