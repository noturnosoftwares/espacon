<script setup lang="ts">
/**
 * SuppliersPage — pesquisa de fornecedores (rota `/fornecedores`). Segue as regras
 * gerais de pesquisa do Design System: **dashboard de totalizadores** acima da
 * busca (§14.5), grid com **avatar + situação** e **colunas de acesso rápido**
 * (§14.4: Cód → Nome → Documento → Telefone → Cidade/UF → Situação), **scroll
 * infinito** (lotes de 30 — ADR-002), **filtro local no cache** (Situação/Natureza)
 * e **empty-state** com termo em vermelho + "Limpar pesquisa".
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  BaseButton,
  BaseCard,
  BaseDataTable,
  BaseSelect,
  EmptyState,
  InitialsAvatar,
  PageContainer,
  RecordCodeBadge,
  SearchField,
  StatCard,
  StatusBadge,
} from '@/shared/widgets'
import { formatCnpj, formatCpf, formatPhone } from '@/shared/extensions'
import { useSuppliersStore } from '../stores'
import {
  type Supplier,
  SUPPLIER_STATUSES,
  SUPPLIER_TYPES,
  SupplierType,
  isGenericType,
  supplierCityUf,
  supplierDisplayName,
  supplierStatusLabel,
  supplierStatusSeverity,
  supplierTypeLabel,
  supplierTypeShortLabel,
} from '../../domain/models'
import type { SupplierStatusFilter, SupplierTypeFilter } from '../../domain/repositories'

const router = useRouter()
const store = useSuppliersStore()

const search = ref('')
const STATUS_OPTIONS: { label: string; value: SupplierStatusFilter }[] = [
  { label: 'Todas', value: 'all' },
  ...SUPPLIER_STATUSES.map((value) => ({ label: supplierStatusLabel(value), value })),
]
const TYPE_OPTIONS: { label: string; value: SupplierTypeFilter }[] = [
  { label: 'Todas', value: 'all' },
  ...SUPPLIER_TYPES.map((value) => ({ label: supplierTypeLabel(value), value })),
]
const status = ref<SupplierStatusFilter>('all')
const type = ref<SupplierTypeFilter>('all')

const hasActiveFilters = computed(
  () => !!store.currentSearch || status.value !== 'all' || type.value !== 'all',
)

onMounted(() => {
  void store.loadTotals()
  if (store.searched) {
    search.value = store.currentSearch
    status.value = store.currentStatus
    type.value = store.currentType
    void store.refresh()
  }
})

const columns = [
  { field: 'id', label: 'Cód.', sortable: true, width: '7rem' },
  { field: 'name', label: 'Nome', sortable: true },
  { field: 'document', label: 'Documento', sortable: false, width: '14rem' },
  { field: 'phone', label: 'Telefone', sortable: false, width: '11rem' },
  { field: 'cityUf', label: 'Cidade/UF', sortable: false, width: '12rem' },
  { field: 'status', label: 'Situação', sortable: true, width: '9rem' },
]

// Filtro local no cache (§14.4): refina Situação/Natureza sobre o lote carregado.
const displayed = computed(() => {
  return store.items.filter((s) => {
    const matchesStatus = status.value === 'all' || s.status === status.value
    const matchesType = type.value === 'all' || s.type === type.value
    return matchesStatus && matchesType
  })
})

function documentDisplay(s: Supplier): string {
  if (isGenericType(s.type) || !s.document) return ''
  return s.type === SupplierType.Individual ? formatCpf(s.document) : formatCnpj(s.document)
}
function phoneDisplay(s: Supplier): string {
  const value = s.mobile || s.phone
  return value ? formatPhone(value) : ''
}

function runSearch(): void {
  store.applyFilters({ search: search.value.trim(), status: status.value, type: type.value })
}
function clearSearch(): void {
  search.value = ''
  status.value = 'all'
  type.value = 'all'
  store.applyFilters({ search: '', status: 'all', type: 'all' })
}
function goNew(): void {
  void router.push({ name: 'supplier-new' })
}
function openSupplier(supplier: Supplier): void {
  void router.push({ name: 'supplier-edit', params: { id: supplier.id } })
}
</script>

<template>
  <PageContainer>
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-content">Fornecedores</h1>
        <p class="mt-1 text-sm text-content-muted">
          Base de Contas a Pagar, Compras e documentos fiscais.
        </p>
      </div>
      <BaseButton icon="pi-plus" label="Novo fornecedor" @click="goNew" />
    </header>

    <!-- Dashboard de totalizadores (§14.5): acima da busca, filtros simples. -->
    <div v-if="store.totals" class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <StatCard label="Total" :value="store.totals.total" icon="pi-users" />
      <StatCard label="Ativos" :value="store.totals.active" tone="success" />
      <StatCard label="Inativos" :value="store.totals.inactive" tone="muted" />
      <StatCard label="Jurídica" :value="store.totals.company" tone="accent" />
      <StatCard label="Física" :value="store.totals.individual" tone="accent" />
      <StatCard label="Genéricos" :value="store.totals.generic" tone="accent" />
    </div>

    <!-- Busca + filtros: termo → situação → natureza → ações. -->
    <div class="flex w-full flex-wrap items-center gap-2">
      <div class="min-w-0 flex-1 sm:max-w-md">
        <SearchField
          v-model="search"
          placeholder="Buscar por código, razão/fantasia ou documento"
          @search="runSearch"
          @clear="runSearch"
        />
      </div>
      <div class="w-40">
        <BaseSelect v-model="status" :options="STATUS_OPTIONS" option-label="label" option-value="value" aria-label="Filtrar por situação" />
      </div>
      <div class="w-44">
        <BaseSelect v-model="type" :options="TYPE_OPTIONS" option-label="label" option-value="value" aria-label="Filtrar por natureza" />
      </div>
      <BaseButton variant="neutral" icon="pi-search" label="Buscar" @click="runSearch" />
      <BaseButton v-if="hasActiveFilters" variant="neutral" icon="pi-filter-slash" label="Limpar" @click="clearSearch" />
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
        icon="pi-truck"
        title="Pronto para pesquisar."
        hint="Digite um código, razão/fantasia ou documento e pressione Enter para listar os fornecedores."
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
        @row-click="openSupplier"
        @load-more="store.loadNext"
      >
        <template #cell-id="{ row }">
          <RecordCodeBadge :code="(row as Supplier).id" />
        </template>
        <template #cell-name="{ row }">
          <span class="flex min-w-0 items-center gap-2.5">
            <InitialsAvatar :name="supplierDisplayName(row as Supplier)" size="sm" />
            <span class="min-w-0">
              <span class="block truncate font-medium text-content">{{ supplierDisplayName(row as Supplier) }}</span>
              <span
                v-if="isGenericType((row as Supplier).type)"
                class="text-xs text-content-muted"
              >Genérico</span>
              <span v-else class="text-xs text-content-muted">{{ supplierTypeShortLabel((row as Supplier).type) }}</span>
            </span>
          </span>
        </template>
        <template #cell-document="{ row }">
          <span class="tabular-nums text-content-soft">{{ documentDisplay(row as Supplier) || '—' }}</span>
        </template>
        <template #cell-phone="{ row }">
          <span class="tabular-nums text-content-soft">{{ phoneDisplay(row as Supplier) || '—' }}</span>
        </template>
        <template #cell-cityUf="{ row }">
          <span class="text-content-soft">{{ supplierCityUf(row as Supplier) || '—' }}</span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge
            :severity="supplierStatusSeverity((row as Supplier).status)"
            :label="supplierStatusLabel((row as Supplier).status)"
          />
        </template>
        <template #empty>
          <EmptyState icon="pi-search-minus" tone="danger">
            <template #title>
              <template v-if="store.currentSearch">
                Nenhum resultado para
                <span class="font-semibold text-danger">“{{ store.currentSearch }}”</span>
              </template>
              <template v-else>Nenhum fornecedor encontrado.</template>
            </template>
            <template #hint>Revise o termo ou ajuste os filtros e tente novamente.</template>
            <BaseButton variant="neutral" icon="pi-filter-slash" label="Limpar pesquisa" @click="clearSearch" />
          </EmptyState>
        </template>
      </BaseDataTable>
    </template>
  </PageContainer>
</template>
