<script setup lang="ts">
/**
 * CashOperatorFormPage — cadastro/edição de operador de caixa (rotas
 * `/operadores-de-caixa/novo` e `/operadores-de-caixa/:id`), dentro do `AppShell`.
 *
 * Mesmos padrões da `UserProfileFormPage` (Design System §9.2/§10.10): campos
 * agrupados, barra de ação **fixa** dirty-aware, resumo de validação, **toast** na
 * falha de save, **cancelar com confirmação** que restaura e permanece (ADR-001)
 * e guarda de navegação. "Excluir" aqui é **inativação lógica** (spec — "inativar,
 * não apagar"): o registro permanece com `active = false`. O `código` é a chave de
 * vínculo e fica **imutável após a criação**.
 */
import { computed, onMounted, ref } from 'vue'
import {
  onBeforeRouteLeave,
  useRoute,
  useRouter,
  type LocationQueryRaw,
  type RouteLocationNormalized,
} from 'vue-router'
import ToggleSwitch from 'primevue/toggleswitch'
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
import { useCashOperatorsStore } from '../stores'

const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const store = useCashOperatorsStore()

const isEdit = computed(() => route.name === 'cash-operator-edit')

// Detour de seleção (template ADR-003): quando a listagem nos abre em modo
// seleção, ela passa `mode/req` adiante. Devolvemos essa query ao voltar à lista,
// para que ela **reentre em modo seleção** (e o registro recém criado/editado
// continue selecionável). Em fluxo normal, é `undefined`.
const listQuery = computed<LocationQueryRaw | undefined>(() =>
  route.query.mode === 'select' && typeof route.query.req === 'string'
    ? { mode: 'select', req: route.query.req }
    : undefined,
)

const submitted = ref(false)
const askingInactivate = ref(false)
const askingCancel = ref(false)

// Guarda de navegação (§9.2): sair com alteração não salva pede confirmação.
const askingDiscard = ref(false)
const confirmedLeave = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)

// Inicialização SÍNCRONA (antes do 1º paint): a store é singleton, então sem isto
// a tela mostraria o registro anterior por um instante. Edição → `clearEditing` (a
// tela exibe o skeleton até carregar); novo → form em branco imediato.
if (isEdit.value) store.clearEditing()
else store.startNew()

onMounted(() => {
  if (isEdit.value) void store.loadForEdit(Number(route.params.id))
})

const code = computed({
  get: () => store.editing?.code ?? '',
  set: (value: string) => store.patch({ code: value }),
})
const name = computed({
  get: () => store.editing?.name ?? '',
  set: (value: string) => store.patch({ name: value }),
})
const active = computed({
  get: () => store.editing?.active ?? true,
  set: (value: boolean) => store.patch({ active: value }),
})

// Validação mínima (§10.10): código e nome obrigatórios + resumo ao submeter.
const errors = computed(() => ({
  code: !store.editing?.code?.trim() ? 'Informe o código do operador.' : null,
  name: !store.editing?.name?.trim() ? 'Informe o nome do operador.' : null,
}))
const invalidCount = computed(() => Object.values(errors.value).filter(Boolean).length)

/**
 * Falha de salvamento (validação OU API, ex.: código duplicado): mantém o
 * informativo geral no topo e **também dispara um toast** (convenção de CRUD).
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
      summary: 'Operador salvo',
      detail: 'As alterações foram gravadas.',
      life: 4000,
    })
    router.push({ name: 'cash-operators', query: listQuery.value })
  } else {
    notifySaveError(store.errorMessage ?? 'Não foi possível salvar o operador.')
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
    router.push({ name: 'cash-operators', query: listQuery.value })
  }
}

/** Voltar pelo cabeçalho: navega à lista (a guarda cuida do não salvo). */
function goBack(): void {
  router.push({ name: 'cash-operators', query: listQuery.value })
}

/** "Excluir" = inativação lógica (spec): marca `active = false` e volta à lista. */
async function onConfirmInactivate(): Promise<void> {
  if (!store.editing) return
  const ok = await store.remove(store.editing.id)
  askingInactivate.value = false
  if (ok) {
    confirmedLeave.value = true
    toast.add({
      severity: 'success',
      summary: 'Operador inativado',
      detail: 'O operador não aparece mais nos seletores, mas o histórico é preservado.',
      life: 4000,
    })
    router.push({ name: 'cash-operators', query: listQuery.value })
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
            Operadores de Caixa
          </button>
          <h1 class="text-2xl font-bold text-content">
            {{ isEdit ? 'Editar operador' : 'Novo operador' }}
          </h1>
          <p class="mt-1 text-sm text-content-muted">
            Registro mestre referenciado por usuários e pelos módulos financeiros.
          </p>
        </div>
        <!-- "Inativar" só faz sentido num registro ativo já salvo (inativação lógica). -->
        <BaseButton
          v-if="isEdit && store.editing?.active"
          variant="neutral"
          icon="pi-ban"
          label="Inativar"
          @click="askingInactivate = true"
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
      <FormSkeleton v-if="store.loading || (isEdit && !store.editing)" :sections="1" :fields="3" />

      <template v-else-if="store.editing">
        <FormSection title="Dados do operador" icon="pi-wallet">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField
              v-model="code"
              label="Código"
              placeholder="Ex.: 001"
              required
              :disabled="isEdit"
              :hint="isEdit ? 'O código é a chave de vínculo e não pode ser alterado.' : 'Único — chave de vínculo com usuários e financeiro.'"
              :error="submitted ? errors.code : null"
            />
            <BaseTextField
              v-model="name"
              label="Nome"
              placeholder="Ex.: Caixa Principal"
              required
              :error="submitted ? errors.name : null"
            />
            <label
              class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3 sm:col-span-2"
            >
              <ToggleSwitch v-model="active" inputId="operator-active" />
              <span class="text-sm text-content-soft">Operador ativo</span>
            </label>
          </div>
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

    <!-- Confirmação de inativação (§8.7): exclusão lógica, reversível. -->
    <ConfirmDialog
      :visible="askingInactivate"
      purpose="confirm"
      title="Inativar operador?"
      :message="`“${store.editing?.code} — ${store.editing?.name}” deixará de aparecer nos seletores de novos lançamentos, mas os registros que já o referenciam são preservados. Você pode reativá-lo depois.`"
      confirmLabel="Inativar"
      confirmIcon="pi-ban"
      :loading="store.isDeleting"
      @confirm="onConfirmInactivate"
      @update:visible="(v) => (askingInactivate = v)"
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
