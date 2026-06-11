<script setup lang="ts">
/**
 * AppSidebar — navegação principal do EspaçoN (ver home spec / mock da Home).
 *
 * Marca **EspaçoN** no topo, lista de `NavigationTile` (Início + grupos de
 * negócio) e rodapé **Recolher menu** (alterna o modo recolhido, só ícones).
 *
 * Grupos com sub-itens **expandem** ao clicar; itens `available` navegam, itens
 * `soon` ficam inertes ("em breve"). O item ativo é derivado da rota. Config em
 * `data/mocks/mock-nav.ts`. Rola com scrollbar fina da identidade.
 */
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { homeNavTile, navGroups } from '../../data/mocks/mock-nav'
import type { NavGroup, NavItem } from '../../domain/models'
import NavigationTile from './navigation-tile.vue'

const route = useRoute()
const router = useRouter()

const collapsed = ref(false)
const expanded = reactive<Record<string, boolean>>({})

function isHomeActive(): boolean {
  return route.path === homeNavTile.route
}

function hasAvailableItems(group: NavGroup): boolean {
  return group.items.some((item) => item.status === 'available')
}

/** Um grupo está ativo se a rota atual casa com a sua ou a de um sub-item. */
function isGroupActive(group: NavGroup): boolean {
  if (group.route && route.path === group.route) return true
  return group.items.some((item) => item.route && route.path === item.route)
}

function isItemActive(item: NavItem): boolean {
  return !!item.route && route.path === item.route
}

function navigateTo(path?: string): void {
  if (path && route.path !== path) void router.push(path)
}

/** Clique no grupo: expande/recolhe quando tem sub-itens; senão navega. */
function onGroupActivate(group: NavGroup): void {
  if (group.items.length > 0) {
    if (collapsed.value) collapsed.value = false
    expanded[group.id] = !expanded[group.id]
    return
  }
  navigateTo(group.route)
}
</script>

<template>
  <aside
    class="flex h-full shrink-0 flex-col border-r border-line bg-surface-canvas transition-[width] duration-200"
    :class="collapsed ? 'w-16' : 'w-56'"
    aria-label="Navegação principal"
  >
    <!-- Marca -->
    <div
      class="flex h-16 shrink-0 items-center border-b border-line"
      :class="collapsed ? 'justify-center px-0' : 'px-4'"
    >
      <span v-if="!collapsed" class="text-2xl font-bold tracking-tight">
        <span class="text-content">Espaço</span><span class="text-accent">N</span>
      </span>
      <span v-else class="text-xl font-bold tracking-tight">
        <span class="text-content">e</span><span class="text-accent">N</span>
      </span>
    </div>

    <!-- Itens -->
    <nav class="scrollbar-noturno flex flex-1 flex-col gap-0.5 overflow-y-auto p-3">
      <NavigationTile
        :label="homeNavTile.label"
        :icon="homeNavTile.icon"
        :active="isHomeActive()"
        :collapsed="collapsed"
        @activate="navigateTo(homeNavTile.route)"
      />

      <template v-for="group in navGroups" :key="group.id">
        <NavigationTile
          :label="group.label"
          :icon="group.icon"
          :active="isGroupActive(group)"
          :soon="group.status === 'soon' && !hasAvailableItems(group)"
          :collapsed="collapsed"
          @activate="onGroupActivate(group)"
        />

        <!-- Sub-itens (expandidos) — indentação clara via guia à esquerda. -->
        <div
          v-if="!collapsed && expanded[group.id] && group.items.length"
          class="ml-4 mt-0.5 mb-1 flex flex-col gap-0.5 border-l border-line pl-2.5"
        >
          <NavigationTile
            v-for="item in group.items"
            :key="item.id"
            :label="item.label"
            :icon="item.icon ?? 'circle'"
            :active="isItemActive(item)"
            :soon="item.status === 'soon'"
            @activate="navigateTo(item.route)"
          />
        </div>
      </template>
    </nav>

    <!-- Recolher -->
    <button
      type="button"
      class="flex h-12 shrink-0 items-center gap-2 border-t border-line text-sm text-content-muted transition-colors hover:text-content outline-none"
      :class="collapsed ? 'justify-center px-0' : 'px-4'"
      :title="collapsed ? 'Expandir menu' : 'Recolher menu'"
      @click="collapsed = !collapsed"
    >
      <i class="pi pi-angle-left transition-transform" :class="{ 'rotate-180': collapsed }" aria-hidden="true"></i>
      <span v-if="!collapsed">Recolher menu</span>
    </button>
  </aside>
</template>
