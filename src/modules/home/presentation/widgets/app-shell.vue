<script setup lang="ts">
/**
 * AppShell — casca da aplicação autenticada (Design System §8.9). Toda tela
 * logada (dashboard, usuários, perfis…) vive AQUI: sidebar (recolhível) +
 * topbar + área de conteúdo em `surface-canvas` via `<RouterView>`. Proíbe
 * página solta full-bleed dentro do app (§12).
 *
 * Carrega a sessão corrente (para o Header/perfil) uma única vez; o acesso é
 * protegido pelo guard de rota (`requiresAuth`). Sem regra de negócio aqui.
 */
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useSessionStore } from '@/modules/auth/presentation/stores'
import AppHeader from './app-header.vue'
import AppSidebar from './app-sidebar.vue'

const session = useSessionStore()

onMounted(() => {
  session.load()
})
</script>

<template>
  <div class="flex h-screen flex-col bg-surface-canvas text-content">
    <AppHeader />
    <div class="flex min-h-0 flex-1">
      <AppSidebar />
      <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <RouterView />
      </main>
    </div>
  </div>
</template>
