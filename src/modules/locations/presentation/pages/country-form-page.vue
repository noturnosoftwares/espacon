<script setup lang="ts">
/**
 * CountryFormPage — cadastro/edição de País (rotas `/paises/novo` e `/paises/:id`).
 * Mesmos padrões dos demais forms (DS §9.2/§10.10/§10.11): cabeçalho com código +
 * situação, skeleton ao carregar, barra dirty-aware, resumo de validação, toast,
 * cancelar/guarda. "Excluir" = inativação lógica (§4.6).
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
  MaskedField,
  PageContainer,
  RecordCodeBadge,
  StatusBadge,
  StickyActionBar,
  useAppToast,
} from '@/shared/widgets'
import { isValidBacenCode, isValidIso2, onlyDigits } from '@/shared/extensions'
import { useCountriesStore } from '../stores'

const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const store = useCountriesStore()

const isEdit = computed(() => route.name === 'country-edit')
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

if (isEdit.value) store.clearEditing()
else store.startNew()

onMounted(() => {
  if (isEdit.value) void store.loadForEdit(Number(route.params.id))
})

const name = computed({ get: () => store.editing?.name ?? '', set: (v: string) => store.patch({ name: v }) })
const bacenCode = computed({
  get: () => store.editing?.bacenCode ?? '',
  set: (v: string) => store.patch({ bacenCode: onlyDigits(v) }),
})
const iso2 = computed({
  get: () => store.editing?.iso2 ?? '',
  set: (v: string) => store.patch({ iso2: v.toUpperCase().slice(0, 2) }),
})
const iso3 = computed({
  get: () => store.editing?.iso3 ?? '',
  set: (v: string) => store.patch({ iso3: v.toUpperCase().slice(0, 3) }),
})
const isoNumeric = computed({
  get: () => store.editing?.isoNumeric ?? '',
  set: (v: string) => store.patch({ isoNumeric: onlyDigits(v).slice(0, 3) }),
})
const siscomexCode = computed({
  get: () => store.editing?.siscomexCode ?? '',
  set: (v: string) => store.patch({ siscomexCode: v }),
})
const active = computed({ get: () => store.editing?.active ?? true, set: (v: boolean) => store.patch({ active: v }) })

const errors = computed(() => ({
  name: !store.editing?.name?.trim() ? 'Informe o nome do país.' : null,
  bacenCode: !store.editing?.bacenCode
    ? 'Informe o código BACEN.'
    : !isValidBacenCode(store.editing.bacenCode)
      ? 'O código BACEN deve ter 4 dígitos.'
      : null,
  iso2: !store.editing?.iso2
    ? 'Informe a sigla ISO (2 letras).'
    : !isValidIso2(store.editing.iso2)
      ? 'ISO alpha-2 inválido (2 letras).'
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
    toast.add({ severity: 'success', summary: 'País salvo', detail: 'As alterações foram gravadas.', life: 4000 })
    router.push({ name: 'locations-countries', query: listQuery.value })
  } else {
    notifySaveError(store.errorMessage ?? 'Não foi possível salvar o país.')
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
    router.push({ name: 'locations-countries', query: listQuery.value })
  }
}
function goBack(): void {
  router.push({ name: 'locations-countries', query: listQuery.value })
}

async function onConfirmInactivate(): Promise<void> {
  if (!store.editing?.id) return
  const ok = await store.remove(store.editing.id)
  askingInactivate.value = false
  if (ok) {
    confirmedLeave.value = true
    toast.add({ severity: 'success', summary: 'País inativado', detail: 'O registro foi inativado.', life: 4000 })
    router.push({ name: 'locations-countries', query: listQuery.value })
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
            Países
          </button>
          <h1 class="text-2xl font-bold text-content">{{ isEdit ? 'Editar país' : 'Novo país' }}</h1>
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
        <FormSection title="Identificação" icon="pi-globe">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField v-model="name" label="Nome" required :error="submitted ? errors.name : null" />
            <MaskedField
              v-model="bacenCode"
              label="Código BACEN"
              mask="9999"
              inputmode="numeric"
              hint="cPais da NF-e (ex.: Brasil 1058)."
              required
              :error="submitted ? errors.bacenCode : null"
            />
            <label
              class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3 sm:col-span-2"
            >
              <ToggleSwitch v-model="active" inputId="country-active" />
              <span class="text-sm text-content-soft">País ativo</span>
            </label>
          </div>
        </FormSection>

        <FormSection title="Códigos internacionais" icon="pi-flag">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField v-model="iso2" label="ISO alpha-2" placeholder="BR" required :error="submitted ? errors.iso2 : null" />
            <BaseTextField v-model="iso3" label="ISO alpha-3" placeholder="BRA" />
            <BaseTextField v-model="isoNumeric" label="ISO numérico" placeholder="076" inputmode="numeric" />
            <BaseTextField v-model="siscomexCode" label="SISCOMEX" hint="Comércio exterior (opcional)." />
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
      title="Inativar país?"
      :message="`“${store.editing?.name}” deixará de aparecer nos seletores, mas os registros que o referenciam são preservados.`"
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
