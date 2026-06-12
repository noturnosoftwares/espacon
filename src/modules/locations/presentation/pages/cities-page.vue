<script setup lang="ts">
/**
 * CitiesPage — pesquisa de cidades (rota `/cidades`). Gestão e **seleção**
 * (`?mode=select`): em seleção devolve a cidade ao cadastro solicitante
 * (Funcionário, Cliente…). O critério de aceitação pode restringir por estado
 * (`filter.stateId`). Padrões §9.1.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter, type LocationQueryRaw } from 'vue-router'
import { useSelectionMode } from '@/shared/selection'
import {
  BaseButton,
  BaseCard,
  BaseDataTable,
  BaseSelect,
  EmptyState,
  PageContainer,
  RecordCodeBadge,
  SearchField,
  StatusBadge,
} from '@/shared/widgets'
import { useCitiesStore } from '../stores'
import { type City, cityLabel } from '../../domain/models'
import type { LocationStatusFilter } from '../../domain/repositories'

const router = useRouter()
const store = useCitiesStore()
const { isSelectMode, requestId, selectionFilter, confirmSelection, cancelSelection } =
  useSelectionMode<City>()

const acceptedStateId = computed<number | null>(() => {
  const value = selectionFilter.value?.stateId
  return typeof value === 'number' ? value : null
})

const selectQuery = computed<LocationQueryRaw | undefined>(() =>
  isSelectMode.value && requestId.value
    ? { mode: 'select', req: requestId.value }
    : undefined,
)

const search = ref('')
const STATUS_OPTIONS: { label: string; value: LocationStatusFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
]
const status = ref<LocationStatusFilter>(isSelectMode.value ? 'active' : 'all')

const hasActiveFilters = computed(() =>
  isSelectMode.value ? !!store.currentSearch : !!store.currentSearch || status.value !== 'all',
)

onMounted(() => {
  if (store.searched) {
    search.value = store.currentSearch
    if (!isSelectMode.value) status.value = store.currentStatus
    void store.refresh()
  } else if (isSelectMode.value) {
    store.applyFilters({ search: '', status: 'active', stateId: acceptedStateId.value })
  }
})

const columns = computed(() => [
  { field: 'name', label: 'Cidade', sortable: true },
  { field: 'uf', label: 'UF', sortable: true, width: '6rem' },
  { field: 'ibgeCode', label: 'IBGE', sortable: false, width: '10rem' },
  { field: 'active', label: 'Situação', sortable: true, width: '10rem' },
  ...(isSelectMode.value
    ? [{ field: 'actions', label: '', sortable: false, width: '4.5rem', align: 'right' as const }]
    : []),
])

const displayed = computed(() => {
  if (status.value === 'all') return store.items
  const wantActive = status.value === 'active'
  return store.items.filter((c) => c.active === wantActive)
})

function runSearch(): void {
  store.applyFilters({
    search: search.value.trim(),
    status: status.value,
    stateId: isSelectMode.value ? acceptedStateId.value : null,
  })
}
function clearSearch(): void {
  search.value = ''
  status.value = isSelectMode.value ? 'active' : 'all'
  runSearch()
}
function goNew(): void {
  void router.push({ name: 'city-new', query: selectQuery.value })
}
function openDetails(city: City): void {
  void router.push({ name: 'city-edit', params: { id: city.id }, query: selectQuery.value })
}
function onRowActivate(city: City): void {
  if (isSelectMode.value) confirmSelection(city)
  else openDetails(city)
}
</script>

<template>
  <PageContainer>
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-content">
          {{ isSelectMode ? 'Selecionar cidade' : 'Cidades' }}
        </h1>
        <p class="mt-1 text-sm text-content-muted">
          {{
            isSelectMode
              ? 'Clique em uma cidade (ou pressione Enter) para devolvê-la ao cadastro.'
              : 'Fonte única de municípios — referenciada pelos cadastros do sistema.'
          }}
        </p>
      </div>
      <BaseButton icon="pi-plus" label="Nova cidade" @click="goNew" />
    </header>

    <div
      v-if="isSelectMode"
      class="flex items-center justify-between gap-3 rounded-field border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-content"
    >
      <span class="flex items-center gap-2">
        <i class="pi pi-arrow-right-arrow-left text-accent" aria-hidden="true"></i>
        Modo seleção: escolha uma cidade para devolver ao cadastro.
      </span>
      <BaseButton variant="neutral" icon="pi-times" label="Cancelar seleção" @click="cancelSelection" />
    </div>

    <div class="flex w-full flex-wrap items-center gap-2">
      <div class="min-w-0 flex-1 sm:max-w-md">
        <SearchField
          v-model="search"
          placeholder="Buscar por nome, UF ou código IBGE"
          @search="runSearch"
          @clear="runSearch"
        />
      </div>
      <div v-if="!isSelectMode" class="w-40">
        <BaseSelect
          v-model="status"
          :options="STATUS_OPTIONS"
          option-label="label"
          option-value="value"
          aria-label="Filtrar por situação"
        />
      </div>
      <BaseButton variant="neutral" icon="pi-search" label="Buscar" @click="runSearch" />
      <BaseButton
        v-if="hasActiveFilters"
        variant="neutral"
        icon="pi-filter-slash"
        label="Limpar"
        @click="clearSearch"
      />
    </div>

    <p
      v-if="store.hasError"
      class="flex items-center gap-2 rounded-field border border-danger/40 bg-danger-soft px-4 py-2 text-sm text-danger"
    >
      <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
      {{ store.errorMessage }}
    </p>

    <BaseCard v-if="!store.searched" flush>
      <EmptyState
        icon="pi-map-marker"
        title="Pronto para pesquisar."
        hint="Digite um nome, UF ou código IBGE e pressione Enter."
      />
    </BaseCard>

    <template v-else>
      <BaseDataTable
        :rows="displayed"
        :columns="columns"
        :loading="store.loading"
        :has-more="store.hasMore"
        :loading-more="store.loadingMore"
        row-key="id"
        @row-click="onRowActivate"
        @load-more="store.loadNext"
      >
        <template #cell-name="{ row }">
          <span class="flex items-center gap-2.5">
            <RecordCodeBadge :code="(row as City).id" />
            <span class="font-medium text-content">{{ (row as City).name }}</span>
          </span>
        </template>
        <template #cell-active="{ row }">
          <StatusBadge
            :severity="(row as City).active ? 'success' : 'neutral'"
            :label="(row as City).active ? 'Ativo' : 'Inativo'"
          />
        </template>
        <template #cell-actions="{ row }">
          <span class="inline-flex justify-end" @click.stop @keydown.enter.stop>
            <BaseButton
              variant="icon"
              icon="pi-eye"
              class="!text-accent hover:!bg-accent/15 hover:!text-accent-hover"
              :title="`Ver ${cityLabel(row as City)}`"
              aria-label="Ver detalhes"
              @click="openDetails(row as City)"
            />
          </span>
        </template>
        <template #empty>
          <EmptyState icon="pi-search-minus" tone="danger">
            <template #title>
              <template v-if="store.currentSearch">
                Nenhum resultado para
                <span class="font-semibold text-danger">“{{ store.currentSearch }}”</span>
              </template>
              <template v-else>Nenhuma cidade encontrada.</template>
            </template>
            <template #hint>Revise o termo ou ajuste os filtros e tente novamente.</template>
            <BaseButton
              v-if="hasActiveFilters"
              variant="neutral"
              icon="pi-filter-slash"
              label="Limpar filtros"
              @click="clearSearch"
            />
          </EmptyState>
        </template>
      </BaseDataTable>
    </template>
  </PageContainer>
</template>
