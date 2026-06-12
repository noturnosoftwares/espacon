<script setup lang="ts">
/**
 * EmployeeFormPage — cadastro/edição de funcionário (rotas `/funcionarios/novo` e
 * `/funcionarios/:id`). Aba **Cadastro** da spec `employee-registration`.
 *
 * Segue o Design System §9.2/§10.10/§10.11: campos **agrupados por contexto** (7
 * seções), cabeçalho com **código** (`RecordCodeBadge`) + **situação**
 * (`StatusBadge`), barra de ação **fixa** dirty-aware, **resumo de validação**,
 * **toast** na falha, **cancelar com confirmação** que restaura (ADR-001), guarda
 * de navegação e **skeleton** ao carregar (§10.11). Lookups de Cidade/Representante
 * são type-to-search (`SearchLookupField`). Nenhuma regra de negócio fora daqui:
 * mutação via `store.patch` (imutável).
 */
import { computed, onMounted, ref } from 'vue'
import {
  onBeforeRouteLeave,
  useRoute,
  useRouter,
  type RouteLocationNormalized,
} from 'vue-router'
import ToggleSwitch from 'primevue/toggleswitch'
import {
  BaseButton,
  BaseSelect,
  BaseTextField,
  ConfirmDialog,
  FormSection,
  FormSkeleton,
  PageContainer,
  RecordCodeBadge,
  SearchLookupField,
  StatusBadge,
  StickyActionBar,
  useAppToast,
} from '@/shared/widgets'
import { isOk } from '@/shared/result'
import { type Address, copyAddress } from '@/shared/models'
import {
  isAdult,
  isCepWithinUf,
  isNotFutureDate,
  isValidCep,
  isValidCpf,
  isValidEmail,
  isValidFullName,
  isValidMobilePhone,
  isValidPhone,
  onlyDigits,
} from '@/shared/extensions'
import { useEmployeesStore } from '../stores'
import { makeLookupsUseCases } from '../../data/application'
import {
  type BankAccount,
  BankAccountType,
  type City,
  type Employee,
  EMPLOYEE_STATUSES,
  EmployeeStatus,
  type RepresentativeSummary,
  bankAccountTypeLabel,
  copyBankAccount,
  employeeStatusLabel,
  employeeStatusSeverity,
} from '../../domain/models'

const route = useRoute()
const router = useRouter()
const toast = useAppToast()
const store = useEmployeesStore()
const lookups = makeLookupsUseCases()

const isEdit = computed(() => route.name === 'employee-edit')
const submitted = ref(false)
const askingDelete = ref(false)
const askingCancel = ref(false)
const askingDiscard = ref(false)
const confirmedLeave = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)

// Inicialização SÍNCRONA (antes do 1º paint): evita o flash do registro anterior
// (store singleton) — edição limpa e mostra skeleton; novo abre em branco (§10.11).
if (isEdit.value) store.clearEditing()
else store.startNew()

onMounted(() => {
  if (isEdit.value) void store.loadForEdit(Number(route.params.id))
})

// ── Opções de combobox ──────────────────────────────────────────────────────
const STATUS_OPTIONS = EMPLOYEE_STATUSES.map((value) => ({
  label: employeeStatusLabel(value),
  value,
}))
const ACCOUNT_TYPE_OPTIONS = [
  { label: bankAccountTypeLabel(BankAccountType.Checking), value: BankAccountType.Checking },
  { label: bankAccountTypeLabel(BankAccountType.Savings), value: BankAccountType.Savings },
]

// ── Helpers de binding (imutável via store.patch) ───────────────────────────
/** Binding de mão-dupla para um campo **string** do Employee. */
function text(key: keyof Employee) {
  return computed<string>({
    get: () => (store.editing?.[key] as string | null | undefined) ?? '',
    set: (value) => store.patch({ [key]: value } as unknown as Partial<Employee>),
  })
}

function patchAddress(changes: Partial<Address>): void {
  if (store.editing) store.patch({ address: copyAddress(store.editing.address, changes) })
}
function patchBank(changes: Partial<BankAccount>): void {
  if (store.editing) store.patch({ bankAccount: copyBankAccount(store.editing.bankAccount, changes) })
}

// Identificação
const name = text('name')
const nickname = text('nickname')
const rg = text('rg')
const cpf = computed<string>({
  get: () => store.editing?.cpf ?? '',
  set: (value) => store.patch({ cpf: onlyDigits(value) }),
})
const birthDate = computed<string>({
  get: () => store.editing?.birthDate ?? '',
  set: (value) => store.patch({ birthDate: value || null }),
})

// Filiação & Naturalidade
const fatherName = text('fatherName')
const motherName = text('motherName')
const spouseName = text('spouseName')
const birthplace = text('birthplace')
const birthplaceUf = computed<string>({
  get: () => store.editing?.birthplaceUf ?? '',
  set: (value) => store.patch({ birthplaceUf: value.toUpperCase().slice(0, 2) }),
})

// Endereço
const street = computed<string>({
  get: () => store.editing?.address.street ?? '',
  set: (value) => patchAddress({ street: value }),
})
const addressNumber = computed<string>({
  get: () => store.editing?.address.number ?? '',
  set: (value) => patchAddress({ number: value }),
})
const complement = computed<string>({
  get: () => store.editing?.address.complement ?? '',
  set: (value) => patchAddress({ complement: value }),
})
const district = computed<string>({
  get: () => store.editing?.address.district ?? '',
  set: (value) => patchAddress({ district: value }),
})
const zipCode = computed<string>({
  get: () => store.editing?.address.zipCode ?? '',
  set: (value) => patchAddress({ zipCode: onlyDigits(value) }),
})
const selectedCity = computed<City | null>(() =>
  store.editing?.address.cityId != null
    ? { id: store.editing.address.cityId, name: store.editing.address.cityName, uf: store.editing.address.uf }
    : null,
)
function onCitySelect(city: City): void {
  patchAddress({ cityId: city.id, cityName: city.name, uf: city.uf })
}
function onCityClear(): void {
  patchAddress({ cityId: null, cityName: '', uf: '' })
}
async function searchCities(query: string): Promise<City[]> {
  const result = await lookups.searchCities(query)
  return isOk(result) ? result.data : []
}

// Contato
const companyPhone = computed<string>({
  get: () => store.editing?.companyPhone ?? '',
  set: (value) => store.patch({ companyPhone: onlyDigits(value) }),
})
const personalPhone = computed<string>({
  get: () => store.editing?.personalPhone ?? '',
  set: (value) => store.patch({ personalPhone: onlyDigits(value) }),
})
const email = text('email')

// Contrato
const admissionDate = computed<string>({
  get: () => store.editing?.admissionDate ?? '',
  set: (value) => store.patch({ admissionDate: value || null }),
})
const dismissalDate = computed<string>({
  get: () => store.editing?.dismissalDate ?? '',
  set: (value) => store.patch({ dismissalDate: value || null }),
})
const salary = computed<string>({
  get: () => (store.editing ? String(store.editing.salary) : '0'),
  set: (value) => {
    const parsed = Number(value)
    store.patch({ salary: Number.isFinite(parsed) ? parsed : 0 })
  },
})
const commission = computed<string>({
  get: () => (store.editing ? String(store.editing.commission) : '0'),
  set: (value) => {
    const parsed = Number(value)
    store.patch({ commission: Number.isFinite(parsed) ? parsed : 0 })
  },
})
const status = computed<EmployeeStatus>({
  get: () => store.editing?.status ?? EmployeeStatus.Active,
  set: (value) => {
    // P3: demissão só faz sentido quando DEMITIDO — ao sair, limpa a data.
    if (value === EmployeeStatus.Dismissed) store.patch({ status: value })
    else store.patch({ status: value, dismissalDate: null })
  },
})
const isDismissed = computed(() => status.value === EmployeeStatus.Dismissed)

// Representação
const isRepresentative = computed<boolean>({
  get: () => store.editing?.isRepresentative ?? false,
  set: (value) => {
    if (value) store.patch({ isRepresentative: true })
    else store.patch({ isRepresentative: false, representativeId: null, representativeName: '' })
  },
})
const group = text('group')
const selectedRepresentative = computed<RepresentativeSummary | null>(() =>
  store.editing?.representativeId != null
    ? { id: store.editing.representativeId, name: store.editing.representativeName }
    : null,
)
function onRepresentativeSelect(rep: RepresentativeSummary): void {
  store.patch({ representativeId: rep.id, representativeName: rep.name })
}
function onRepresentativeClear(): void {
  store.patch({ representativeId: null, representativeName: '' })
}
async function searchRepresentatives(query: string): Promise<RepresentativeSummary[]> {
  const result = await lookups.searchRepresentatives(query)
  return isOk(result) ? result.data : []
}

// Bancário
const accountType = computed<BankAccountType | null>({
  get: () => store.editing?.bankAccount.type ?? null,
  set: (value) => patchBank({ type: value }),
})
const bank = computed<string>({
  get: () => store.editing?.bankAccount.bank ?? '',
  set: (value) => patchBank({ bank: value }),
})
const branch = computed<string>({
  get: () => store.editing?.bankAccount.branch ?? '',
  set: (value) => patchBank({ branch: value }),
})
const accountNumber = computed<string>({
  get: () => store.editing?.bankAccount.number ?? '',
  set: (value) => patchBank({ number: value }),
})

// ── Validação (spec §4) ─────────────────────────────────────────────────────
const errors = computed(() => {
  const e = store.editing
  if (!e) return {} as Record<string, string | null>
  return {
    name: !e.name.trim() ? 'Informe o nome.' : !isValidFullName(e.name) ? 'Nome composto inválido.' : null,
    nickname: !e.nickname.trim() ? 'Informe o apelido.' : null,
    cpf: !e.cpf ? 'Informe o CPF.' : !isValidCpf(e.cpf) ? 'CPF inválido.' : null,
    rg: !e.rg.trim() ? 'Informe o RG.' : null,
    motherName: !e.motherName.trim()
      ? 'Informe o nome da mãe.'
      : !isValidFullName(e.motherName)
        ? 'Nome composto inválido.'
        : null,
    birthplace: !e.birthplace.trim() ? 'Informe a naturalidade.' : null,
    birthplaceUf: !e.birthplaceUf.trim() ? 'Informe a UF.' : null,
    street: !e.address.street.trim() ? 'Informe o endereço.' : null,
    addressNumber: !e.address.number.trim() ? 'Informe o número.' : null,
    district: !e.address.district.trim() ? 'Informe o bairro.' : null,
    city: e.address.cityId == null ? 'Selecione a cidade.' : null,
    zipCode: !e.address.zipCode
      ? 'Informe o CEP.'
      : !isValidCep(e.address.zipCode)
        ? 'CEP inválido.'
        : e.address.uf && !isCepWithinUf(e.address.zipCode, e.address.uf)
          ? 'CEP não corresponde à UF da cidade.'
          : null,
    companyPhone: !e.companyPhone
      ? 'Informe o fone da empresa.'
      : !isValidPhone(e.companyPhone)
        ? 'Telefone inválido.'
        : null,
    personalPhone: !e.personalPhone
      ? 'Informe o celular.'
      : !isValidMobilePhone(e.personalPhone)
        ? 'Celular inválido (DDD + 9 dígitos).'
        : null,
    email: !e.email.trim() ? 'Informe o e-mail.' : !isValidEmail(e.email) ? 'E-mail inválido.' : null,
    salary: !(e.salary > 0) ? 'Informe o salário.' : null,
    admissionDate: e.admissionDate && !isNotFutureDate(e.admissionDate) ? 'A admissão não pode ser futura.' : null,
    birthDate: e.birthDate && !isAdult(e.birthDate) ? 'O funcionário deve ter ≥ 18 anos.' : null,
    dismissalDate: isDismissed.value && !e.dismissalDate ? 'Informe a data de demissão.' : null,
    representative:
      e.isRepresentative && e.representativeId == null ? 'Selecione o representante.' : null,
    accountType: e.bankAccount.type == null ? 'Informe o tipo de conta.' : null,
    bank: !e.bankAccount.bank.trim() ? 'Informe o banco.' : null,
    branch: !e.bankAccount.branch.trim() ? 'Informe a agência.' : null,
    accountNumber: !e.bankAccount.number.trim() ? 'Informe o número da conta.' : null,
  } as Record<string, string | null>
})
const invalidCount = computed(() => Object.values(errors.value).filter(Boolean).length)

// ── Ações ───────────────────────────────────────────────────────────────────
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
    toast.add({ severity: 'success', summary: 'Funcionário salvo', detail: 'As alterações foram gravadas.', life: 4000 })
    router.push({ name: 'employees' })
  } else {
    notifySaveError(store.errorMessage ?? 'Não foi possível salvar o funcionário.')
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
    router.push({ name: 'employees' })
  }
}
function goBack(): void {
  router.push({ name: 'employees' })
}

async function onConfirmDelete(): Promise<void> {
  if (!store.editing?.id) return
  const ok = await store.remove(store.editing.id)
  askingDelete.value = false
  if (ok) {
    confirmedLeave.value = true
    toast.add({ severity: 'success', summary: 'Funcionário excluído', detail: 'O registro foi removido.', life: 4000 })
    router.push({ name: 'employees' })
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
      <!-- Cabeçalho: voltar + título + código + situação + excluir -->
      <header class="flex flex-wrap items-start justify-between gap-3">
        <div>
          <button
            type="button"
            class="ds-focus-ring mb-2 inline-flex items-center gap-1.5 text-sm text-content-muted hover:text-content"
            @click="goBack"
          >
            <i class="pi pi-arrow-left text-xs" aria-hidden="true"></i>
            Funcionários
          </button>
          <h1 class="text-2xl font-bold text-content">
            {{ isEdit ? 'Editar funcionário' : 'Novo funcionário' }}
          </h1>
          <div v-if="store.editing" class="mt-2 flex flex-wrap items-center gap-2">
            <RecordCodeBadge :code="store.editing.id" />
            <StatusBadge
              :severity="employeeStatusSeverity(store.editing.status)"
              :label="employeeStatusLabel(store.editing.status)"
            />
          </div>
        </div>
        <BaseButton
          v-if="isEdit && store.editing"
          variant="danger"
          icon="pi-trash"
          label="Excluir"
          @click="askingDelete = true"
        />
      </header>

      <!-- Resumo de validação / erro geral -->
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

      <!-- Skeleton ao carregar o registro (§10.11). -->
      <FormSkeleton v-if="store.loading || (isEdit && !store.editing)" :sections="4" :fields="2" />

      <template v-else-if="store.editing">
        <!-- 1. Identificação -->
        <FormSection title="Identificação" icon="pi-user">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField v-model="name" label="Nome" required :error="submitted ? errors.name : null" />
            <BaseTextField v-model="nickname" label="Apelido" required :error="submitted ? errors.nickname : null" />
            <BaseTextField
              v-model="cpf"
              label="CPF"
              inputmode="numeric"
              placeholder="Somente números"
              required
              :error="submitted ? errors.cpf : null"
            />
            <BaseTextField v-model="rg" label="RG" required :error="submitted ? errors.rg : null" />
            <BaseTextField v-model="birthDate" label="Nascimento" type="date" :error="submitted ? errors.birthDate : null" />
          </div>
        </FormSection>

        <!-- 2. Filiação & Naturalidade -->
        <FormSection title="Filiação & Naturalidade" icon="pi-users">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField v-model="fatherName" label="Nome do Pai" />
            <BaseTextField v-model="motherName" label="Nome da Mãe" required :error="submitted ? errors.motherName : null" />
            <BaseTextField v-model="spouseName" label="Cônjuge" />
            <BaseTextField v-model="birthplace" label="Naturalidade" required :error="submitted ? errors.birthplace : null" />
            <BaseTextField
              v-model="birthplaceUf"
              label="UF da Naturalidade"
              placeholder="UF"
              required
              :error="submitted ? errors.birthplaceUf : null"
            />
          </div>
        </FormSection>

        <!-- 3. Endereço -->
        <FormSection title="Endereço" icon="pi-map-marker">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField
              v-model="street"
              label="Endereço"
              hint="Campo de busca preparado para mapas (NoturnoMAPS)."
              required
              :error="submitted ? errors.street : null"
            />
            <BaseTextField v-model="addressNumber" label="Número" required :error="submitted ? errors.addressNumber : null" />
            <BaseTextField v-model="complement" label="Complemento" />
            <BaseTextField v-model="district" label="Bairro" required :error="submitted ? errors.district : null" />
            <SearchLookupField
              :model-value="selectedCity"
              label="Cidade"
              option-label="name"
              placeholder="Digite ≥ 2 letras…"
              hint="Selecionar a cidade preenche a UF."
              required
              :error="submitted ? errors.city : null"
              :search-fn="searchCities"
              @select="onCitySelect"
              @clear="onCityClear"
            />
            <BaseTextField
              :model-value="store.editing.address.uf"
              label="UF (endereço)"
              hint="Preenchida pela cidade."
              disabled
            />
            <BaseTextField
              v-model="zipCode"
              label="CEP"
              inputmode="numeric"
              placeholder="00000-000"
              required
              :error="submitted ? errors.zipCode : null"
            />
          </div>
        </FormSection>

        <!-- 4. Contato -->
        <FormSection title="Contato" icon="pi-phone">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField
              v-model="companyPhone"
              label="Fone Empresa"
              inputmode="tel"
              placeholder="(00) 0000-0000"
              required
              :error="submitted ? errors.companyPhone : null"
            />
            <BaseTextField
              v-model="personalPhone"
              label="Fone Pessoal (celular)"
              inputmode="tel"
              placeholder="(00) 00000-0000"
              required
              :error="submitted ? errors.personalPhone : null"
            />
            <BaseTextField
              v-model="email"
              label="E-mail"
              type="email"
              inputmode="email"
              required
              :error="submitted ? errors.email : null"
            />
          </div>
        </FormSection>

        <!-- 5. Contrato -->
        <FormSection title="Contrato" icon="pi-briefcase">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField v-model="admissionDate" label="Admissão" type="date" :error="submitted ? errors.admissionDate : null" />
            <BaseSelect
              v-model="status"
              label="Situação"
              :options="STATUS_OPTIONS"
              option-label="label"
              option-value="value"
            />
            <BaseTextField
              v-if="isDismissed"
              v-model="dismissalDate"
              label="Demissão"
              type="date"
              required
              :error="submitted ? errors.dismissalDate : null"
            />
            <BaseTextField
              v-model="salary"
              label="Salário (R$)"
              type="number"
              inputmode="numeric"
              required
              :error="submitted ? errors.salary : null"
            />
            <BaseTextField
              v-model="commission"
              label="Comissão (%)"
              type="number"
              inputmode="numeric"
              hint="Percentual (0–100)."
            />
          </div>
        </FormSection>

        <!-- 6. Representação -->
        <FormSection title="Representação" icon="pi-share-alt">
          <label
            class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3"
          >
            <ToggleSwitch v-model="isRepresentative" inputId="is-representative" />
            <span class="text-sm text-content-soft">É representante?</span>
          </label>
          <div class="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <SearchLookupField
              v-if="isRepresentative"
              :model-value="selectedRepresentative"
              label="Representante"
              option-label="name"
              placeholder="Buscar representante…"
              :min-length="1"
              required
              :error="submitted ? errors.representative : null"
              :search-fn="searchRepresentatives"
              @select="onRepresentativeSelect"
              @clear="onRepresentativeClear"
            />
            <BaseTextField v-model="group" label="Grupo" placeholder="Texto livre" />
          </div>
        </FormSection>

        <!-- 7. Dados Bancários -->
        <FormSection title="Dados Bancários" icon="pi-credit-card">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseSelect
              v-model="accountType"
              label="Tipo de conta"
              placeholder="Selecione"
              :options="ACCOUNT_TYPE_OPTIONS"
              option-label="label"
              option-value="value"
              :error="submitted ? errors.accountType : null"
            />
            <BaseTextField v-model="bank" label="Banco" required :error="submitted ? errors.bank : null" />
            <BaseTextField v-model="branch" label="Agência" required :error="submitted ? errors.branch : null" />
            <BaseTextField v-model="accountNumber" label="Número da conta" required :error="submitted ? errors.accountNumber : null" />
          </div>
        </FormSection>
      </template>
    </PageContainer>

    <!-- Rodapé de ações (§10.10): só com alteração. -->
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
      title="Excluir funcionário?"
      :message="`Confirma a exclusão de ${store.editing?.name}? Esta ação não pode ser desfeita.`"
      confirmLabel="Excluir"
      confirmIcon="pi-trash"
      :loading="store.isDeleting"
      @confirm="onConfirmDelete"
      @update:visible="(v) => (askingDelete = v)"
    />

    <!-- Confirmação de cancelamento (§9.2) -->
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

    <!-- Guarda de navegação (§9.2) -->
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
