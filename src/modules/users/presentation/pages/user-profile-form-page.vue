<script setup lang="ts">
/**
 * UserProfileFormPage — cadastro/edição de perfil (rotas `/perfis/novo` e
 * `/perfis/:id`), dentro do `AppShell`.
 *
 * Mesmos padrões da `UserFormPage` (Design System §9.2/§10.10): campos agrupados
 * por contexto, barra de ação **fixa** dirty-aware, resumo de validação, **toast**
 * na falha de save, **cancelar com confirmação** que restaura e permanece
 * (ADR-001) e guarda de navegação. Excluir vive aqui (edição), com confirmação
 * (§8.7) e toast (§8.8). Lembrete: o perfil é só um modelo (não autoriza nada).
 */
import { computed, onMounted, ref } from 'vue'
import {
  onBeforeRouteLeave,
  useRoute,
  useRouter,
  type LocationQueryRaw,
  type RouteLocationNormalized,
} from 'vue-router'
import type { Permission } from '@/shared/access'
import {
  BaseButton,
  BaseTextField,
  ConfirmDialog,
  FormSection,
  FormSkeleton,
  PageContainer,
  StickyActionBar,
  useAppToast,
} from '@/shared/widgets'
import { useUserProfilesStore, usePermissionCatalogStore } from '../stores'
import { PermissionMatrix } from '../widgets'

const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const store = useUserProfilesStore()
const catalog = usePermissionCatalogStore()

const isEdit = computed(() => route.name === 'user-profile-edit')

// Detour de seleção (template ADR-003): quando a listagem nos abre em modo
// seleção, ela passa `mode/req` adiante. Devolvemos essa query ao voltar para a
// lista, para que a listagem **reentre em modo seleção** (e o registro recém
// editado/incluído continue selecionável). Em fluxo normal, é `undefined`.
const listQuery = computed<LocationQueryRaw | undefined>(() =>
  route.query.mode === 'select' && typeof route.query.req === 'string'
    ? { mode: 'select', req: route.query.req }
    : undefined,
)

const submitted = ref(false)
const askingDelete = ref(false)
const askingCancel = ref(false)

// Guarda de navegação (§9.2): sair com alteração não salva pede confirmação.
const askingDiscard = ref(false)
const confirmedLeave = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)

// Inicialização SÍNCRONA (antes do 1º paint): a store é singleton, então sem isto
// a tela mostraria o perfil anterior por um instante. Edição → `clearEditing` (a
// tela exibe o skeleton até carregar); novo → form em branco imediato.
if (isEdit.value) store.clearEditing()
else store.startNew()

onMounted(async () => {
  await catalog.ensureLoaded()
  if (isEdit.value) await store.loadForEdit(Number(route.params.id))
})

const description = computed({
  get: () => store.editing?.description ?? '',
  set: (value: string) => store.patch({ description: value }),
})

const permissions = computed<Permission[]>(() => store.editing?.permissions ?? [])

// Validação mínima (§10.10): descrição obrigatória + resumo ao submeter.
const errors = computed(() => ({
  description: !store.editing?.description?.trim() ? 'Informe a descrição.' : null,
}))
const invalidCount = computed(() => Object.values(errors.value).filter(Boolean).length)

/**
 * Falha de salvamento (validação OU API): mantém o informativo geral no topo e
 * **também dispara um toast** com a mesma mensagem geral (convenção de CRUD).
 */
function notifySaveError(message: string): void {
  toast.add({ severity: 'error', summary: 'Não foi possível salvar', detail: message, life: 5000 })
}

async function onSave(): Promise<void> {
  submitted.value = true
  if (invalidCount.value > 0) {
    notifySaveError(`Há ${invalidCount.value} campo(s) obrigatório(s) a preencher.`)
    return
  }
  const ok = await store.save()
  if (ok) {
    confirmedLeave.value = true
    toast.add({
      severity: 'success',
      summary: 'Perfil salvo',
      detail: 'As alterações foram gravadas.',
      life: 4000,
    })
    router.push({ name: 'user-profiles', query: listQuery.value })
  } else {
    notifySaveError(store.errorMessage ?? 'Não foi possível salvar o perfil.')
  }
}

/**
 * Cancelar (§9.2 + ADR-001): confirma antes quando há alterações não salvas;
 * após confirmar, restaura o original e permanece (edição) ou volta à lista (novo).
 */
function onCancel(): void {
  if (store.isDirty) {
    askingCancel.value = true
    return
  }
  performCancel()
}

function performCancel(): void {
  askingCancel.value = false
  const outcome = store.cancelEdit()
  submitted.value = false
  if (outcome === 'leave') {
    confirmedLeave.value = true
    router.push({ name: 'user-profiles', query: listQuery.value })
  }
}

/** Voltar pelo cabeçalho/breadcrumb: navega à lista (a guarda cuida do não salvo). */
function goBack(): void {
  router.push({ name: 'user-profiles', query: listQuery.value })
}

async function onConfirmDelete(): Promise<void> {
  if (!store.editing) return
  const ok = await store.remove(store.editing.id)
  askingDelete.value = false
  if (ok) {
    confirmedLeave.value = true
    toast.add({
      severity: 'success',
      summary: 'Perfil excluído',
      detail: 'O registro foi removido.',
      life: 4000,
    })
    router.push({ name: 'user-profiles', query: listQuery.value })
  }
}

// Intercepta a saída com alterações não salvas → confirma o descarte.
onBeforeRouteLeave((to) => {
  if (store.isDirty && !confirmedLeave.value) {
    pendingRoute.value = to
    askingDiscard.value = true
    return false
  }
  return true
})

function onConfirmDiscard(): void {
  confirmedLeave.value = true
  askingDiscard.value = false
  if (pendingRoute.value) router.push(pendingRoute.value.fullPath)
}

function onCancelDiscard(): void {
  askingDiscard.value = false
  pendingRoute.value = null
}
</script>

<template>
  <div class="flex min-h-0 flex-1 flex-col">
    <!-- Conteúdo do formulário (área que rola) — espaçamento via PageContainer (§4). -->
    <PageContainer>
      <!-- Cabeçalho -->
      <header class="flex flex-wrap items-end justify-between gap-3">
        <div>
          <button
            type="button"
            class="ds-focus-ring mb-2 inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content"
            @click="goBack"
          >
            <i class="pi pi-arrow-left text-xs" aria-hidden="true"></i>
            Perfis
          </button>
          <h1 class="text-2xl font-bold text-content">
            {{ isEdit ? 'Editar perfil' : 'Novo perfil' }}
          </h1>
          <p class="mt-1 text-sm text-content-muted">
            Modelo de cadastro — ao ser aplicado, redefine as ações do usuário.
          </p>
        </div>
        <BaseButton
          v-if="isEdit && store.editing"
          variant="danger"
          icon="pi-trash"
          label="Excluir"
          @click="askingDelete = true"
        />
      </header>

      <!-- Resumo de validação (§10.10) -->
      <p
        v-if="submitted && invalidCount > 0"
        class="flex items-center gap-2 rounded-field border border-danger/40 bg-danger-soft px-4 py-2 text-sm text-danger"
      >
        <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
        Há {{ invalidCount }} campo(s) obrigatório(s) a preencher.
      </p>
      <p
        v-else-if="store.hasError"
        class="flex items-center gap-2 rounded-field border border-danger/40 bg-danger-soft px-4 py-2 text-sm text-danger"
      >
        <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
        {{ store.errorMessage }}
      </p>

      <!-- Carregando o registro (ou ainda sem o registro, em edição): skeleton em
           vez do conteúdo anterior (§10.11). -->
      <FormSkeleton v-if="store.loading || (isEdit && !store.editing)" :sections="2" :fields="2" />

      <template v-else-if="store.editing">
        <!-- Dados do perfil -->
        <FormSection title="Dados do perfil" icon="pi-id-card">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField
              v-model="description"
              label="Descrição"
              placeholder="Ex.: Administrativo"
              required
              :error="submitted ? errors.description : null"
            />
          </div>
        </FormSection>

        <!-- Permissões -->
        <FormSection
          title="Permissões (recurso × ação)"
          icon="pi-shield"
          description="Ao aplicar este perfil a um usuário, estas ações redefinem as dele."
        >
          <p v-if="catalog.loading" class="text-sm text-content-muted">Carregando catálogo…</p>
          <PermissionMatrix
            v-else
            :sections="catalog.sections"
            :modelValue="permissions"
            @update:modelValue="(v) => store.setPermissions(v)"
          />
        </FormSection>
      </template>
    </PageContainer>

    <!-- Rodapé de ações (§10.10): FORA da área de rolagem. Só com alteração. -->
    <StickyActionBar v-if="store.editing && store.isDirty">
      <template #start>
        <span class="flex items-center gap-1.5">
          <i class="pi pi-pencil text-xs" aria-hidden="true"></i>
          Alterações não salvas
        </span>
      </template>
      <BaseButton variant="neutral" label="Cancelar" @click="onCancel" />
      <BaseButton icon="pi-check" label="Salvar" :loading="store.isSaving" @click="onSave" />
    </StickyActionBar>

    <!-- Confirmação de exclusão (§8.7) -->
    <ConfirmDialog
      :visible="askingDelete"
      purpose="danger"
      title="Excluir perfil?"
      :message="`Confirma a exclusão de ${store.editing?.description}? Usuários já cadastrados não são afetados (o perfil é só um modelo).`"
      confirmLabel="Excluir"
      confirmIcon="pi-trash"
      :loading="store.isDeleting"
      @confirm="onConfirmDelete"
      @update:visible="(v) => (askingDelete = v)"
    />

    <!-- Confirmação de cancelamento (§9.2): cancelar descarta alterações. -->
    <ConfirmDialog
      :visible="askingCancel"
      purpose="danger"
      title="Cancelar alterações?"
      :message="
        isEdit
          ? 'As alterações serão desfeitas e o registro voltará ao estado salvo.'
          : 'O cadastro em andamento será descartado.'
      "
      confirmLabel="Sim, cancelar"
      confirmIcon="pi-undo"
      cancelLabel="Continuar editando"
      @confirm="performCancel"
      @update:visible="(v) => (askingCancel = v)"
    />

    <!-- Guarda de navegação (§9.2): descartar alterações não salvas ao sair. -->
    <ConfirmDialog
      :visible="askingDiscard"
      purpose="danger"
      title="Descartar alterações?"
      message="Você tem alterações não salvas. Se sair agora, elas serão perdidas."
      confirmLabel="Descartar"
      confirmIcon="pi-trash"
      cancelLabel="Continuar editando"
      @confirm="onConfirmDiscard"
      @update:visible="(v) => { if (!v) onCancelDiscard() }"
    />
  </div>
</template>
