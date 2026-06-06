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
    class="relative flex h-10 w-10 items-center justify-center rounded-xl border border-noturno-grey-light-clean-3 bg-noturno-black-2 text-noturno-grey-light transition-colors hover:border-noturno-orange/50 hover:text-noturno-white outline-none focus-visible:ring-2 focus-visible:ring-noturno-orange"
    :aria-label="count > 0 ? `Notificações (${count} pendentes)` : 'Notificações'"
  >
    <i class="pi pi-bell" aria-hidden="true"></i>
    <span
      v-if="count > 0"
      class="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-noturno-orange px-1 text-[0.6rem] font-bold text-noturno-black"
    >
      {{ count > 99 ? '99+' : count }}
    </span>
  </button>
</template>
