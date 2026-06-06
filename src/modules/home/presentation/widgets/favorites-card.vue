<script setup lang="ts">
/**
 * FavoritesCard — atalhos favoritos do usuário, em grade de tiles (ícone laranja
 * + rótulo). Inclui um tile "Adicionar favorito". Componente puro (recebe a
 * lista por prop). Itens sem rota são inertes nesta fase.
 */
import type { FavoriteShortcut } from '../../domain/models'
import DashboardCard from './dashboard-card.vue'
import { iconClass } from './dashboard-ui'

defineProps<{ favorites: FavoriteShortcut[] }>()
</script>

<template>
  <DashboardCard title="Meus Favoritos" icon="star">
    <template #action>
      <button
        type="button"
        class="rounded-lg border border-noturno-grey-light-clean-3 px-2.5 py-1 text-xs text-noturno-grey-light transition-colors hover:border-noturno-orange/40 hover:text-noturno-white"
      >
        Gerenciar
      </button>
    </template>

    <div class="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
      <button
        v-for="fav in favorites"
        :key="fav.id"
        type="button"
        :title="fav.label"
        class="group flex flex-col items-center gap-2 rounded-xl border border-noturno-grey-light-clean-3 bg-noturno-black-2/40 px-2 py-4 text-center transition-all hover:-translate-y-0.5 hover:border-noturno-orange/40 hover:bg-noturno-black-2 hover:shadow-lg hover:shadow-black/30"
      >
        <i :class="iconClass(fav.icon)" class="text-xl text-noturno-orange" aria-hidden="true"></i>
        <span class="text-xs font-medium leading-tight text-noturno-grey-light-clean">
          {{ fav.label }}
        </span>
      </button>

      <!-- Adicionar favorito -->
      <button
        type="button"
        title="Adicionar favorito"
        class="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-noturno-grey-light-clean-3 px-2 py-4 text-center text-noturno-grey-light transition-colors hover:border-noturno-orange/50 hover:text-noturno-orange"
      >
        <i class="pi pi-plus text-xl" aria-hidden="true"></i>
        <span class="text-xs font-medium leading-tight">Adicionar favorito</span>
      </button>
    </div>
  </DashboardCard>
</template>
