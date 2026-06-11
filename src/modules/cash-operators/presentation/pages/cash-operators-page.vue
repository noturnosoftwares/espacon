<script setup lang="ts">
/**
 * CashOperatorsPage — pesquisa de operadores de caixa (rota
 * `/operadores-de-caixa`), dentro do `AppShell`.
 *
 * É a **única** tela de pesquisa/seleção de operador (template ADR-003 — listagem
 * como consulta reutilizável). Opera em **dois modos** (via `useSelectionMode`):
 * - **gestão** (padrão): clique/Enter na linha → abre detalhes/edição;
 * - **seleção** (`?mode=select`): clique/Enter na linha → **confirmam e devolvem**
 *   o operador à tela solicitante (ex.: bloco "Caixa" do usuário). Para abrir o
 *   registro neste modo, usa-se o botão **Ver detalhes**. Só **ativos** são
 *   selecionáveis (operador limitado referencia operador ativo — spec).
 *
 * Padrões §9.1: abre vazia, busca por **Enter**, **filtro de Situação** que refina
 * o cache localmente (sem requisição), grid de leitura, **scroll infinito**
 * (ADR-002) e estado vazio com termo destacado. Sem regra de negócio na tela.
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
  SearchField,
  StatusBadge,
} from '@/shared/widgets'
import { useCashOperatorsStore } from '../stores'
import type { CashOperator } from '../../domain/models'
import type { CashOperatorStatusFilter } from '../../domain/repositories'

const router = useRouter()
const store = useCashOperatorsStore()
const { isSelectMode, requestId, confirmSelection, cancelSelection } =
  useSelectionMode<CashOperator>()

// Em modo seleção, detours para detalhe/novo carregam `mode/req` para que a
// listagem **reentre em modo seleção** ao voltar (e o registro editado/incluído
// fique selecionável). Em modo gestão, navega sem query.
const selectQuery = computed<LocationQueryRaw | undefined>(() =>
  isSelectMode.value && requestId.value
    ? { mode: 'select', req: requestId.value }
    : undefined,
)

const search = ref('')

// Filtro de Situação (§9.1): refina o cache localmente ao mudar (sem requisição)
// e vai ao backend como parâmetro na próxima busca. Em **modo seleção** fica
// travado em "Ativos" — só operadores ativos podem ser vinculados (spec).
const STATUS_OPTIONS: { label: string; value: CashOperatorStatusFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
]
const status = ref<CashOperatorStatusFilter>(isSelectMode.value ? 'active' : 'all')

const hasActiveFilters = computed(() => !!store.currentSearch || status.value !== 'all')

// Preserva o contexto ao voltar de um registro (§9.1): restaura termo + situação
// e atualiza a lista (refletindo inclusões/edições/inativações). Nunca zera.
onMounted(() => {
  if (store.searched) {
    search.value = store.currentSearch
    if (!isSelectMode.value) status.value = store.currentStatus
    void store.refresh()
  } else if (isSelectMode.value) {
    // Em seleção, já abre listando os ativos (sem exigir uma busca primeiro).
    store.applyFilters({ search: '', status: 'active' })
  }
})

// A coluna "Ver detalhes" só existe em **modo seleção** (template ADR-003): lá o
// clique na linha confirma, então é o único caminho para abrir o registro.
const columns = computed(() => [
  { field: 'code', label: 'Código', sortable: true, width: '9rem' },
  { field: 'name', label: 'Operador', sortable: true },
  { field: 'active', label: 'Situação', sortable: true, width: '10rem' },
  ...(isSelectMode.value
    ? [{ field: 'actions', label: '', sortable: false, width: '4.5rem', align: 'right' as const }]
    : []),
])

// Visão local do cache: aplica a situação sobre os itens já carregados (§9.1).
const displayedOperators = computed(() => {
  if (status.value === 'all') return store.items
  const wantActive = status.value === 'active'
  return store.items.filter((operator) => operator.active === wantActive)
})

const activeCount = computed(() => store.items.filter((operator) => operator.active).length)
const inactiveCount = computed(() => store.items.length - activeCount.value)

/** Busca por Enter/botão (§9.1): leva termo + situação como parâmetros. */
function runSearch(): void {
  store.applyFilters({ search: search.value.trim(), status: status.value })
}

/** Limpa termo + situação e recarrega (§9.1). Em seleção, mantém "Ativos". */
function clearSearch(): void {
  search.value = ''
  status.value = isSelectMode.value ? 'active' : 'all'
  store.applyFilters({ search: '', status: status.value })
}

function goNew(): void {
  void router.push({ name: 'cash-operator-new', query: selectQuery.value })
}

function openDetails(operator: CashOperator): void {
  void router.push({
    name: 'cash-operator-edit',
    params: { id: operator.id },
    query: selectQuery.value,
  })
}

/**
 * Gesto principal na linha (clique/Enter): em seleção confirma e devolve; em
 * gestão abre detalhes/edição.
 */
function onRowActivate(operator: CashOperator): void {
  if (isSelectMode.value) confirmSelection(operator)
  else openDetails(operator)
}
</script>

<template>
  <PageContainer>
    <!-- Cabeçalho -->
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-content">
          {{ isSelectMode ? 'Selecionar operador de caixa' : 'Operadores de Caixa' }}
        </h1>
        <p class="mt-1 text-sm text-content-muted">
          {{
            isSelectMode
              ? 'Clique em um operador (ou pressione Enter) para devolvê-lo ao cadastro.'
              : 'Registro mestre de operadores — referenciado por usuários e pelo Financeiro.'
          }}
        </p>
      </div>
      <BaseButton icon="pi-plus" label="Novo operador" @click="goNew" />
    </header>

    <!-- Faixa do modo seleção: deixa o modo explícito e oferece o cancelar. -->
    <div
      v-if="isSelectMode"
      class="flex items-center justify-between gap-3 rounded-field border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-content"
    >
      <span class="flex items-center gap-2">
        <i class="pi pi-arrow-right-arrow-left text-accent" aria-hidden="true"></i>
        Modo seleção: escolha um operador ativo para devolver ao cadastro.
      </span>
      <BaseButton variant="neutral" icon="pi-times" label="Cancelar seleção" @click="cancelSelection" />
    </div>

    <!-- Busca + filtros. Campos primeiro (busca → situação), ações ao final. -->
    <div class="flex w-full flex-wrap items-center gap-2">
      <div class="min-w-0 flex-1 sm:max-w-md">
        <SearchField
          v-model="search"
          placeholder="Buscar por código ou nome"
          @search="runSearch"
          @clear="runSearch"
        />
      </div>
      <!-- Em modo seleção a situação fica travada em "Ativos" (não renderiza). -->
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
        icon="pi-wallet"
        title="Pronto para pesquisar."
        hint="Digite um código ou nome e pressione Enter para listar os operadores."
      />
    </BaseCard>

    <template v-else>
      <!-- Cards de situação do resultado (omitidos no modo seleção, enxuto). -->
      <div v-if="!isSelectMode && store.items.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <BaseCard>
          <p class="text-xs font-medium uppercase tracking-wide text-content-muted">Encontrados</p>
          <p class="mt-1 text-2xl font-bold text-content">{{ store.totalItems }}</p>
        </BaseCard>
        <BaseCard>
          <p class="text-xs font-medium uppercase tracking-wide text-content-muted">Ativos</p>
          <p class="mt-1 text-2xl font-bold text-success">{{ activeCount }}</p>
        </BaseCard>
        <BaseCard>
          <p class="text-xs font-medium uppercase tracking-wide text-content-muted">Inativos</p>
          <p class="mt-1 text-2xl font-bold text-content-muted">{{ inactiveCount }}</p>
        </BaseCard>
      </div>

      <!-- Grid de leitura: linha clicável, scroll infinito. `rows` é a visão
           local (cache filtrado pela situação). -->
      <BaseDataTable
        :rows="displayedOperators"
        :columns="columns"
        :loading="store.loading"
        :has-more="store.hasMore"
        :loading-more="store.loadingMore"
        row-key="id"
        @row-click="onRowActivate"
        @load-more="store.loadNext"
      >
        <template #cell-code="{ row }">
          <span class="font-medium text-content">{{ (row as CashOperator).code }}</span>
        </template>
        <template #cell-active="{ row }">
          <StatusBadge
            :severity="(row as CashOperator).active ? 'success' : 'neutral'"
            :label="(row as CashOperator).active ? 'Ativo' : 'Inativo'"
          />
        </template>
        <!-- Só existe em modo seleção: único caminho para abrir o registro (o
             clique na linha confirma). `@click.stop` evita o gesto da linha. -->
        <template #cell-actions="{ row }">
          <span class="inline-flex justify-end" @click.stop @keydown.enter.stop>
            <BaseButton
              variant="icon"
              icon="pi-eye"
              class="!text-accent hover:!bg-accent/15 hover:!text-accent-hover"
              title="Ver detalhes"
              aria-label="Ver detalhes"
              @click="openDetails(row as CashOperator)"
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
              <template v-else>Nenhum operador encontrado.</template>
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
