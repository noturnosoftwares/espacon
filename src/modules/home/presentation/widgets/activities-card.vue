<script setup lang="ts">
/**
 * ActivitiesCard — feed de atividades recentes da rede, com pílula de categoria
 * e tempo relativo. Componente puro (recebe a lista por prop).
 */
import type { ActivityItem } from '../../domain/models'
import DashboardCard from './dashboard-card.vue'
import { categoryBadgeClass, categoryLabel, categoryTextClass } from './dashboard-ui'

defineProps<{ items: ActivityItem[] }>()
</script>

<template>
  <DashboardCard title="Atividades Recentes" icon="chart-line">
    <ul class="flex flex-col divide-y divide-noturno-grey-light-clean-3/50">
      <li v-for="item in items" :key="item.id" class="flex items-center gap-3 py-2.5">
        <i
          class="pi pi-circle-fill text-[0.5rem]"
          :class="categoryTextClass(item.category)"
          aria-hidden="true"
        ></i>
        <span class="min-w-0 flex-1 truncate text-sm text-noturno-grey-light-clean">
          {{ item.text }}
        </span>
        <span
          class="shrink-0 rounded-md px-2 py-0.5 text-xs font-medium"
          :class="categoryBadgeClass(item.category)"
        >
          {{ categoryLabel(item.category) }}
        </span>
        <span class="shrink-0 text-xs text-noturno-grey-light">{{ item.timeAgo }}</span>
      </li>
    </ul>

    <template #footer>
      <button
        type="button"
        class="flex w-full items-center justify-center gap-1.5 text-xs font-medium text-noturno-grey-light transition-colors hover:text-noturno-orange"
      >
        Ver todas atividades <i class="pi pi-angle-right text-[0.65rem]" aria-hidden="true"></i>
      </button>
    </template>
  </DashboardCard>
</template>
