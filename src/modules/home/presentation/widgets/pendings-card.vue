<script setup lang="ts">
/**
 * PendingsCard — pendências operacionais com contador colorido por severidade.
 * Componente puro (recebe a lista por prop).
 */
import type { PendingItem } from '../../domain/models'
import DashboardCard from './dashboard-card.vue'
import { accentBadgeClass, accentTextClass, iconClass } from './dashboard-ui'

defineProps<{ items: PendingItem[] }>()
</script>

<template>
  <DashboardCard title="Pendências" icon="flag">
    <ul class="flex flex-col divide-y divide-line/50">
      <li v-for="item in items" :key="item.id" class="flex items-center gap-3 py-2.5">
        <i
          :class="[iconClass(item.icon), accentTextClass(item.tone)]"
          class="text-base"
          aria-hidden="true"
        ></i>
        <span class="flex-1 text-sm text-content-soft">{{ item.label }}</span>
        <span
          class="rounded-md border px-2 py-0.5 text-xs font-semibold tabular-nums"
          :class="accentBadgeClass(item.tone)"
        >
          {{ item.count }}
        </span>
      </li>
    </ul>

    <template #footer>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-content-muted transition-colors hover:text-accent"
      >
        Ver todas pendências <i class="pi pi-angle-right text-[0.65rem]" aria-hidden="true"></i>
      </button>
    </template>
  </DashboardCard>
</template>
