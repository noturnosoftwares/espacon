<script setup lang="ts">
/**
 * CountriesPage — pesquisa de países (rota `/paises`). Opera em **gestão** e
 * **seleção** (`?mode=select`, canal `shared/selection`): em seleção, clique/Enter
 * na linha confirma e devolve o país (ex.: cadastro de Estado). Padrões §9.1:
 * abre vazia, busca por Enter, filtro de situação local, scroll infinito.
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
import { useCountriesStore } from '../stores'
import { type Country, countryLabel } from '../../domain/models'
import type { LocationStatusFilter } from '../../domain/repositories'

const router = useRouter()
const store = useCountriesStore()
const { isSelectMode, requestId, confirmSelection, cancelSelection } = useSelectionMode<Country>()

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
    store.applyFilters({ search: '', status: 'active' })
  }
})

const columns = computed(() => [
  { field: 'name', label: 'Nome', sortable: true },
  { field: 'iso2', label: 'ISO', sortable: true, width: '6rem' },
  { field: 'bacenCode', label: 'BACEN', sortable: true, width: '8rem' },
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
  store.applyFilters({ search: search.value.trim(), status: status.value })
}
function clearSearch(): void {
  search.value = ''
  status.value = isSelectMode.value ? 'active' : 'all'
  store.applyFilters({ search: '', status: status.value })
}
function goNew(): void {
  void router.push({ name: 'country-new', query: selectQuery.value })
}
function openDetails(country: Country): void {
  void router.push({ name: 'country-edit', params: { id: country.id }, query: selectQuery.value })
}
function onRowActivate(country: Country): void {
  if (isSelectMode.value) confirmSelection(country)
  else openDetails(country)
}
</script>

<template>
  <PageContainer>
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-content">
          {{ isSelectMode ? 'Selecionar país' : 'Países' }}
        </h1>
        <p class="mt-1 text-sm text-content-muted">
          {{
            isSelectMode
              ? 'Clique em um país (ou pressione Enter) para devolvê-lo ao cadastro.'
              : 'Fonte única de países — referenciada por Estados e cadastros do sistema.'
          }}
        </p>
      </div>
      <BaseButton icon="pi-plus" label="Novo país" @click="goNew" />
    </header>

    <div
      v-if="isSelectMode"
      class="flex items-center justify-between gap-3 rounded-field border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-content"
    >
      <span class="flex items-center gap-2">
        <i class="pi pi-arrow-right-arrow-left text-accent" aria-hidden="true"></i>
        Modo seleção: escolha um país para devolver ao cadastro.
      </span>
      <BaseButton variant="neutral" icon="pi-times" label="Cancelar seleção" @click="cancelSelection" />
    </div>

    <div class="flex w-full flex-wrap items-center gap-2">
      <div class="min-w-0 flex-1 sm:max-w-md">
        <SearchField
          v-model="search"
          placeholder="Buscar por nome, ISO ou BACEN"
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
        icon="pi-globe"
        title="Pronto para pesquisar."
        hint="Digite um nome, sigla ISO ou código BACEN e pressione Enter."
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
            <RecordCodeBadge :code="(row as Country).id" />
            <span class="font-medium text-content">{{ (row as Country).name }}</span>
          </span>
        </template>
        <template #cell-active="{ row }">
          <StatusBadge
            :severity="(row as Country).active ? 'success' : 'neutral'"
            :label="(row as Country).active ? 'Ativo' : 'Inativo'"
          />
        </template>
        <template #cell-actions="{ row }">
          <span class="inline-flex justify-end" @click.stop @keydown.enter.stop>
            <BaseButton
              variant="icon"
              icon="pi-eye"
              class="!text-accent hover:!bg-accent/15 hover:!text-accent-hover"
              :title="`Ver ${countryLabel(row as Country)}`"
              aria-label="Ver detalhes"
              @click="openDetails(row as Country)"
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
              <template v-else>Nenhum país encontrado.</template>
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
