<script setup lang="ts">
/**
 * BasePagination — paginação padrão de resultados (§8.6): primeiro/anterior/
 * página/próximo/último + faixa "1–20 de 134". Sempre presente em pesquisa.
 */
import { computed } from 'vue'

const props = defineProps<{
  page: number
  pageSize: number
  total: number
}>()

const emit = defineEmits<{ 'update:page': [value: number] }>()

const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)))
const from = computed(() => (props.total === 0 ? 0 : (props.page - 1) * props.pageSize + 1))
const to = computed(() => Math.min(props.page * props.pageSize, props.total))

function go(target: number): void {
  const clamped = Math.min(Math.max(1, target), totalPages.value)
  if (clamped !== props.page) emit('update:page', clamped)
}

const buttons = [
  { icon: 'pi-angle-double-left', to: () => 1, key: 'first', label: 'Primeira página' },
  { icon: 'pi-angle-left', to: () => props.page - 1, key: 'prev', label: 'Página anterior' },
]
</script>

<template>
  <nav class="flex items-center justify-between gap-3 px-1 pt-3" aria-label="Paginação">
    <p class="text-xs text-content-muted">
      <template v-if="total > 0">{{ from }}–{{ to }} de {{ total }}</template>
      <template v-else>Nenhum resultado</template>
    </p>

    <div class="flex items-center gap-1">
      <button
        v-for="b in buttons"
        :key="b.key"
        type="button"
        :aria-label="b.label"
        :disabled="page <= 1"
        class="ds-focus-ring flex h-8 w-8 items-center justify-center rounded-field text-content-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-2 hover:text-content disabled:opacity-30 disabled:hover:bg-transparent"
        @click="go(b.to())"
      >
        <i :class="['pi', b.icon, 'text-xs']" aria-hidden="true"></i>
      </button>

      <span class="px-2 text-xs font-medium text-content-soft">
        {{ page }} / {{ totalPages }}
      </span>

      <button
        type="button"
        aria-label="Próxima página"
        :disabled="page >= totalPages"
        class="ds-focus-ring flex h-8 w-8 items-center justify-center rounded-field text-content-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-2 hover:text-content disabled:opacity-30 disabled:hover:bg-transparent"
        @click="go(page + 1)"
      >
        <i class="pi pi-angle-right text-xs" aria-hidden="true"></i>
      </button>
      <button
        type="button"
        aria-label="Última página"
        :disabled="page >= totalPages"
        class="ds-focus-ring flex h-8 w-8 items-center justify-center rounded-field text-content-muted transition-colors duration-[var(--duration-fast)] hover:bg-surface-2 hover:text-content disabled:opacity-30 disabled:hover:bg-transparent"
        @click="go(totalPages)"
      >
        <i class="pi pi-angle-double-right text-xs" aria-hidden="true"></i>
      </button>
    </div>
  </nav>
</template>
