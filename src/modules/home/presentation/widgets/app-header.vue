<script setup lang="ts">
/**
 * AppHeader — topo da aplicação (ver home spec):
 * `[ Busca Global ]            [ Notificação ] [ Ajuda ] [ Perfil ]`.
 *
 * Apenas composição de widgets do Header; sem regra de negócio. Notificações e
 * Ajuda são estrutura base (menus/centrais são etapas futuras).
 */
import GlobalSearch from './global-search.vue'
import NotificationsButton from './notifications-button.vue'
import ProfileMenu from './profile-menu.vue'
</script>

<template>
  <header
    class="flex h-16 shrink-0 items-center gap-4 border-b border-line bg-surface-canvas px-4 lg:px-6"
  >
    <!-- Busca global (à esquerda, ampla) -->
    <div class="flex flex-1 items-center">
      <GlobalSearch />
    </div>

    <div class="flex shrink-0 items-center gap-2.5">
      <NotificationsButton :count="3" />

      <button
        type="button"
        title="Ajuda — em breve"
        aria-label="Ajuda"
        class="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface-1 text-content-muted transition-colors hover:border-accent/50 hover:text-content outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        <i class="pi pi-question-circle" aria-hidden="true"></i>
      </button>

      <ProfileMenu />
    </div>
  </header>
</template>
