<script setup lang="ts">
/**
 * UserProfilesPage — pesquisa de perfis (rota `/perfis`), dentro do `AppShell`.
 *
 * Esta é a **única** tela de pesquisa/seleção de perfil (ADR — "Tela de listagem
 * como consulta reutilizável"). Opera em **dois modos**, decididos por
 * `?mode=select` na rota (via `useSelectionMode`):
 * - **modo gestão** (padrão): clique/Enter na linha → abre detalhes/edição;
 * - **modo seleção**: clique/Enter na linha → **confirmam e devolvem** o perfil
 *   à tela solicitante (não abrem detalhes). Para abrir o registro neste modo,
 *   usa-se o botão explícito **Ver detalhes** de cada linha.
 *
 * Mantém os padrões da `UsersPage` (Design System §9.1): abre vazia, busca por
 * **Enter**, grid de leitura, **scroll infinito** (ADR-002) e estado vazio com
 * termo destacado. Sem regra de negócio na tela.
 */
import { computed, onMounted, ref } from 'vue'
import { useRouter, type LocationQueryRaw } from 'vue-router'
import { useSelectionMode } from '@/shared/selection'
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
const { isSelectMode, requestId, confirmSelection, cancelSelection } =
  useSelectionMode<UserProfile>()

// Em modo seleção, detours para detalhe/novo carregam `mode/req` para que a
// listagem **reentre em modo seleção** ao voltar (e o registro editado/incluído
// fique selecionável). Em modo gestão, navega sem query.
const selectQuery = computed<LocationQueryRaw | undefined>(() =>
  isSelectMode.value && requestId.value
    ? { mode: 'select', req: requestId.value }
    : undefined,
)

const search = ref('')

// Preserva o contexto ao voltar de um registro (§9.1): restaura o termo e
// atualiza a lista (refletindo inclusões/edições/exclusões) — nunca zera a tela.
onMounted(() => {
  if (store.searched) {
    search.value = store.currentQuery
    void store.refresh()
  }
})

// A coluna "Ações / Ver detalhes" só existe em **modo seleção** (template
// ADR-003): nesse modo o clique na linha confirma a seleção, então "Ver
// detalhes" é o único caminho para abrir o registro. Em modo gestão o clique
// na linha já abre os detalhes — a ação seria redundante.
const columns = computed(() => [
  { field: 'description', label: 'Descrição', sortable: true },
  {
    field: 'resources',
    label: 'Recursos',
    sortable: true,
    width: '10rem',
    sortAccessor: (row: UserProfile) => row.permissions.length,
  },
  ...(isSelectMode.value
    ? [{ field: 'actions', label: '', sortable: false, width: '4.5rem', align: 'right' as const }]
    : []),
])

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
  void router.push({ name: 'user-profile-new', query: selectQuery.value })
}

/**
 * Abre o registro (detalhes/edição). Em modo seleção, leva `mode/req` adiante
 * para que o retorno reentre na seleção (a tela de form devolve a query).
 */
function openDetails(profile: UserProfile): void {
  void router.push({
    name: 'user-profile-edit',
    params: { id: profile.id },
    query: selectQuery.value,
  })
}

/**
 * Gesto principal na linha (clique/Enter):
 * - modo seleção → confirma e devolve o perfil;
 * - modo gestão → abre detalhes/edição.
 */
function onRowActivate(profile: UserProfile): void {
  if (isSelectMode.value) confirmSelection(profile)
  else openDetails(profile)
}
</script>

<template>
  <PageContainer>
    <!-- Cabeçalho -->
    <header class="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-content">
          {{ isSelectMode ? 'Selecionar perfil' : 'Perfis de Usuário' }}
        </h1>
        <p class="mt-1 text-sm text-content-muted">
          {{
            isSelectMode
              ? 'Clique em um perfil (ou pressione Enter) para devolvê-lo ao cadastro.'
              : 'Modelos de cadastro que aceleram a atribuição de permissões.'
          }}
        </p>
      </div>
      <BaseButton icon="pi-plus" label="Novo perfil" @click="goNew" />
    </header>

    <!-- Faixa do modo seleção: deixa o modo explícito e oferece o cancelar. -->
    <div
      v-if="isSelectMode"
      class="flex items-center justify-between gap-3 rounded-field border border-accent/40 bg-accent/10 px-4 py-2 text-sm text-content"
    >
      <span class="flex items-center gap-2">
        <i class="pi pi-arrow-right-arrow-left text-accent" aria-hidden="true"></i>
        Modo seleção: escolha um perfil para devolver ao cadastro.
      </span>
      <BaseButton variant="neutral" icon="pi-times" label="Cancelar seleção" @click="cancelSelection" />
    </div>

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

      <!-- Grid de leitura: linha clicável + ação "Ver detalhes", scroll infinito. -->
      <BaseDataTable
        :rows="store.items"
        :columns="columns"
        :loading="store.loading"
        :has-more="store.hasMore"
        :loading-more="store.loadingMore"
        row-key="id"
        @row-click="onRowActivate"
        @load-more="store.loadNext"
      >
        <template #cell-resources="{ row }">
          <span class="text-content-soft">{{ (row as UserProfile).permissions.length }} recurso(s)</span>
        </template>
        <!-- Só existe em modo seleção (coluna condicional): é o único caminho
             para abrir o registro, já que o clique na linha confirma a seleção.
             `@click.stop` evita disparar o gesto da linha. -->
        <template #cell-actions="{ row }">
          <span class="inline-flex justify-end" @click.stop @keydown.enter.stop>
            <!-- Só ícone (o texto ocupava muito espaço); accent para destacar a
                 única ação de abrir o registro no modo seleção. Hint via title. -->
            <BaseButton
              variant="icon"
              icon="pi-eye"
              class="!text-accent hover:!bg-accent/15 hover:!text-accent-hover"
              title="Ver detalhes"
              aria-label="Ver detalhes"
              @click="openDetails(row as UserProfile)"
            />
          </span>
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
