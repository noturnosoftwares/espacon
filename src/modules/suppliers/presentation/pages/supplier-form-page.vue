<script setup lang="ts">
/**
 * SupplierFormPage — cadastro/edição de fornecedor (rotas `/fornecedores/novo` e
 * `/fornecedores/:id`). Aba **Cadastro** dividida em **sub-abas** (`FormTabs`):
 * Dados Gerais, Endereço, Contato, Fiscal, Bancário, Observações (spec §15).
 *
 * Padrões: cabeçalho com código + situação + **Natureza** (genérico/PF/PJ, troca
 * com confirmação — N5); endereço/banco via seções compartilhadas (ADR-010);
 * Cidade por `CityLookupField` (modo seleção / ADR-003) com retorno de foco;
 * e-mail lowercase; **Apagar = inativação soft** (§4.6); barra de ação dirty-aware;
 * skeleton ao carregar; guarda de navegação (libera abrir lookup).
 */
import { computed, onMounted, ref } from 'vue'
import {
  onBeforeRouteLeave,
  useRoute,
  useRouter,
  type RouteLocationNormalized,
} from 'vue-router'
import ToggleSwitch from 'primevue/toggleswitch'
import Textarea from 'primevue/textarea'
import { restoreSelectionFocus, useSelectionStore } from '@/shared/selection'
import {
  AddressSection,
  BankAccountSection,
  BaseButton,
  BaseSelect,
  BaseTextField,
  ConfirmDialog,
  FormSection,
  FormSkeleton,
  FormTabs,
  MaskedField,
  PageContainer,
  RecordCodeBadge,
  StatusBadge,
  StickyActionBar,
  useAppToast,
} from '@/shared/widgets'
import { type PersonAddress, type BankAccount, copyPersonAddress } from '@/shared/domain'
import {
  isCepWithinUf,
  isValidCep,
  isValidCnpj,
  isValidCpf,
  isValidEmail,
  isValidMobilePhone,
  isValidPhone,
  isValidStateRegistration,
  normalizeCnpj,
  normalizeEmail,
  onlyDigits,
} from '@/shared/extensions'
import { useSuppliersStore } from '../stores'
import {
  type Supplier,
  IE_INDICATORS,
  SUPPLIER_TYPES,
  SupplierStatus,
  SupplierType,
  TAX_REGIMES,
  documentLabel,
  ieIndicatorLabel,
  isGenericType,
  legalNameLabel,
  stateRegistrationLabel,
  supplierStatusLabel,
  supplierStatusSeverity,
  supplierTypeLabel,
  taxRegimeLabel,
} from '../../domain/models'
import type { City } from '@/modules/locations/domain/models'

const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const store = useSuppliersStore()
const selection = useSelectionStore()

const isEdit = computed(() => route.name === 'supplier-edit')
const submitted = ref(false)
const activeTab = ref('dados-gerais')
const askingDelete = ref(false)
const askingCancel = ref(false)
const askingDiscard = ref(false)
const askingTypeChange = ref(false)
const pendingType = ref<SupplierType | null>(null)
const confirmedLeave = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)

// Inicialização + retorno do lookup de Cidade (ADR-003), igual ao Funcionário.
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
    if (result?.status === 'selected' && request?.resource === 'cidades') applyAddressCity(result.data as City)
    restoreSelectionFocus(request?.focusId)
    return
  }
  if (pendingSelectionId) selection.consume(pendingSelectionId)
  if (isEdit.value) void store.loadForEdit(Number(route.params.id))
})

// ── Natureza ────────────────────────────────────────────────────────────────
const TYPE_OPTIONS = SUPPLIER_TYPES.map((value) => ({ label: supplierTypeLabel(value), value }))
const isGeneric = computed(() => (store.editing ? isGenericType(store.editing.type) : false))

function hasIdentifyingData(): boolean {
  const e = store.editing
  return !!e && (!!e.document || !!e.legalName.trim() || !!e.stateRegistration.trim())
}
function onTypeChange(value: SupplierType | undefined): void {
  if (!value || !store.editing || value === store.editing.type) return
  if (hasIdentifyingData()) {
    pendingType.value = value
    askingTypeChange.value = true
  } else {
    applyType(value)
  }
}
function applyType(value: SupplierType): void {
  // Trocar a natureza limpa documento/IE (máscara e regra mudam — N4/N5).
  store.patch({ type: value, document: '', stateRegistration: '' })
}
function confirmTypeChange(): void {
  if (pendingType.value) applyType(pendingType.value)
  pendingType.value = null
  askingTypeChange.value = false
}
function cancelTypeChange(): void {
  pendingType.value = null
  askingTypeChange.value = false
}

// ── Opções de combobox ──────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { label: supplierStatusLabel(SupplierStatus.Active), value: SupplierStatus.Active },
  { label: supplierStatusLabel(SupplierStatus.Inactive), value: SupplierStatus.Inactive },
]
const TAX_REGIME_OPTIONS = TAX_REGIMES.map((value) => ({ label: taxRegimeLabel(value), value }))
const IE_INDICATOR_OPTIONS = IE_INDICATORS.map((value) => ({ label: ieIndicatorLabel(value), value }))

// ── Bindings (imutável via store.patch) ─────────────────────────────────────
function text(key: keyof Supplier) {
  return computed<string>({
    get: () => (store.editing?.[key] as string | null | undefined) ?? '',
    set: (value) => store.patch({ [key]: value } as unknown as Partial<Supplier>),
  })
}
const legalName = text('legalName')
const tradeName = text('tradeName')
const stateRegistration = text('stateRegistration')
const phone = computed<string>({
  get: () => store.editing?.phone ?? '',
  set: (v) => store.patch({ phone: onlyDigits(v) }),
})
const fax = computed<string>({
  get: () => store.editing?.fax ?? '',
  set: (v) => store.patch({ fax: onlyDigits(v) }),
})
const mobile = computed<string>({
  get: () => store.editing?.mobile ?? '',
  set: (v) => store.patch({ mobile: onlyDigits(v) }),
})
const contactName = text('contactName')
const email = computed<string>({
  get: () => store.editing?.email ?? '',
  set: (v) => store.patch({ email: normalizeEmail(v) }),
})
const salesRepName = text('salesRepName')
const salesRepPhone = computed<string>({
  get: () => store.editing?.salesRepPhone ?? '',
  set: (v) => store.patch({ salesRepPhone: onlyDigits(v) }),
})
const notes = text('notes')

const documentMask = computed(() =>
  store.editing?.type === SupplierType.Individual ? '999.999.999-99' : '**.***.***/****-99',
)
const document = computed<string>({
  get: () => store.editing?.document ?? '',
  set: (v) =>
    store.patch({
      document: store.editing?.type === SupplierType.Individual ? onlyDigits(v) : normalizeCnpj(v),
    }),
})

const status = computed<SupplierStatus>({
  get: () => store.editing?.status ?? SupplierStatus.Active,
  set: (v) => store.patch({ status: v }),
})

// Endereço / Banco — seções compartilhadas (controladas pela store).
function onAddressUpdate(value: PersonAddress): void {
  store.patch({ address: value })
}
function applyAddressCity(city: City): void {
  if (!store.editing) return
  store.patch({
    address: copyPersonAddress(store.editing.address, {
      cityId: city.id,
      cityName: city.name,
      uf: city.uf,
      countryId: city.countryId,
      countryName: city.countryName,
    }),
  })
}
function onBankUpdate(value: BankAccount): void {
  store.patch({ bankAccount: value })
}

// Fiscal — patch parcial no sub-objeto.
function patchFiscal(changes: Partial<Supplier['fiscal']>): void {
  if (store.editing) store.patch({ fiscal: { ...store.editing.fiscal, ...changes } })
}

// ── Validação (spec §4.2/§4.3) ──────────────────────────────────────────────
const errors = computed(() => {
  const e = store.editing
  const blank: Record<string, string | null> = {}
  if (!e) return blank
  // Genérico: só Razão + Situação (D2).
  if (isGenericType(e.type)) {
    return { legalName: !e.legalName.trim() ? 'Informe a razão (nome).' : null } as Record<string, string | null>
  }
  const isCompany = e.type === SupplierType.Company
  const docError = !e.document
    ? `Informe o ${documentLabel(e.type)}.`
    : isCompany
      ? !isValidCnpj(e.document)
        ? 'CNPJ inválido.'
        : null
      : !isValidCpf(e.document)
        ? 'CPF inválido.'
        : null
  return {
    legalName: !e.legalName.trim() ? `Informe a ${legalNameLabel(e.type).toLowerCase()}.` : null,
    document: docError,
    // IE opcional; valida só PJ com valor (PF é RG, sem checksum) — D4.
    stateRegistration:
      isCompany && e.stateRegistration && !isValidStateRegistration(e.stateRegistration, e.address.uf)
        ? 'Inscrição Estadual inválida para a UF.'
        : null,
    street: !e.address.street.trim() ? 'Informe o endereço.' : null,
    number: !e.address.number.trim() ? 'Informe o número.' : null,
    district: !e.address.district.trim() ? 'Informe o bairro.' : null,
    city: e.address.cityId == null ? 'Selecione a cidade.' : null,
    zipCode: !e.address.zipCode
      ? 'Informe o CEP.'
      : !isValidCep(e.address.zipCode)
        ? 'CEP inválido.'
        : e.address.uf && !isCepWithinUf(e.address.zipCode, e.address.uf)
          ? 'CEP não corresponde à UF da cidade.'
          : null,
    email: e.email && !isValidEmail(e.email) ? 'E-mail inválido.' : null,
    mobile: e.mobile && !isValidMobilePhone(e.mobile) ? 'Celular inválido (DDD + 9 dígitos).' : null,
    phone: e.phone && !isValidPhone(e.phone) ? 'Telefone inválido.' : null,
    holderDocument:
      e.bankAccount.holderDocument &&
      !isValidCnpj(e.bankAccount.holderDocument) &&
      !isValidCpf(e.bankAccount.holderDocument)
        ? 'CNPJ/CPF do favorecido inválido.'
        : null,
  } as Record<string, string | null>
})
const invalidCount = computed(() => Object.values(errors.value).filter(Boolean).length)

// Quais sub-abas têm pendência (ponto de alerta no FormTabs).
const TAB_FIELDS: Record<string, string[]> = {
  'dados-gerais': ['legalName', 'document', 'stateRegistration'],
  endereco: ['street', 'number', 'district', 'city', 'zipCode'],
  contato: ['email', 'mobile', 'phone'],
  bancario: ['holderDocument'],
}
const errorTabKeys = computed(() => {
  if (!submitted.value) return []
  return Object.entries(TAB_FIELDS)
    .filter(([, fields]) => fields.some((f) => errors.value[f]))
    .map(([key]) => key)
})

const addressErrors = computed(() => ({
  street: errors.value.street,
  number: errors.value.number,
  district: errors.value.district,
  city: errors.value.city,
  zipCode: errors.value.zipCode,
}))
const bankErrors = computed(() => ({ holderDocument: errors.value.holderDocument }))

const TABS = [
  { key: 'dados-gerais', label: 'Dados Gerais', icon: 'pi-building' },
  { key: 'endereco', label: 'Endereço', icon: 'pi-map-marker' },
  { key: 'contato', label: 'Contato', icon: 'pi-phone' },
  { key: 'fiscal', label: 'Fiscal', icon: 'pi-receipt' },
  { key: 'bancario', label: 'Bancário', icon: 'pi-credit-card' },
  { key: 'observacoes', label: 'Observações', icon: 'pi-align-left' },
]

// ── Ações ───────────────────────────────────────────────────────────────────
function notifySaveError(message: string): void {
  toast.add({ severity: 'error', summary: 'Não foi possível salvar', detail: message, life: 5000 })
}
async function onSave(): Promise<void> {
  submitted.value = true
  if (invalidCount.value > 0) {
    // Leva o usuário à 1ª aba com pendência.
    if (errorTabKeys.value.length) activeTab.value = errorTabKeys.value[0] as string
    notifySaveError(`Há ${invalidCount.value} campo(s) com pendência a corrigir.`)
    return
  }
  const ok = await store.save()
  if (ok) {
    confirmedLeave.value = true
    toast.add({ severity: 'success', summary: 'Fornecedor salvo', detail: 'As alterações foram gravadas.', life: 4000 })
    router.push({ name: 'suppliers' })
  } else {
    notifySaveError(store.errorMessage ?? 'Não foi possível salvar o fornecedor.')
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
    router.push({ name: 'suppliers' })
  }
}
function goBack(): void {
  router.push({ name: 'suppliers' })
}
async function onConfirmDelete(): Promise<void> {
  if (!store.editing?.id) return
  const ok = await store.inactivate(store.editing.id)
  askingDelete.value = false
  if (ok) {
    confirmedLeave.value = true
    toast.add({ severity: 'success', summary: 'Fornecedor inativado', detail: 'O registro foi inativado.', life: 4000 })
    router.push({ name: 'suppliers' })
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
      <!-- Cabeçalho: voltar + título + código + situação + natureza + excluir -->
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div class="min-w-0">
          <button
            type="button"
            class="ds-focus-ring mb-2 inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content"
            @click="goBack"
          >
            <i class="pi pi-arrow-left text-xs" aria-hidden="true"></i>
            Fornecedores
          </button>
          <h1 class="text-2xl font-bold text-content">
            {{ isEdit ? 'Editar fornecedor' : 'Novo fornecedor' }}
          </h1>
          <div v-if="store.editing" class="mt-2 flex flex-wrap items-center gap-2">
            <RecordCodeBadge :code="store.editing.id" />
            <StatusBadge
              :severity="supplierStatusSeverity(store.editing.status)"
              :label="supplierStatusLabel(store.editing.status)"
            />
          </div>
        </div>
        <div class="flex items-end gap-2">
          <div class="w-48">
            <BaseSelect
              :model-value="store.editing?.type"
              label="Natureza"
              :options="TYPE_OPTIONS"
              option-label="label"
              option-value="value"
              @update:model-value="onTypeChange"
            />
          </div>
          <BaseButton
            v-if="isEdit && store.editing && store.editing.status === SupplierStatus.Active"
            variant="neutral"
            icon="pi-ban"
            label="Inativar"
            @click="askingDelete = true"
          />
        </div>
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
        <FormTabs v-model="activeTab" :tabs="TABS" :error-keys="errorTabKeys">
          <!-- Dados Gerais -->
          <template #dados-gerais>
            <FormSection title="Identificação" icon="pi-building">
              <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <BaseTextField
                  v-model="legalName"
                  :label="legalNameLabel(store.editing.type)"
                  required
                  :error="submitted ? errors.legalName : null"
                />
                <BaseTextField v-model="tradeName" :label="isGeneric ? 'Apelido' : 'Fantasia'" />
                <template v-if="!isGeneric">
                  <MaskedField
                    v-model="document"
                    :label="documentLabel(store.editing.type)"
                    :mask="documentMask"
                    searchable
                    search-title="Consultar documento (em breve)"
                    required
                    :error="submitted ? errors.document : null"
                    @search="toast.add({ severity: 'info', summary: 'Em breve', detail: 'Consulta de CNPJ será habilitada quando a API existir.', life: 4000 })"
                  />
                  <BaseTextField
                    v-model="stateRegistration"
                    :label="stateRegistrationLabel(store.editing.type)"
                    :hint="store.editing.type === SupplierType.Company ? 'Aceita ISENTO ou vazio.' : undefined"
                    :error="submitted ? errors.stateRegistration : null"
                  />
                </template>
                <BaseSelect
                  v-model="status"
                  label="Situação"
                  :options="STATUS_OPTIONS"
                  option-label="label"
                  option-value="value"
                />
              </div>
              <p v-if="isGeneric" class="mt-3 text-sm text-content-muted">
                Fornecedor <strong class="text-content-soft">genérico</strong> (DAS/DARF/DARE…): só
                exige Razão e Situação; documento e demais dados ficam opcionais.
              </p>
            </FormSection>
          </template>

          <!-- Endereço -->
          <template #endereco>
            <FormSection title="Endereço" icon="pi-map-marker">
              <AddressSection
                :model-value="store.editing.address"
                :errors="addressErrors"
                :submitted="submitted"
                :required="!isGeneric"
                city-target="supplier-address"
                city-focus-id="supplier-address-city"
                @update:model-value="onAddressUpdate"
              />
            </FormSection>
          </template>

          <!-- Contato -->
          <template #contato>
            <FormSection title="Contato" icon="pi-phone">
              <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <MaskedField v-model="phone" label="Telefone" mask="(99) 9999-9999?9" inputmode="tel" :error="submitted ? errors.phone : null" />
                <MaskedField v-model="fax" label="Fax" mask="(99) 9999-9999" inputmode="tel" />
                <MaskedField v-model="mobile" label="Celular" mask="(99) 99999-9999" inputmode="tel" :error="submitted ? errors.mobile : null" />
                <BaseTextField v-model="contactName" label="Nome do Contato" />
                <BaseTextField v-model="email" label="E-mail" type="email" inputmode="email" :error="submitted ? errors.email : null" />
                <BaseTextField v-model="salesRepName" label="Representante (contato do fornecedor)" />
                <MaskedField v-model="salesRepPhone" label="Telefone do Representante" mask="(99) 99999-9999" inputmode="tel" />
              </div>
            </FormSection>
          </template>

          <!-- Fiscal -->
          <template #fiscal>
            <FormSection title="Fiscal (Reforma Tributária)" icon="pi-receipt">
              <p class="mb-4 text-sm text-content-muted">
                Opcional por ora — classifica o fornecedor para a apuração CBS/IBS futura.
              </p>
              <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <BaseSelect
                  :model-value="store.editing.fiscal.taxRegime"
                  label="Regime tributário (CRT)"
                  placeholder="Selecione"
                  :options="TAX_REGIME_OPTIONS"
                  option-label="label"
                  option-value="value"
                  @update:model-value="(v) => patchFiscal({ taxRegime: v })"
                />
                <BaseSelect
                  :model-value="store.editing.fiscal.ieIndicator"
                  label="Indicador de IE"
                  placeholder="Selecione"
                  :options="IE_INDICATOR_OPTIONS"
                  option-label="label"
                  option-value="value"
                  @update:model-value="(v) => patchFiscal({ ieIndicator: v })"
                />
                <BaseTextField
                  :model-value="store.editing.fiscal.municipalRegistration"
                  label="Inscrição Municipal"
                  @update:model-value="(v) => patchFiscal({ municipalRegistration: v })"
                />
                <BaseTextField
                  :model-value="store.editing.fiscal.cnae"
                  label="CNAE principal"
                  inputmode="numeric"
                  @update:model-value="(v) => patchFiscal({ cnae: v })"
                />
                <BaseTextField
                  :model-value="store.editing.fiscal.suframa"
                  label="SUFRAMA"
                  @update:model-value="(v) => patchFiscal({ suframa: v })"
                />
                <BaseTextField
                  v-if="store.editing.fiscal.isRuralProducer"
                  :model-value="store.editing.fiscal.ruralProducerRegistration"
                  label="Inscrição de Produtor Rural"
                  @update:model-value="(v) => patchFiscal({ ruralProducerRegistration: v })"
                />
              </div>
              <div class="mt-4 grid gap-3 sm:grid-cols-2">
                <label class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3">
                  <ToggleSwitch
                    :model-value="store.editing.fiscal.isIbsCbsTaxpayer"
                    inputId="f-ibscbs"
                    @update:model-value="(v) => patchFiscal({ isIbsCbsTaxpayer: v })"
                  />
                  <span class="text-sm text-content-soft">Contribuinte IBS/CBS</span>
                </label>
                <label class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3">
                  <ToggleSwitch
                    :model-value="store.editing.fiscal.optsForSimples"
                    inputId="f-simples"
                    @update:model-value="(v) => patchFiscal({ optsForSimples: v })"
                  />
                  <span class="text-sm text-content-soft">Optante Simples Nacional</span>
                </label>
                <label class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3">
                  <ToggleSwitch
                    :model-value="store.editing.fiscal.isRuralProducer"
                    inputId="f-rural"
                    @update:model-value="(v) => patchFiscal({ isRuralProducer: v })"
                  />
                  <span class="text-sm text-content-soft">Produtor rural</span>
                </label>
              </div>
            </FormSection>
          </template>

          <!-- Bancário -->
          <template #bancario>
            <FormSection title="Dados Bancários" icon="pi-credit-card">
              <BankAccountSection
                :model-value="store.editing.bankAccount"
                :errors="bankErrors"
                :submitted="submitted"
                show-holder
                @update:model-value="onBankUpdate"
              />
            </FormSection>
          </template>

          <!-- Observações -->
          <template #observacoes>
            <FormSection title="Observações" icon="pi-align-left">
              <Textarea
                v-model="notes"
                rows="5"
                auto-resize
                class="w-full rounded-field border border-line-subtle bg-surface-1 px-3.5 py-2.5 text-sm text-content outline-none transition-[color,border-color,box-shadow] duration-[var(--duration-fast)] hover:border-line focus:border-accent focus:ring-2 focus:ring-accent/20"
                placeholder="Observações sobre o fornecedor…"
              />
            </FormSection>
          </template>
        </FormTabs>
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

    <!-- Inativação (§4.6) -->
    <ConfirmDialog
      :visible="askingDelete"
      purpose="danger"
      title="Inativar fornecedor?"
      :message="`“${store.editing?.legalName}” será inativado; os registros que o referenciam (Contas a Pagar, Compras) são preservados. Você pode reativá-lo depois.`"
      confirmLabel="Inativar"
      confirmIcon="pi-ban"
      :loading="store.isDeleting"
      @confirm="onConfirmDelete"
      @update:visible="(v) => (askingDelete = v)"
    />

    <!-- Troca de natureza com dados preenchidos (N5) -->
    <ConfirmDialog
      :visible="askingTypeChange"
      purpose="danger"
      title="Trocar a natureza?"
      message="Trocar a natureza vai limpar o documento e a inscrição já preenchidos. Deseja continuar?"
      confirmLabel="Trocar"
      confirmIcon="pi-sync"
      cancelLabel="Manter"
      @confirm="confirmTypeChange"
      @update:visible="(v) => { if (!v) cancelTypeChange() }"
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
