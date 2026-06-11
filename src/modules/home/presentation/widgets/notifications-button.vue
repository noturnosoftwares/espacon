<script setup lang="ts">
/**
 * NotificationsButton — sino de notificações do Header.
 *
 * Estrutura base: ícone + badge de quantidade pendente. O menu de notificações é
 * etapa futura (ver "Central de atividades" na home spec). `count` é prop para,
 * no futuro, vir de uma store/fonte real — sem dado fixo no componente.
 */
withDefaults(defineProps<{ count?: number }>(), { count: 0 })
</script>

<template>
  <button
    type="button"
    class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-1 text-content-muted transition-colors hover:border-accent/50 hover:text-content outline-none focus-visible:ring-2 focus-visible:ring-accent"
    :aria-label="count > 0 ? `Notificações (${count} pendentes)` : 'Notificações'"
  >
    <i class="pi pi-bell" aria-hidden="true"></i>
    <span
      v-if="count > 0"
      class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.6rem] font-bold text-on-accent"
    >
      {{ count > 99 ? '99+' : count }}
    </span>
  </button>
</template>
