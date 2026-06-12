<script setup lang="ts">
/**
 * StateFormPage — cadastro/edição de Estado/UF (rotas `/estados/novo` e
 * `/estados/:id`). País é escolhido por **lookup** (abre a listagem de Países em
 * modo seleção e volta — ADR-003). A **região** é derivada do `cUF` (Brasil). cUF
 * e região só se aplicam ao Brasil (H7). Campos fiscais da Reforma já estruturados.
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
import { restoreSelectionFocus, useSelectionStore } from '@/shared/selection'
import {
  BaseButton,
  BaseTextField,
  ConfirmDialog,
  CountryLookupField,
  FormSection,
  FormSkeleton,
  MaskedField,
  PageContainer,
  RecordCodeBadge,
  StatusBadge,
  StickyActionBar,
  useAppToast,
} from '@/shared/widgets'
import { isValidIbgeUf, normalizeText, onlyDigits } from '@/shared/extensions'
import { useStatesStore } from '../stores'
import { type Country, brazilRegionLabel, regionFromIbgeUf } from '../../domain/models'

const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const store = useStatesStore()
const selection = useSelectionStore()

const isEdit = computed(() => route.name === 'state-edit')
const listQuery = computed<LocationQueryRaw | undefined>(() =>
  route.query.mode === 'select' && typeof route.query.req === 'string'
    ? { mode: 'select', req: route.query.req }
    : undefined,
)

const submitted = ref(false)
const askingInactivate = ref(false)
const askingCancel = ref(false)
const askingDiscard = ref(false)
const confirmedLeave = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)

// Inicialização + retorno do lookup de País (mesmo padrão do cadastro de usuário).
const pendingSelectionId = selection.pendingFor(route.path)
const isSelectionReturn =
  !!pendingSelectionId &&
  !!store.editing &&
  (isEdit.value ? store.editing.id === Number(route.params.id) : store.isNewRecord)

if (!isSelectionReturn) {
  if (isEdit.value) store.clearEditing()
  else store.startNew()
}

onMounted(() => {
  if (isSelectionReturn && pendingSelectionId) {
    const request = selection.get(pendingSelectionId)
    const result = selection.consume(pendingSelectionId)
    if (result?.status === 'selected') applyCountry(result.data as Country)
    restoreSelectionFocus(request?.focusId)
    return
  }
  if (pendingSelectionId) selection.consume(pendingSelectionId)
  if (isEdit.value) void store.loadForEdit(Number(route.params.id))
})

function applyCountry(country: Country): void {
  store.patch({ countryId: country.id ?? 0, countryName: country.name })
}
function onCountryClear(): void {
  store.patch({ countryId: 0, countryName: '' })
}

const isBrazil = computed(() => normalizeText(store.editing?.countryName ?? '') === 'brasil')

const ibgeCode = computed({
  get: () => store.editing?.ibgeCode ?? '',
  set: (v: string) => {
    const code = onlyDigits(v).slice(0, 2)
    store.patch({ ibgeCode: code, region: regionFromIbgeUf(code) })
  },
})
const uf = computed({
  get: () => store.editing?.uf ?? '',
  set: (v: string) => store.patch({ uf: v.toUpperCase().slice(0, 2) }),
})
const name = computed({ get: () => store.editing?.name ?? '', set: (v: string) => store.patch({ name: v }) })
const active = computed({ get: () => store.editing?.active ?? true, set: (v: boolean) => store.patch({ active: v }) })
const hasHybridCompetence = computed({
  get: () => store.editing?.hasHybridCompetence ?? false,
  set: (v: boolean) => store.patch({ hasHybridCompetence: v }),
})
const ibsStateRate = computed({
  get: () => (store.editing?.ibsStateRate ?? '') === '' ? '' : String(store.editing?.ibsStateRate ?? ''),
  set: (v: string) => store.patch({ ibsStateRate: v.trim() === '' ? null : Number(v) }),
})
const ibsStateReferenceRate = computed({
  get: () => (store.editing?.ibsStateReferenceRate ?? '') === '' ? '' : String(store.editing?.ibsStateReferenceRate ?? ''),
  set: (v: string) => store.patch({ ibsStateReferenceRate: v.trim() === '' ? null : Number(v) }),
})

const errors = computed(() => ({
  countryId: !store.editing?.countryId ? 'Selecione o país.' : null,
  uf: !store.editing?.uf?.trim()
    ? 'Informe a sigla (UF).'
    : store.editing.uf.trim().length !== 2
      ? 'A sigla deve ter 2 letras.'
      : null,
  name: !store.editing?.name?.trim() ? 'Informe o nome do estado.' : null,
  ibgeCode:
    isBrazil.value && !store.editing?.ibgeCode
      ? 'Informe o código IBGE (cUF).'
      : store.editing?.ibgeCode && !isValidIbgeUf(store.editing.ibgeCode)
        ? 'Código IBGE de UF inválido.'
        : null,
}))
const invalidCount = computed(() => Object.values(errors.value).filter(Boolean).length)

function notifySaveError(message: string): void {
  toast.add({ severity: 'error', summary: 'Não foi possível salvar', detail: message, life: 5000 })
}

async function onSave(): Promise<void> {
  submitted.value = true
  if (invalidCount.value > 0) {
    notifySaveError(`Há ${invalidCount.value} campo(s) com pendência a corrigir.`)
    return
  }
  const ok = await store.save()
  if (ok) {
    confirmedLeave.value = true
    toast.add({ severity: 'success', summary: 'Estado salvo', detail: 'As alterações foram gravadas.', life: 4000 })
    router.push({ name: 'locations-states', query: listQuery.value })
  } else {
    notifySaveError(store.errorMessage ?? 'Não foi possível salvar o estado.')
  }
}

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
    router.push({ name: 'locations-states', query: listQuery.value })
  }
}
function goBack(): void {
  router.push({ name: 'locations-states', query: listQuery.value })
}

async function onConfirmInactivate(): Promise<void> {
  if (!store.editing?.id) return
  const ok = await store.remove(store.editing.id)
  askingInactivate.value = false
  if (ok) {
    confirmedLeave.value = true
    toast.add({ severity: 'success', summary: 'Estado inativado', detail: 'O registro foi inativado.', life: 4000 })
    router.push({ name: 'locations-states', query: listQuery.value })
  }
}

onBeforeRouteLeave((to) => {
  if (to.query?.mode === 'select') return true
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
    <PageContainer>
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            class="ds-focus-ring mb-2 inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content"
            @click="goBack"
          >
            <i class="pi pi-arrow-left text-xs" aria-hidden="true"></i>
            Estados
          </button>
          <h1 class="text-2xl font-bold text-content">{{ isEdit ? 'Editar estado' : 'Novo estado' }}</h1>
          <div v-if="store.editing" class="mt-2 flex flex-wrap items-center gap-2">
            <RecordCodeBadge :code="store.editing.id" />
            <StatusBadge
              :severity="store.editing.active ? 'success' : 'neutral'"
              :label="store.editing.active ? 'Ativo' : 'Inativo'"
            />
          </div>
        </div>
        <BaseButton
          v-if="isEdit && store.editing?.active"
          variant="neutral"
          icon="pi-ban"
          label="Inativar"
          @click="askingInactivate = true"
        />
      </header>

      <p
        v-if="submitted && invalidCount > 0"
        class="flex items-center gap-2 rounded-field border border-danger/40 bg-danger-soft px-4 py-2 text-sm text-danger"
      >
        <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
        Há {{ invalidCount }} campo(s) com pendência a corrigir.
      </p>
      <p
        v-else-if="store.hasError"
        class="flex items-center gap-2 rounded-field border border-danger/40 bg-danger-soft px-4 py-2 text-sm text-danger"
      >
        <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
        {{ store.errorMessage }}
      </p>

      <FormSkeleton v-if="store.loading || (isEdit && !store.editing)" :sections="2" :fields="3" />

      <template v-else-if="store.editing">
        <FormSection title="Identificação" icon="pi-map">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <CountryLookupField
              :model-value="store.editing.countryId || null"
              :name="store.editing.countryName"
              label="País"
              focus-id="state-country"
              required
              :error="submitted ? errors.countryId : null"
              @clear="onCountryClear"
            />
            <MaskedField
              v-model="ibgeCode"
              label="Código IBGE (cUF)"
              mask="99"
              inputmode="numeric"
              :hint="isBrazil ? 'cUF da NF-e (ex.: SP 35).' : 'Não aplicável a país estrangeiro.'"
              :required="isBrazil"
              :error="submitted ? errors.ibgeCode : null"
            />
            <BaseTextField v-model="uf" label="Sigla (UF)" placeholder="SP" required :error="submitted ? errors.uf : null" />
            <BaseTextField v-model="name" label="Nome" required :error="submitted ? errors.name : null" />
            <BaseTextField
              :model-value="brazilRegionLabel(store.editing.region)"
              label="Região"
              hint="Derivada do código IBGE (Brasil)."
              disabled
            />
            <label
              class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3"
            >
              <ToggleSwitch v-model="active" inputId="state-active" />
              <span class="text-sm text-content-soft">Estado ativo</span>
            </label>
          </div>
        </FormSection>

        <FormSection title="Fiscal (Reforma Tributária)" icon="pi-percentage">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField v-model="ibsStateRate" label="Alíquota IBS estadual (%)" type="number" inputmode="numeric" hint="Opcional — definida por lei." />
            <BaseTextField v-model="ibsStateReferenceRate" label="Alíquota de referência (%)" type="number" inputmode="numeric" hint="Baliza do Senado (opcional)." />
            <label
              class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3 sm:col-span-2"
            >
              <ToggleSwitch v-model="hasHybridCompetence" inputId="state-hybrid" />
              <span class="text-sm text-content-soft">Competência híbrida (estadual + municipal — caso do DF)</span>
            </label>
          </div>
        </FormSection>
      </template>
    </PageContainer>

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

    <ConfirmDialog
      :visible="askingInactivate"
      purpose="confirm"
      title="Inativar estado?"
      :message="`“${store.editing?.uf} — ${store.editing?.name}” será inativado; os registros que o referenciam são preservados.`"
      confirmLabel="Inativar"
      confirmIcon="pi-ban"
      :loading="store.isDeleting"
      @confirm="onConfirmInactivate"
      @update:visible="(v) => (askingInactivate = v)"
    />
    <ConfirmDialog
      :visible="askingCancel"
      purpose="danger"
      title="Cancelar alterações?"
      :message="isEdit ? 'As alterações serão desfeitas e o registro voltará ao estado salvo.' : 'O cadastro em andamento será descartado.'"
      confirmLabel="Sim, cancelar"
      confirmIcon="pi-undo"
      cancelLabel="Continuar editando"
      @confirm="performCancel"
      @update:visible="(v) => (askingCancel = v)"
    />
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
