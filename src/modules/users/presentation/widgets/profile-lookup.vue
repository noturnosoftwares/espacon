<script setup lang="ts">
/**
 * ProfileLookup — escolhe um **perfil** (modelo) e o aplica ao usuário.
 *
 * O perfil é **dado de referência vindo do backend**, então segue o Design System
 * §9.2: é um **campo de busca** (`LookupField`), **nunca** um listbox/select.
 * Acionar abre um **diálogo de pesquisa** que retorna o perfil; ao escolher,
 * confirma (a aplicação **sobrescreve** todas as ações da matriz — §8.7) e emite
 * `apply(profile)`. Lembrete: o perfil só **copia** ações; a autorização continua
 * lendo `user.permissions`.
 */
import { computed, onMounted, ref } from 'vue'
import Dialog from 'primevue/dialog'
import { normalizeText } from '@/shared/extensions'
import { ConfirmDialog, FormSection, LookupField, SearchField } from '@/shared/widgets'
import { useProfileLookupStore } from '../stores'
import type { UserProfile } from '../../domain/models'

const props = defineProps<{ selectedId: number | null }>()
const emit = defineEmits<{ apply: [profile: UserProfile]; clear: [] }>()

const lookup = useProfileLookupStore()

const dialogOpen = ref(false)
const query = ref('')
const pending = ref<UserProfile | null>(null)
const confirmOpen = ref(false)

onMounted(() => {
  void lookup.ensureLoaded()
})

/** Rótulo do perfil aplicado (resolvido do cache; fallback pelo id). */
const selectedLabel = computed(() => {
  if (props.selectedId == null) return ''
  const found = lookup.items.find((p) => p.id === props.selectedId)
  return found?.description ?? `Perfil #${props.selectedId}`
})

/** Busca client-side sobre o cache (§9.1) — o conjunto de perfis é pequeno. */
const filtered = computed<UserProfile[]>(() => {
  const q = normalizeText(query.value.trim())
  if (!q) return lookup.items
  return lookup.items.filter((p) => normalizeText(p.description).includes(q))
})

function open(): void {
  query.value = ''
  void lookup.ensureLoaded()
  dialogOpen.value = true
}

function pick(profile: UserProfile): void {
  pending.value = profile
  confirmOpen.value = true
}

function confirmApply(): void {
  if (pending.value) emit('apply', pending.value)
  confirmOpen.value = false
  dialogOpen.value = false
  pending.value = null
}
</script>

<template>
  <FormSection
    title="Perfil (modelo de cadastro)"
    icon="pi-clone"
    description="Buscar e aplicar um perfil redefine todas as ações da matriz. O perfil não concede acesso por si — apenas copia as ações para o usuário."
  >
    <LookupField
      :model-value="selectedId"
      label="Perfil aplicado"
      placeholder="Buscar perfil…"
      hint="Ao aplicar, as ações do perfil substituem as ações marcadas na matriz."
      :format-selected="() => selectedLabel"
      @open="open"
      @clear="emit('clear')"
    />

    <!-- Diálogo de pesquisa que retorna o perfil (§9.2). -->
    <Dialog
      v-model:visible="dialogOpen"
      modal
      dismissableMask
      header="Buscar perfil"
      :style="{ width: '34rem' }"
    >
      <div class="flex flex-col gap-3">
        <SearchField v-model="query" placeholder="Buscar por descrição" />

        <p v-if="lookup.loading" class="px-1 py-6 text-center text-sm text-content-muted">
          Carregando perfis…
        </p>

        <ul v-else-if="filtered.length" class="flex max-h-80 flex-col gap-1 overflow-y-auto scrollbar-noturno">
          <li v-for="profile in filtered" :key="profile.id">
            <button
              type="button"
              class="ds-focus-ring flex w-full items-center justify-between gap-3 rounded-field border border-line-subtle bg-surface-1 px-4 py-3 text-left transition-colors duration-[var(--duration-fast)] hover:border-line hover:bg-surface-2"
              @click="pick(profile)"
            >
              <span class="flex items-center gap-2 text-sm font-medium text-content">
                <i class="pi pi-clone text-accent" aria-hidden="true"></i>
                {{ profile.description }}
              </span>
              <span class="text-xs text-content-muted">{{ profile.permissions.length }} recurso(s)</span>
            </button>
          </li>
        </ul>

        <p v-else class="px-1 py-6 text-center text-sm text-content-muted">
          <template v-if="query">
            Nenhum perfil para
            <span class="font-semibold text-danger">“{{ query }}”</span>.
          </template>
          <template v-else>Nenhum perfil cadastrado.</template>
        </p>
      </div>
    </Dialog>

    <!-- Confirmação: aplicar sobrescreve a matriz (§8.7). -->
    <ConfirmDialog
      :visible="confirmOpen"
      purpose="confirm"
      title="Aplicar perfil?"
      :message="`Isso vai preencher a matriz com as ações de “${pending?.description}”, sobrescrevendo as ações já marcadas. Deseja continuar?`"
      confirmLabel="Aplicar"
      confirmIcon="pi-check"
      @confirm="confirmApply"
      @update:visible="(v) => (confirmOpen = v)"
    />
  </FormSection>
</template>
