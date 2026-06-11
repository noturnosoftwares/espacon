<script setup lang="ts">
/**
 * RecentAccessCard — últimos registros acessados (cliente, contrato, licença…),
 * com categoria e tempo relativo. Componente puro (recebe a lista por prop).
 */
import type { RecentAccess } from '../../domain/models'
import DashboardCard from './dashboard-card.vue'
import { categoryLabel, iconClass } from './dashboard-ui'

defineProps<{ items: RecentAccess[] }>()
</script>

<template>
  <DashboardCard title="Acessos Recentes" icon="clock" icon-color="text-content-muted">
    <ul class="flex flex-col divide-y divide-line/50">
      <li v-for="item in items" :key="item.id" class="flex items-center gap-3 py-2.5">
        <span
          class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-surface-1 text-content-muted"
        >
          <i :class="iconClass(item.icon)" class="text-sm" aria-hidden="true"></i>
        </span>
        <div class="min-w-0 flex-1">
          <div class="truncate text-sm text-content">{{ item.title }}</div>
          <div class="text-xs text-content-muted">{{ categoryLabel(item.category) }}</div>
        </div>
        <span class="shrink-0 text-xs text-content-muted">{{ item.timeAgo }}</span>
      </li>
    </ul>

    <template #footer>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-content-muted transition-colors hover:text-accent"
      >
        Ver todos acessos <i class="pi pi-angle-right text-[0.65rem]" aria-hidden="true"></i>
      </button>
    </template>
  </DashboardCard>
</template>
