<script setup lang="ts">
/**
 * UserProfileFormPage — cadastro/edição de perfil (rotas `/perfis/novo` e
 * `/perfis/:id`). Descrição + a **mesma** matriz de permissões reutilizada do
 * usuário. Lembrete: o perfil é só um modelo de cadastro (não autoriza nada).
 */
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import type { Permission } from '@/shared/access'
import { PageContainer } from '@/shared/widgets'
import { useUserProfilesStore, usePermissionCatalogStore } from '../stores'
import { PermissionMatrix } from '../widgets'

const route = useRoute()
const router = useRouter()
const store = useUserProfilesStore()
const catalog = usePermissionCatalogStore()

const isEdit = computed(() => route.name === 'user-profile-edit')

onMounted(async () => {
  await catalog.ensureLoaded()
  if (isEdit.value) {
    await store.loadForEdit(Number(route.params.id))
  } else {
    store.startNew()
  }
})

const description = computed({
  get: () => store.editing?.description ?? '',
  set: (value: string) => store.patch({ description: value }),
})

const permissions = computed<Permission[]>(() => store.editing?.permissions ?? [])

async function onSave(): Promise<void> {
  const ok = await store.save()
  if (ok) router.push({ name: 'user-profiles' })
}
function onCancel(): void {
  router.push({ name: 'user-profiles' })
}
</script>

<template>
  <PageContainer>
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-xl font-bold text-noturno-white">
          {{ isEdit ? 'Editar perfil' : 'Novo perfil' }}
        </h1>
        <p class="text-sm text-noturno-grey-light">
          Modelo de cadastro — ao ser aplicado, redefine as ações do usuário.
        </p>
      </div>
      <div class="flex gap-2">
        <Button label="Cancelar" text severity="secondary" @click="onCancel" />
        <Button label="Salvar" icon="pi pi-check" :loading="store.isSaving" @click="onSave" />
      </div>
    </header>

    <p v-if="store.hasError" class="rounded-md bg-noturno-red/10 px-4 py-2 text-sm text-noturno-red">
      {{ store.errorMessage }}
    </p>

    <template v-if="store.editing">
      <fieldset class="rounded-lg border border-noturno-grey-light-clean-3 p-4">
        <legend class="px-2 text-sm font-semibold text-noturno-white">Dados do perfil</legend>
        <div class="flex max-w-md flex-col gap-1.5">
          <label for="p-description" class="text-xs text-noturno-grey-light">Descrição</label>
          <InputText id="p-description" v-model="description" placeholder="Ex.: Administrativo" />
        </div>
      </fieldset>

      <div class="flex flex-col gap-2">
        <h2 class="text-sm font-semibold text-noturno-white">Permissões (recurso × ação)</h2>
        <p v-if="catalog.loading" class="text-sm text-noturno-grey-light">Carregando catálogo…</p>
        <PermissionMatrix
          v-else
          :sections="catalog.sections"
          :modelValue="permissions"
          @update:modelValue="(v) => store.setPermissions(v)"
        />
      </div>
    </template>
  </PageContainer>
</template>
