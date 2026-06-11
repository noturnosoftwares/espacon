<script setup lang="ts">
/**
 * UserProfilesPage — pesquisa de perfis (rota `/perfis`), dentro do `AppShell`.
 *
 * Mesmos padrões da `UsersPage` (Design System §9.1): abre vazia, busca por
 * **Enter**, grid de **leitura** sem ações inline (clique na linha → edição),
 * **scroll infinito** (ADR-002) e estado vazio com termo destacado + **Limpar
 * pesquisa**. Espaçamento via `PageContainer` (§4). O perfil é apenas um modelo
 * de cadastro (não concede acesso). Sem regra de negócio na tela.
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  BaseButton,
  BaseCard,
  BaseDataTable,
  EmptyState,
  PageContainer,
  SearchField,
} from '@/shared/widgets'
import { useUserProfilesStore } from '../stores'
import type { UserProfile } from '../../domain/models'

const router = useRouter()
const store = useUserProfilesStore()

const search = ref('')

// Preserva o contexto ao voltar de um registro (§9.1): restaura o termo e
// atualiza a lista (refletindo inclusões/edições/exclusões) — nunca zera a tela.
onMounted(() => {
  if (store.searched) {
    search.value = store.currentQuery
    void store.refresh()
  }
})

const columns = [
  { field: 'description', label: 'Descrição', sortable: true },
  {
    field: 'resources',
    label: 'Recursos',
    sortable: true,
    width: '12rem',
    sortAccessor: (row: UserProfile) => row.permissions.length,
  },
]

/** Busca por Enter ou botão (§9.1) — nunca a cada tecla. */
function runSearch(): void {
  store.applyFilters({ query: search.value.trim() })
}

/** Limpa termo + filtros e recarrega a lista completa (§9.1). */
function clearSearch(): void {
  search.value = ''
  store.applyFilters({ query: '' })
}

function goNew(): void {
  void router.push({ name: 'user-profile-new' })
}
function openProfile(profile: UserProfile): void {
  void router.push({ name: 'user-profile-edit', params: { id: profile.id } })
}
</script>

<template>
  <PageContainer>
    <!-- Cabeçalho -->
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-content">Perfis de Usuário</h1>
        <p class="mt-1 text-sm text-content-muted">
          Modelos de cadastro que aceleram a atribuição de permissões.
        </p>
      </div>
      <BaseButton icon="pi-plus" label="Novo perfil" @click="goNew" />
    </header>

    <!-- Busca -->
    <div class="flex w-full max-w-xl items-center gap-2">
      <SearchField
        v-model="search"
        placeholder="Buscar por descrição"
        @search="runSearch"
        @clear="runSearch"
      />
      <BaseButton variant="neutral" icon="pi-search" label="Buscar" @click="runSearch" />
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
        icon="pi-id-card"
        title="Pronto para pesquisar."
        hint="Digite uma descrição e pressione Enter para listar os perfis."
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

      <!-- Grid de leitura: linha clicável, sem ações inline, scroll infinito. -->
      <BaseDataTable
        :rows="store.items"
        :columns="columns"
        :loading="store.loading"
        :has-more="store.hasMore"
        :loading-more="store.loadingMore"
        row-key="id"
        @row-click="openProfile"
        @load-more="store.loadNext"
      >
        <template #cell-resources="{ row }">
          <span class="text-content-soft">{{ (row as UserProfile).permissions.length }} recurso(s)</span>
        </template>
        <template #empty>
          <EmptyState icon="pi-search-minus" tone="danger">
            <template #title>
              <template v-if="store.currentQuery">
                Nenhum resultado para
                <span class="font-semibold text-danger">“{{ store.currentQuery }}”</span>
              </template>
              <template v-else>Nenhum perfil encontrado.</template>
            </template>
            <template #hint>Revise o termo ou ajuste os filtros e tente novamente.</template>
            <BaseButton
              v-if="store.currentQuery"
              variant="neutral"
              icon="pi-filter-slash"
              label="Limpar pesquisa"
              @click="clearSearch"
            />
          </EmptyState>
        </template>
      </BaseDataTable>
    </template>
  </PageContainer>
</template>
