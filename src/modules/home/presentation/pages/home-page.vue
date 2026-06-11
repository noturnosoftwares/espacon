<script setup lang="ts">
/**
 * HomePage — conteúdo do **painel inicial** (rota `/dashboard`), renderizado
 * dentro do `AppShell` (sidebar + topbar). Ver `docs/specifications/home/README.md`.
 *
 * A casca (Header/Sidebar) e o carregamento da sessão vivem no `AppShell`; esta
 * page apenas entrega o workspace do dashboard, que carrega seu próprio store.
 * Nenhuma regra de negócio aqui.
 */
import HomeWorkspace from '../widgets/home-workspace.vue'
</script>

<template>
  <HomeWorkspace />
</template>
