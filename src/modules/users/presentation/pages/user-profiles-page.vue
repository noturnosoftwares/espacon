<script setup lang="ts">
/**
 * UserProfilesPage — listagem de perfis (rota `/perfis`).
 *
 * Mesmos padrões de grid da `UsersPage`. O perfil é apenas um modelo de
 * cadastro (não concede acesso). Sem regra de negócio na tela.
 */
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import Dialog from 'primevue/dialog'
import { PageContainer } from '@/shared/widgets'
import { useUserProfilesStore } from '../stores'
import type { UserProfile } from '../../domain/models'

const router = useRouter()
const store = useUserProfilesStore()

const search = ref('')
const deleteTarget = ref<UserProfile | null>(null)

onMounted(() => {
  void store.load()
})

let searchTimer: ReturnType<typeof setTimeout> | null = null
function onSearch(): void {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => store.applyFilters({ query: search.value }), 300)
}

function goNew(): void {
  void router.push({ name: 'user-profile-new' })
}
function goEdit(profile: UserProfile): void {
  void router.push({ name: 'user-profile-edit', params: { id: profile.id } })
}

function askDelete(profile: UserProfile): void {
  deleteTarget.value = profile
}
async function confirmDelete(): Promise<void> {
  if (deleteTarget.value) await store.remove(deleteTarget.value.id)
  deleteTarget.value = null
}

function actionCount(profile: UserProfile): number {
  return profile.permissions.length
}
</script>

<template>
  <PageContainer>
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-noturno-white">Perfis de Usuário</h1>
        <p class="text-sm text-noturno-grey-light">
          Modelos de cadastro que aceleram a atribuição de permissões.
        </p>
      </div>
      <Button label="Novo perfil" icon="pi pi-plus" @click="goNew" />
    </header>

    <div class="flex items-center gap-3">
      <IconField class="w-full max-w-sm">
        <InputIcon class="pi pi-search" />
        <InputText
          v-model="search"
          placeholder="Buscar por descrição"
          class="w-full"
          @input="onSearch"
        />
      </IconField>
    </div>

    <p v-if="store.hasError" class="rounded-md bg-noturno-red/10 px-4 py-2 text-sm text-noturno-red">
      {{ store.errorMessage }}
    </p>

    <DataTable
      :value="store.items"
      :loading="store.loading"
      paginator
      :rows="store.pageSize"
      removableSort
      dataKey="id"
      class="rounded-lg border border-noturno-grey-light-clean-3"
    >
      <template #empty>
        <div class="py-8 text-center text-noturno-grey-light">Nenhum perfil encontrado.</div>
      </template>

      <Column field="description" header="Descrição" sortable />
      <Column header="Recursos">
        <template #body="{ data }">
          <span class="text-noturno-grey-light-clean">{{ actionCount(data) }} recurso(s)</span>
        </template>
      </Column>
      <Column header="Ações" :style="{ width: '8rem' }">
        <template #body="{ data }">
          <div class="flex gap-1">
            <Button icon="pi pi-pencil" text rounded aria-label="Editar" @click="goEdit(data)" />
            <Button
              icon="pi pi-trash"
              text
              rounded
              severity="danger"
              aria-label="Excluir"
              @click="askDelete(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <Dialog
      :visible="deleteTarget !== null"
      modal
      header="Excluir perfil?"
      :style="{ width: '26rem' }"
      @update:visible="(v: boolean) => { if (!v) deleteTarget = null }"
    >
      <p class="text-sm text-noturno-grey-light-clean">
        Confirma a exclusão de <strong>{{ deleteTarget?.description }}</strong>? Usuários já
        cadastrados não são afetados (o perfil é só um modelo).
      </p>
      <template #footer>
        <Button label="Cancelar" text severity="secondary" @click="deleteTarget = null" />
        <Button
          label="Excluir"
          icon="pi pi-trash"
          severity="danger"
          :loading="store.isDeleting"
          @click="confirmDelete"
        />
      </template>
    </Dialog>
  </PageContainer>
</template>
