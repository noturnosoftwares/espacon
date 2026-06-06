<script setup lang="ts">
/**
 * AppSidebar — navegação principal do EspaçoN (ver home spec / mock da Home).
 *
 * Marca **EspaçoN** no topo, lista de `NavigationTile` (Início + grupos de
 * negócio) e rodapé **Recolher menu** (alterna o modo recolhido, só ícones). O
 * item ativo é derivado da rota; grupos sem tela ainda são inertes ("em breve").
 * Config em `data/mocks/mock-nav.ts`. Rola com scrollbar fina da identidade.
 */
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { homeNavTile, navGroups } from '../../data/mocks/mock-nav'
import type { NavGroup } from '../../domain/models'
import NavigationTile from './navigation-tile.vue'

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)

function isHomeActive(): boolean {
  return route.path === homeNavTile.route
}

function navigate(entry: NavGroup): void {
  if (entry.route && route.path !== entry.route) {
    void router.push(entry.route)
  }
}
</script>

<template>
  <aside
    class="flex h-full shrink-0 flex-col border-r border-noturno-grey-light-clean-3 bg-noturno-black transition-[width] duration-200"
    :class="collapsed ? 'w-16' : 'w-56'"
    aria-label="Navegação principal"
  >
    <!-- Marca -->
    <div
      class="flex h-16 shrink-0 items-center border-b border-noturno-grey-light-clean-3"
      :class="collapsed ? 'justify-center px-0' : 'px-4'"
    >
      <span v-if="!collapsed" class="text-2xl font-bold tracking-tight">
        <span class="text-noturno-white">Espaço</span><span class="text-noturno-orange">N</span>
      </span>
      <span v-else class="text-xl font-bold tracking-tight">
        <span class="text-noturno-white">e</span><span class="text-noturno-orange">N</span>
      </span>
    </div>

    <!-- Itens -->
    <nav class="scrollbar-noturno flex flex-1 flex-col gap-1.5 overflow-y-auto p-3">
      <NavigationTile
        :label="homeNavTile.label"
        :icon="homeNavTile.icon"
        :active="isHomeActive()"
        :collapsed="collapsed"
        @activate="navigate(homeNavTile)"
      />
      <NavigationTile
        v-for="group in navGroups"
        :key="group.id"
        :label="group.label"
        :icon="group.icon"
        :soon="group.status === 'soon'"
        :collapsed="collapsed"
        @activate="navigate(group)"
      />
    </nav>

    <!-- Recolher -->
    <button
      type="button"
      class="flex h-12 shrink-0 items-center gap-2 border-t border-noturno-grey-light-clean-3 text-sm text-noturno-grey-light transition-colors hover:text-noturno-white outline-none"
      :class="collapsed ? 'justify-center px-0' : 'px-4'"
      :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
      @click="collapsed = !collapsed"
    >
      <i class="pi pi-angle-left transition-transform" :class="{ 'rotate-180': collapsed }" aria-hidden="true"></i>
      <span v-if="!collapsed">Recolher menu</span>
    </button>
  </aside>
</template>
