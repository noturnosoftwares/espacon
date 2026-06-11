<script setup lang="ts" generic="T extends object">
/**
 * BaseDataTable — grid de **leitura** do Design System (§8.5). Sempre dentro de
 * um card (elev-1). Header em `surface-2` com ordenação clicável; linhas com
 * divisão clara, hover e altura confortável.
 *
 * **Scroll infinito (ADR-002):** não há controles/numeração de página. A store
 * acumula os lotes (30 por carga) e os entrega inteiros em `rows`; ao aproximar
 * do fim, o grid emite `load-more` (via IntersectionObserver numa sentinela) e
 * mostra um indicador de carregamento no rodapé enquanto `loadingMore` e ainda
 * houver dados (`hasMore`). A ordenação é client-side sobre o que já foi
 * carregado.
 *
 * Sem ações inline (§8.5/12): a linha é clicável → detalhe/edição (`row-click`).
 * Slots de célula: `cell-<field>` recebe `{ row }`. Slot `empty` para o vazio.
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'

interface Column<R> {
  field: string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'right' | 'center'
  /** Valor usado na ordenação quando difere do `row[field]` cru. */
  sortAccessor?: (row: R) => string | number | boolean
}

const props = withDefaults(
  defineProps<{
    rows: T[]
    columns: Column<T>[]
    loading?: boolean
    rowKey: keyof T
    /** Linhas de skeleton exibidas no carregamento inicial. */
    skeletonRows?: number
    /** Há mais registros além dos já carregados? (scroll infinito) */
    hasMore?: boolean
    /** Carregando o próximo lote? (indicador de rodapé) */
    loadingMore?: boolean
  }>(),
  { loading: false, skeletonRows: 8, hasMore: false, loadingMore: false },
)

const emit = defineEmits<{ 'row-click': [row: T]; 'load-more': [] }>()

const sortField = ref<string | null>(null)
const sortDir = ref<'asc' | 'desc'>('asc')

function toggleSort(col: Column<T>): void {
  if (!col.sortable) return
  if (sortField.value === col.field) {
    sortDir.value = sortDir.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = col.field
    sortDir.value = 'asc'
  }
}

function compareValues(a: string | number | boolean, b: string | number | boolean): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b
  return String(a).localeCompare(String(b), 'pt-BR')
}

const sorted = computed<T[]>(() => {
  if (!sortField.value) return props.rows
  const col = props.columns.find((c) => c.field === sortField.value)
  if (!col) return props.rows
  const accessor =
    col.sortAccessor ??
    ((row: T) => row[col.field as keyof T] as unknown as string | number | boolean)
  const dir = sortDir.value === 'asc' ? 1 : -1
  return [...props.rows].sort((a, b) => compareValues(accessor(a), accessor(b)) * dir)
})

function alignClass(align?: 'left' | 'right' | 'center'): string {
  return align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
}

// ── Scroll infinito ─────────────────────────────────────────────────────────
// Sentinela observada no viewport: ao entrar em cena (com folga de 200px) e
// havendo mais dados, pede o próximo lote. O guard `loadingMore` evita disparos
// repetidos enquanto a carga anterior não termina.
const sentinel = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

function maybeLoadMore(): void {
  if (props.hasMore && !props.loadingMore && !props.loading) emit('load-more')
}

function setupObserver(el: HTMLElement | null): void {
  observer?.disconnect()
  observer = null
  if (!el || typeof IntersectionObserver === 'undefined') return
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) maybeLoadMore()
    },
    { rootMargin: '200px' },
  )
  observer.observe(el)
}

watch(sentinel, (el) => setupObserver(el))
onBeforeUnmount(() => observer?.disconnect())
</script>

<template>
  <div class="overflow-hidden rounded-card border border-line-subtle bg-surface-1">
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-surface-2">
            <th
              v-for="col in columns"
              :key="col.field"
              scope="col"
              :style="col.width ? { width: col.width } : undefined"
              class="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-content-soft"
              :class="[alignClass(col.align), col.sortable ? 'cursor-pointer select-none' : '']"
              @click="toggleSort(col)"
            >
              <span
                class="inline-flex items-center gap-1.5"
                :class="col.align === 'right' ? 'flex-row-reverse' : ''"
              >
                {{ col.label }}
                <i
                  v-if="col.sortable"
                  class="pi text-[0.65rem]"
                  :class="
                    sortField === col.field
                      ? sortDir === 'asc'
                        ? 'pi-sort-up-fill text-accent'
                        : 'pi-sort-down-fill text-accent'
                      : 'pi-sort-alt text-content-muted'
                  "
                  aria-hidden="true"
                ></i>
              </span>
            </th>
          </tr>
        </thead>

        <tbody>
          <!-- Loading inicial: skeleton de linhas (§8.5). -->
          <template v-if="loading">
            <tr v-for="n in skeletonRows" :key="`sk-${n}`" class="border-t border-line-subtle">
              <td v-for="col in columns" :key="col.field" class="px-4 py-4">
                <div class="h-3.5 w-3/4 animate-pulse rounded bg-surface-2"></div>
              </td>
            </tr>
          </template>

          <!-- Vazio. -->
          <tr v-else-if="sorted.length === 0">
            <td :colspan="columns.length" class="p-0">
              <slot name="empty">
                <div class="px-4 py-12 text-center text-sm text-content-muted">
                  Nenhum registro encontrado.
                </div>
              </slot>
            </td>
          </tr>

          <!-- Linhas clicáveis (sem ações inline). -->
          <template v-else>
            <tr
              v-for="row in sorted"
              :key="String(row[rowKey])"
              class="ds-focus-ring cursor-pointer border-t border-line-subtle transition-colors duration-[var(--duration-fast)] hover:bg-surface-2"
              tabindex="0"
              @click="emit('row-click', row)"
              @keydown.enter="emit('row-click', row)"
            >
              <td
                v-for="col in columns"
                :key="col.field"
                class="px-4 py-3.5 text-content-soft"
                :class="alignClass(col.align)"
              >
                <slot :name="`cell-${col.field}`" :row="row">
                  {{ row[col.field as keyof T] }}
                </slot>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>

    <!-- Rodapé do scroll infinito: sentinela + indicador de carregamento. -->
    <div v-if="!loading && sorted.length > 0 && hasMore" class="border-t border-line-subtle">
      <div ref="sentinel" class="flex items-center justify-center gap-2 px-4 py-4 text-xs text-content-muted">
        <i class="pi pi-spinner animate-spin" aria-hidden="true"></i>
        <span>Carregando mais…</span>
      </div>
    </div>
  </div>
</template>
