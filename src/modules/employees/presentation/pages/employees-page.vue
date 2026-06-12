<script setup lang="ts">
/**
 * EmployeesPage — pesquisa de funcionários (rota `/funcionarios`), dentro do
 * `AppShell`. Aba **Buscar** da spec `employee-registration` §5.2.
 *
 * Segue o Design System §9.1: **abre vazia** (empty-state convidando à busca),
 * busca por **Enter**, **filtro de Situação** que refina o cache localmente (sem
 * requisição), grid de leitura sem ações inline (clique na linha → edição) e
 * **scroll infinito** (ADR-002). Sem regra de negócio aqui.
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
  StatusBadge,
} from '@/shared/widgets'
import { formatCpf } from '@/shared/extensions'
import { useEmployeesStore } from '../stores'
import {
  type Employee,
  EmployeeStatus,
  employeeStatusLabel,
  employeeStatusSeverity,
} from '../../domain/models'
import type { EmployeeStatusFilter } from '../../domain/repositories'

const router = useRouter()
const store = useEmployeesStore()

const search = ref('')

const STATUS_OPTIONS: { label: string; value: EmployeeStatusFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativos', value: EmployeeStatus.Active },
  { label: 'Afastados', value: EmployeeStatus.OnLeave },
  { label: 'Demitidos', value: EmployeeStatus.Dismissed },
]
const status = ref<EmployeeStatusFilter>('all')

const hasActiveFilters = computed(() => !!store.currentSearch || status.value !== 'all')

onMounted(() => {
  if (store.searched) {
    search.value = store.currentSearch
    status.value = store.currentStatus
    void store.refresh()
  }
})

const columns = [
  { field: 'id', label: 'Cód.', sortable: true, width: '7rem' },
  { field: 'name', label: 'Nome', sortable: true },
  { field: 'nickname', label: 'Apelido', sortable: true, width: '10rem' },
  { field: 'cpf', label: 'CPF', sortable: false, width: '11rem' },
  { field: 'status', label: 'Situação', sortable: true, width: '11rem' },
]

// Visão local do cache: aplica a situação sobre os itens já carregados (§9.1).
const displayedEmployees = computed(() => {
  if (status.value === 'all') return store.items
  return store.items.filter((employee) => employee.status === status.value)
})

function runSearch(): void {
  store.applyFilters({ search: search.value.trim(), status: status.value })
}

function clearSearch(): void {
  search.value = ''
  status.value = 'all'
  store.applyFilters({ search: '', status: 'all' })
}

function goNew(): void {
  void router.push({ name: 'employee-new' })
}
function openEmployee(employee: Employee): void {
  void router.push({ name: 'employee-edit', params: { id: employee.id } })
}
</script>

<template>
  <PageContainer>
    <!-- Cabeçalho -->
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-content">Funcionários</h1>
        <p class="mt-1 text-sm text-content-muted">Cadastro e manutenção do quadro de pessoal.</p>
      </div>
      <BaseButton icon="pi-plus" label="Novo funcionário" @click="goNew" />
    </header>

    <!-- Busca + filtros (campos primeiro, ações ao final). -->
    <div class="flex w-full flex-wrap items-center gap-2">
      <div class="min-w-0 flex-1 sm:max-w-md">
        <SearchField
          v-model="search"
          placeholder="Buscar por nome, apelido ou CPF"
          @search="runSearch"
          @clear="runSearch"
        />
      </div>
      <div class="w-44">
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

    <!-- Erro -->
    <p
      v-if="store.hasError"
      class="flex items-center gap-2 rounded-field border border-danger/40 bg-danger-soft px-4 py-2 text-sm text-danger"
    >
      <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
      {{ store.errorMessage }}
    </p>

    <!-- Estado inicial: convida à busca (§9.1). -->
    <BaseCard v-if="!store.searched" flush>
      <EmptyState
        icon="pi-users"
        title="Pronto para pesquisar."
        hint="Digite um nome, apelido ou CPF e pressione Enter para listar os funcionários."
      />
    </BaseCard>

    <template v-else>
      <!-- Card de situação do resultado. -->
      <div v-if="store.items.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <BaseCard>
          <p class="text-xs font-medium uppercase tracking-wide text-content-muted">Encontrados</p>
          <p class="mt-1 text-2xl font-bold text-content">{{ store.totalItems }}</p>
        </BaseCard>
      </div>

      <!-- Grid de leitura: linha clicável, scroll infinito. -->
      <BaseDataTable
        :rows="displayedEmployees"
        :columns="columns"
        :loading="store.loading"
        :has-more="store.hasMore"
        :loading-more="store.loadingMore"
        row-key="id"
        @row-click="openEmployee"
        @load-more="store.loadNext"
      >
        <template #cell-id="{ row }">
          <RecordCodeBadge :code="(row as Employee).id" />
        </template>
        <template #cell-name="{ row }">
          <span class="flex items-center gap-2.5">
            <InitialsAvatar :name="(row as Employee).name" size="sm" />
            <span class="min-w-0 truncate font-medium text-content">{{ (row as Employee).name }}</span>
          </span>
        </template>
        <template #cell-cpf="{ row }">
          <span class="tabular-nums text-content-soft">{{ formatCpf((row as Employee).cpf) }}</span>
        </template>
        <template #cell-status="{ row }">
          <StatusBadge
            :severity="employeeStatusSeverity((row as Employee).status)"
            :label="employeeStatusLabel((row as Employee).status)"
          />
        </template>
        <template #empty>
          <EmptyState icon="pi-search-minus" tone="danger">
            <template #title>
              <template v-if="store.currentSearch">
                Nenhum resultado para
                <span class="font-semibold text-danger">“{{ store.currentSearch }}”</span>
              </template>
              <template v-else>Nenhum funcionário encontrado.</template>
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
