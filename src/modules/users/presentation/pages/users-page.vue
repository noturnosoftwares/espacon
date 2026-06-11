<script setup lang="ts">
/**
 * UsersPage — pesquisa de usuários (rota `/usuarios`), dentro do `AppShell`.
 *
 * Segue o Design System §9.1: **abre vazia** (empty-state convidando à busca),
 * busca por **Enter** (nunca incremental no backend), grid de **leitura** sem
 * ações inline (clique na linha → edição) e **scroll infinito** (ADR-002 —
 * carrega 30 por lote ao aproximar do fim, sem controles de página). Quando não
 * há resultados, destaca o termo buscado em vermelho e oferece **Limpar
 * pesquisa**. Espaçamento via `PageContainer` (§4). Nenhuma regra de negócio
 * aqui: apenas compõe a `useUsersStore` com a UI.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import Select from 'primevue/select'
import {
  BaseButton,
  BaseCard,
  BaseDataTable,
  EmptyState,
  PageContainer,
  SearchField,
  StatusBadge,
} from '@/shared/widgets'
import type { UserRole } from '@/shared/access'
import { useUsersStore } from '../stores'
import type { User } from '../../domain/models'

const router = useRouter()
const store = useUsersStore()

const search = ref('')

// Filtro de **situação** (ativo/inativo). Modelado como chave de UI e convertido
// para o contrato `active?: boolean | null` ao aplicar (ausente/null = todas).
type Situation = 'all' | 'active' | 'inactive'
const SITUATION_OPTIONS: { label: string; value: Situation }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
]
const situation = ref<Situation>('all')

function situationToActive(value: Situation): boolean | null {
  return value === 'active' ? true : value === 'inactive' ? false : null
}
function activeToSituation(active: boolean | null | undefined): Situation {
  return active === true ? 'active' : active === false ? 'inactive' : 'all'
}

/** Há algum filtro aplicado (termo ou situação)? Habilita o "Limpar". */
const hasActiveFilters = computed(
  () => !!store.currentQuery || store.filters?.active != null,
)

// Preserva o contexto ao voltar de um registro: se já houve busca, restaura o
// termo e a situação e **atualiza** a lista (refletindo inclusões/edições/
// exclusões) — nunca zera a tela (Design System §9.1).
onMounted(() => {
  if (store.searched) {
    search.value = store.currentQuery
    situation.value = activeToSituation(store.filters?.active)
    void store.refresh()
  }
})

const ROLE_LABEL: Record<UserRole, string> = {
  admin: 'Administrador',
  franchisee: 'Franqueado',
  representative: 'Representante',
  technician: 'Técnico',
  customer: 'Cliente',
}

const columns = [
  { field: 'name', label: 'Nome', sortable: true },
  { field: 'login', label: 'Login', sortable: true },
  { field: 'email', label: 'E-mail', sortable: true },
  { field: 'role', label: 'Papel', sortable: true },
  { field: 'active', label: 'Situação', sortable: true, width: '10rem' },
]

const activeCount = computed(() => store.items.filter((u) => u.active).length)
const inactiveCount = computed(() => store.items.length - activeCount.value)

/**
 * Aplica os filtros atuais (termo + situação). O termo busca por Enter/botão
 * (§9.1 — nunca a cada tecla); a situação, sendo discreta, aplica na hora.
 */
function runSearch(): void {
  store.applyFilters({
    query: search.value.trim(),
    active: situationToActive(situation.value),
  })
}

/** Limpa termo **e** situação e recarrega a lista completa (§9.1, item 5). */
function clearSearch(): void {
  search.value = ''
  situation.value = 'all'
  store.applyFilters({ query: '', active: null })
}

function goNew(): void {
  void router.push({ name: 'user-new' })
}
function openUser(user: User): void {
  void router.push({ name: 'user-edit', params: { id: user.id } })
}
</script>

<template>
  <PageContainer>
    <!-- Cabeçalho -->
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-content">Usuários</h1>
        <p class="mt-1 text-sm text-content-muted">
          Cadastro e manutenção de acessos do sistema.
        </p>
      </div>
      <BaseButton icon="pi-plus" label="Novo usuário" @click="goNew" />
    </header>

    <!-- Busca + filtros -->
    <div class="flex w-full flex-wrap items-center gap-2">
      <div class="flex min-w-0 flex-1 items-center gap-2 sm:max-w-xl">
        <SearchField
          v-model="search"
          placeholder="Buscar por nome, login ou e-mail"
          @search="runSearch"
          @clear="runSearch"
        />
        <BaseButton variant="neutral" icon="pi-search" label="Buscar" @click="runSearch" />
      </div>
      <!-- Situação: filtro discreto, aplica na hora. -->
      <Select
        v-model="situation"
        :options="SITUATION_OPTIONS"
        optionLabel="label"
        optionValue="value"
        aria-label="Filtrar por situação"
        class="w-40"
        @change="runSearch"
      />
      <!-- Limpar termo + filtros (aparece com qualquer filtro ativo). -->
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
        icon="pi-search"
        title="Pronto para pesquisar."
        hint="Digite um nome, login ou e-mail e pressione Enter para listar os usuários."
      />
    </BaseCard>

    <template v-else>
      <!-- Cards de situação do resultado. -->
      <div v-if="store.items.length" class="grid grid-cols-2 gap-4 sm:grid-cols-3">
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

      <!-- Grid de leitura: linha clicável, sem ações inline, scroll infinito. -->
      <BaseDataTable
        :rows="store.items"
        :columns="columns"
        :loading="store.loading"
        :has-more="store.hasMore"
        :loading-more="store.loadingMore"
        row-key="id"
        @row-click="openUser"
        @load-more="store.loadNext"
      >
        <template #cell-role="{ row }">
          <span class="text-content-soft">{{ ROLE_LABEL[(row as User).role] }}</span>
        </template>
        <template #cell-active="{ row }">
          <StatusBadge
            :severity="(row as User).active ? 'success' : 'neutral'"
            :label="(row as User).active ? 'Ativo' : 'Inativo'"
          />
        </template>
        <template #empty>
          <EmptyState icon="pi-search-minus" tone="danger">
            <template #title>
              <template v-if="store.currentQuery">
                Nenhum resultado para
                <span class="font-semibold text-danger">“{{ store.currentQuery }}”</span>
              </template>
              <template v-else>Nenhum usuário encontrado.</template>
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
