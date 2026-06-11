<script setup lang="ts">
/**
 * UserFormPage — cadastro/edição de usuário (rotas `/usuarios/novo` e
 * `/usuarios/:id`), dentro do `AppShell`.
 *
 * Design System §9.2/10.10: campos **agrupados por contexto** em seções, no
 * máximo 2 por linha; barra de ação **fixa** (Salvar/Cancelar) e resumo de
 * validação ao submeter. Excluir vive aqui (edição), com confirmação (§8.7) e
 * toast (§8.8). Toda mutação passa por `store.patch` (model imutável); nenhuma
 * regra de negócio aqui.
 */
import { computed, onMounted, ref } from 'vue'
import {
  onBeforeRouteLeave,
  useRoute,
  useRouter,
  type RouteLocationNormalized,
} from 'vue-router'
import Select from 'primevue/select'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { type AccessScope, type Permission, type UserRole } from '@/shared/access'
import {
  BaseButton,
  BaseTextField,
  ConfirmDialog,
  FormField,
  FormSection,
  LookupField,
  PageContainer,
  StickyActionBar,
} from '@/shared/widgets'
import { useUsersStore, usePermissionCatalogStore } from '../stores'
import {
  CashOperatorFields,
  AccessRestrictionsFields,
  ProfileLookup,
  PermissionMatrix,
} from '../widgets'
import type { CashOperator, UserProfile } from '../../domain/models'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const store = useUsersStore()
const catalog = usePermissionCatalogStore()

const ROLE_OPTIONS: { label: string; value: UserRole }[] = [
  { label: 'Administrador', value: 'admin' },
  { label: 'Franqueado', value: 'franchisee' },
  { label: 'Representante', value: 'representative' },
  { label: 'Técnico', value: 'technician' },
  { label: 'Cliente', value: 'customer' },
]
const SCOPE_OPTIONS: { label: string; value: AccessScope }[] = [
  { label: 'Global (matriz)', value: 'global' },
  { label: 'Franquia', value: 'franchise' },
  { label: 'Representante', value: 'representative' },
  { label: 'Técnico', value: 'technician' },
  { label: 'Cliente', value: 'customer' },
]

const isEdit = computed(() => route.name === 'user-edit')
const submitted = ref(false)
const askingDelete = ref(false)
const askingCancel = ref(false)

// Guarda de navegação (§9.2): sair com alteração não salva pede confirmação.
const askingDiscard = ref(false)
const confirmedLeave = ref(false)
const pendingRoute = ref<RouteLocationNormalized | null>(null)

onMounted(async () => {
  await catalog.ensureLoaded()
  if (isEdit.value) {
    await store.loadForEdit(Number(route.params.id))
  } else {
    store.startNew()
  }
})

/** Helper de binding: campo ↔ `store.patch` (imutável). */
function field<K extends keyof NonNullable<typeof store.editing>>(key: K) {
  return computed({
    get: () => store.editing?.[key],
    set: (value) => store.patch({ [key]: value } as Partial<NonNullable<typeof store.editing>>),
  })
}

const name = field('name')
const login = field('login')
const email = field('email')
const active = field('active')
const role = field('role')
const accessScope = field('accessScope')
const employeeId = field('employeeId')
const remote = field('remote')

/**
 * Funcionário vinculado — campo de **referência** (lookup §9.2). Resolve o
 * rótulo do registro selecionado; a página de busca que retorna o funcionário
 * será plugada no `@open` (ainda não existe o módulo de Funcionários).
 */
function employeeLabel(value: string | number): string {
  return `Funcionário #${value}`
}
function onOpenEmployeeSearch(): void {
  toast.add({
    severity: 'info',
    summary: 'Busca de funcionários',
    detail: 'A pesquisa de funcionários será habilitada quando o módulo existir.',
    life: 4000,
  })
}

const cashOperator = computed<CashOperator | undefined>(() => store.editing?.cashOperator)
function onCashOperator(value: CashOperator): void {
  store.patch({ cashOperator: value })
}

const permissions = computed<Permission[]>(() => store.editing?.permissions ?? [])
function onPermissions(value: Permission[]): void {
  store.setPermissions(value)
}

function onApplyProfile(profile: UserProfile): void {
  store.applyProfile(profile)
}

/** Limpa apenas o vínculo de origem (não desfaz as ações já copiadas). */
function onClearProfile(): void {
  store.patch({ sourceProfileId: null })
}

// Validação mínima (§10.10): obrigatórios marcados + resumo ao submeter.
const errors = computed(() => ({
  name: !store.editing?.name?.trim() ? 'Informe o nome.' : null,
  login: !store.editing?.login?.trim() ? 'Informe o login.' : null,
  email: !store.editing?.email?.trim() ? 'Informe o e-mail.' : null,
}))
const invalidCount = computed(() => Object.values(errors.value).filter(Boolean).length)

/**
 * Falha de salvamento (validação OU API): mantém o informativo geral no topo +
 * erros por campo e **também dispara um toast** com a mesma mensagem geral
 * (convenção de CRUD — item 4). Usa o serviço de toast já existente.
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
      summary: 'Usuário salvo',
      detail: 'As alterações foram gravadas.',
      life: 4000,
    })
    router.push({ name: 'users' })
  } else {
    notifySaveError(store.errorMessage ?? 'Não foi possível salvar o usuário.')
  }
}

/**
 * Cancelar (§9.2 + ADR-001). Cancelar é uma ação que **descarta alterações**,
 * então **confirma antes** quando há mudanças não salvas (dirty). Sem alterações,
 * cancela direto. Após confirmar, aplica a regra do ADR-001 em `performCancel`.
 */
function onCancel(): void {
  if (store.isDirty) {
    askingCancel.value = true
    return
  }
  performCancel()
}

/**
 * Executa o cancelamento (ADR-001):
 * - **edição** → restaura o registro original e **permanece na tela de detalhe**;
 * - **registro novo** → descarta e **volta para a listagem**.
 */
function performCancel(): void {
  askingCancel.value = false
  const outcome = store.cancelEdit()
  submitted.value = false
  if (outcome === 'leave') {
    confirmedLeave.value = true
    router.push({ name: 'users' })
  }
}

/** Voltar pelo cabeçalho/breadcrumb: navega à lista (a guarda cuida do não salvo). */
function goBack(): void {
  router.push({ name: 'users' })
}

async function onConfirmDelete(): Promise<void> {
  if (!store.editing) return
  const ok = await store.remove(store.editing.id)
  askingDelete.value = false
  if (ok) {
    confirmedLeave.value = true
    toast.add({
      severity: 'success',
      summary: 'Usuário excluído',
      detail: 'O registro foi removido.',
      life: 4000,
    })
    router.push({ name: 'users' })
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
            Usuários
          </button>
          <h1 class="text-2xl font-bold text-content">
            {{ isEdit ? 'Editar usuário' : 'Novo usuário' }}
          </h1>
          <p class="mt-1 text-sm text-content-muted">
            Acesso individual por usuário e por recurso.
          </p>
        </div>
        <BaseButton
          v-if="isEdit"
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

      <template v-if="store.editing">
        <!-- Dados básicos -->
        <FormSection title="Dados básicos" icon="pi-id-card">
          <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
            <BaseTextField
              v-model="name"
              label="Nome"
              required
              :error="submitted ? errors.name : null"
            />
            <BaseTextField
              v-model="login"
              label="Login"
              required
              :error="submitted ? errors.login : null"
            />
            <BaseTextField
              v-model="email"
              label="E-mail"
              type="email"
              inputmode="email"
              required
              :error="submitted ? errors.email : null"
            />
            <LookupField
              :model-value="employeeId"
              label="Funcionário vinculado (opcional)"
              placeholder="Buscar funcionário…"
              :format-selected="employeeLabel"
              @open="onOpenEmployeeSearch"
              @update:model-value="(v) => (employeeId = v != null ? Number(v) : null)"
            />
            <FormField label="Papel">
              <Select
                v-model="role"
                :options="ROLE_OPTIONS"
                optionLabel="label"
                optionValue="value"
                fluid
              />
            </FormField>
            <FormField label="Escopo de acesso" hint="Filtra os dados por matriz/franquia/representante.">
              <Select
                v-model="accessScope"
                :options="SCOPE_OPTIONS"
                optionLabel="label"
                optionValue="value"
                fluid
              />
            </FormField>
            <label
              class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3 sm:col-span-2"
            >
              <ToggleSwitch v-model="active" inputId="f-active" />
              <span class="text-sm text-content-soft">Usuário ativo</span>
            </label>
          </div>
        </FormSection>

        <!-- Caixa -->
        <CashOperatorFields
          v-if="cashOperator"
          :modelValue="cashOperator"
          @update:modelValue="onCashOperator"
        />

        <!-- Acesso remoto -->
        <FormSection
          title="Acesso remoto"
          icon="pi-globe"
          description="Habilita features que atravessam empresas (cross-company)."
        >
          <label
            class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3"
          >
            <ToggleSwitch v-model="remote" inputId="f-remote" />
            <span class="text-sm text-content-soft">Habilitar acesso remoto cross-company</span>
          </label>
        </FormSection>

        <!-- Restrições -->
        <AccessRestrictionsFields
          :time="store.editing.accessTimeRestriction"
          :ip="store.editing.ipRestriction"
          @update:time="(v) => store.patch({ accessTimeRestriction: v })"
          @update:ip="(v) => store.patch({ ipRestriction: v })"
        />

        <!-- Perfil (modelo) — campo de busca (§9.2), não listbox. -->
        <ProfileLookup
          :selected-id="store.editing.sourceProfileId ?? null"
          @apply="onApplyProfile"
          @clear="onClearProfile"
        />

        <!-- Permissões -->
        <FormSection
          title="Permissões"
          icon="pi-shield"
          description="Acesso granular por recurso × ação — a fonte da verdade da autorização."
        >
          <p v-if="catalog.loading" class="text-sm text-content-muted">Carregando catálogo…</p>
          <PermissionMatrix
            v-else
            :sections="catalog.sections"
            :modelValue="permissions"
            @update:modelValue="onPermissions"
          />
        </FormSection>
      </template>
    </PageContainer>

    <!-- Rodapé de ações (§10.10): FORA da área de rolagem, não sobrepõe o
         conteúdo. Só aparece quando há alteração a salvar (dirty). -->
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
      title="Excluir usuário?"
      :message="`Confirma a exclusão de ${store.editing?.name}? Esta ação não pode ser desfeita.`"
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
