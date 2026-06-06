<script setup lang="ts">
/**
 * HomePage — tela principal do EspaçoN (rota `/dashboard`), a porta de entrada
 * do sistema. Ver `docs/specifications/home/README.md`.
 *
 * Estrutura base em 3 áreas: Header (topo), Sidebar (navegação à esquerda) e
 * Workspace (área central). A page apenas compõe o shell e carrega a sessão
 * corrente (para o Header/perfil); o acesso é protegido pelo guard de rota
 * (`requiresAuth`). Nenhuma regra de negócio aqui.
 */
import { onMounted } from 'vue'
import { useSessionStore } from '@/modules/auth/presentation/stores'
import AppHeader from '../widgets/app-header.vue'
import AppSidebar from '../widgets/app-sidebar.vue'
import HomeWorkspace from '../widgets/home-workspace.vue'

const session = useSessionStore()

onMounted(() => {
  session.load()
})
</script>

<template>
  <div class="flex h-screen flex-col bg-noturno-black-secondary">
    <AppHeader />
    <div class="flex min-h-0 flex-1">
      <AppSidebar />
      <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <HomeWorkspace />
      </main>
    </div>
  </div>
</template>
