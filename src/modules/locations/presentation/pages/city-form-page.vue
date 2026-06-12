<script setup lang="ts">
/**
 * CityFormPage — cadastro/edição de Cidade (rotas `/cidades/novo` e `/cidades/:id`).
 * Estado é escolhido por **lookup** (abre a listagem de Estados em modo seleção);
 * selecionar o estado **preenche UF e País** (somente leitura — H3). cMun só se
 * aplica ao Brasil (H7). Campos fiscais municipais da Reforma já estruturados.
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
import { useSelectionStore } from '@/shared/selection'
import {
  BaseButton,
  BaseTextField,
  ConfirmDialog,
  FormSection,
  FormSkeleton,
  MaskedField,
  PageContainer,
  RecordCodeBadge,
  StateLookupField,
  StatusBadge,
  StickyActionBar,
  useAppToast,
} from '@/shared/widgets'
import { isValidIbgeMunicipality, normalizeText, onlyDigits } from '@/shared/extensions'
import { useCitiesStore } from '../stores'
import type { State } from '../../domain/models'

const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const store = useCitiesStore()
const selection = useSelectionStore()

const isEdit = computed(() => route.name === 'city-edit')
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
    const result = selection.consume(pendingSelectionId)
    if (result?.status === 'selected') applyState(result.data as State)
    return
  }
  if (pendingSelectionId) selection.consume(pendingSelectionId)
  if (isEdit.value) void store.loadForEdit(Number(route.params.id))
})

/** Selecionar o estado preenche UF e País (denormalizados, somente leitura). */
function applyState(state: State): void {
  store.patch({
    stateId: state.id ?? 0,
    uf: state.uf,
    countryId: state.countryId,
    countryName: state.countryName,
  })
}
function onStateClear(): void {
  store.patch({ stateId: 0, uf: '', countryId: 0, countryName: '' })
}

const isBrazil = computed(() => normalizeText(store.editing?.countryName ?? '') === 'brasil')

const ibgeCode = computed({
  get: () => store.editing?.ibgeCode ?? '',
  set: (v: string) => store.patch({ ibgeCode: onlyDigits(v).slice(0, 7) }),
})
const name = computed({ get: () => store.editing?.name ?? '', set: (v: string) => store.patch({ name: v }) })
const tomCode = computed({ get: () => store.editing?.tomCode ?? '', set: (v: string) => store.patch({ tomCode: onlyDigits(v) }) })
const active = computed({ get: () => store.editing?.active ?? true, set: (v: boolean) => store.patch({ active: v }) })
const isCapital = computed({ get: () => store.editing?.isCapital ?? false, set: (v: boolean) => store.patch({ isCapital: v }) })
const hasSpecialMunicipalCompetence = computed({
  get: () => store.editing?.hasSpecialMunicipalCompetence ?? false,
  set: (v: boolean) => store.patch({ hasSpecialMunicipalCompetence: v }),
})

function numberToText(value: number | null): string {
  return value == null ? '' : String(value)
}
const latitude = computed({
  get: () => numberToText(store.editing?.latitude ?? null),
  set: (v: string) => store.patch({ latitude: v.trim() === '' ? null : Number(v) }),
})
const longitude = computed({
  get: () => numberToText(store.editing?.longitude ?? null),
  set: (v: string) => store.patch({ longitude: v.trim() === '' ? null : Number(v) }),
})
const ibsMunicipalRate = computed({
  get: () => numberToText(store.editing?.ibsMunicipalRate ?? null),
  set: (v: string) => store.patch({ ibsMunicipalRate: v.trim() === '' ? null : Number(v) }),
})
const ibsMunicipalReferenceRate = computed({
  get: () => numberToText(store.editing?.ibsMunicipalReferenceRate ?? null),
  set: (v: string) => store.patch({ ibsMunicipalReferenceRate: v.trim() === '' ? null : Number(v) }),
})

const errors = computed(() => ({
  stateId: !store.editing?.stateId ? 'Selecione o estado.' : null,
  name: !store.editing?.name?.trim() ? 'Informe o nome da cidade.' : null,
  ibgeCode:
    isBrazil.value && !store.editing?.ibgeCode
      ? 'Informe o código IBGE (cMun).'
      : store.editing?.ibgeCode && !isValidIbgeMunicipality(store.editing.ibgeCode)
        ? 'Código IBGE de município inválido (7 dígitos + DV).'
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
    toast.add({ severity: 'success', summary: 'Cidade salva', detail: 'As alterações foram gravadas.', life: 4000 })
    router.push({ name: 'locations-cities', query: listQuery.value })
  } else {
    notifySaveError(store.errorMessage ?? 'Não foi possível salvar a cidade.')
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
    router.push({ name: 'locations-cities', query: listQuery.value })
  }
}
function goBack(): void {
  router.push({ name: 'locations-cities', query: listQuery.value })
}

async function onConfirmInactivate(): Promise<void> {
  if (!store.editing?.id) return
  const ok = await store.remove(store.editing.id)
  askingInactivate.value = false
  if (ok) {
    confirmedLeave.value = true
    toast.add({ severity: 'success', summary: 'Cidade inativada', detail: 'O registro foi inativado.', life: 4000 })
    router.push({ name: 'locations-cities', query: listQuery.value })
  }
}

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
    <PageContainer>
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            class="ds-focus-ring mb-2 inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content"
            @click="goBack"
          >
            <i class="pi pi-arrow-left text-xs" aria-hidden="true"></i>
            Cidades
          </button>
          <h1 class="text-2xl font-bold text-content">{{ isEdit ? 'Editar cidade' : 'Nova cidade' }}</h1>
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
        <FormSection title="Identificação" icon="pi-map-marker">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <StateLookupField
              :model-value="store.editing.stateId || null"
              :name="store.editing.uf"
              label="Estado (UF)"
              hint="Selecionar o estado preenche UF e País."
              required
              :error="submitted ? errors.stateId : null"
              @clear="onStateClear"
            />
            <BaseTextField :model-value="store.editing.uf" label="UF" hint="Preenchida pelo estado." disabled />
            <BaseTextField :model-value="store.editing.countryName" label="País" hint="Preenchido pelo estado." disabled />
            <MaskedField
              v-model="ibgeCode"
              label="Código IBGE (cMun)"
              mask="9999999"
              inputmode="numeric"
              :hint="isBrazil ? '7 dígitos com DV (ex.: São Paulo 3550308).' : 'Não aplicável a país estrangeiro.'"
              :required="isBrazil"
              :error="submitted ? errors.ibgeCode : null"
            />
            <BaseTextField v-model="name" label="Nome" required :error="submitted ? errors.name : null" />
            <BaseTextField v-model="tomCode" label="Código TOM/SIAFI" inputmode="numeric" hint="Opcional." />
            <label
              class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3 sm:col-span-2"
            >
              <ToggleSwitch v-model="isCapital" inputId="city-capital" />
              <span class="text-sm text-content-soft">É capital do estado</span>
            </label>
            <label
              class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3 sm:col-span-2"
            >
              <ToggleSwitch v-model="active" inputId="city-active" />
              <span class="text-sm text-content-soft">Cidade ativa</span>
            </label>
          </div>
        </FormSection>

        <FormSection title="Localização" icon="pi-compass">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField v-model="latitude" label="Latitude" type="number" inputmode="numeric" hint="Reuso no mapa (opcional)." />
            <BaseTextField v-model="longitude" label="Longitude" type="number" inputmode="numeric" hint="Reuso no mapa (opcional)." />
          </div>
        </FormSection>

        <FormSection title="Fiscal (Reforma Tributária)" icon="pi-percentage">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField v-model="ibsMunicipalRate" label="Alíquota IBS municipal (%)" type="number" inputmode="numeric" hint="Opcional — definida por lei." />
            <BaseTextField v-model="ibsMunicipalReferenceRate" label="Alíquota de referência (%)" type="number" inputmode="numeric" hint="Baliza do Senado (opcional)." />
            <label
              class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3 sm:col-span-2"
            >
              <ToggleSwitch v-model="hasSpecialMunicipalCompetence" inputId="city-special" />
              <span class="text-sm text-content-soft">Competência municipal especial (ex.: Fernando de Noronha)</span>
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
      title="Inativar cidade?"
      :message="`“${store.editing?.name}” será inativada; os registros que a referenciam são preservados.`"
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
