<script setup lang="ts">
/**
 * DashboardCard — moldura padrão dos cards do painel: cabeçalho (ícone + título
 * + ação opcional), corpo e rodapé opcional. Centraliza o "chrome" dos cards
 * para evitar duplicação. Conteúdo entra por slots.
 */
import { iconClass } from './dashboard-ui'

withDefaults(
  defineProps<{
    title: string
    /** Chave de ícone do cabeçalho (PrimeIcons sem prefixo). */
    icon: string
    /** Classe de cor do ícone do cabeçalho. */
    iconColor?: string
  }>(),
  { iconColor: 'text-accent' },
)
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-line bg-surface-canvas p-5"
  >
    <header class="mb-4 flex items-center justify-between gap-3">
      <h2 class="flex items-center gap-2.5 text-sm font-semibold text-content">
        <i :class="[iconClass(icon), iconColor]" class="text-base" aria-hidden="true"></i>
        {{ title }}
      </h2>
      <slot name="action" />
    </header>

    <div class="flex-1"><slot /></div>

    <footer v-if="$slots.footer" class="mt-4 border-t border-line pt-3">
      <slot name="footer" />
    </footer>
  </section>
</template>
