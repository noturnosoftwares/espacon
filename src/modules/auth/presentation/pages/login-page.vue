<script setup lang="ts">
/**
 * LoginPage — tela inicial do EspaçoN (rota `/`): acesso (esquerda, ~35%) +
 * panorama público da rede Noturno (direita, ~65%). Ver
 * `docs/specifications/auth/login.md`.
 *
 * A page apenas orquestra a presentation: inicializa o formulário no mount e
 * navega após o login. O panorama (`PublicOverviewPanel`) é autossuficiente —
 * carrega seus próprios dados em paralelo, sem atrasar o formulário. O
 * redirecionamento por sessão salva é feito pelo guard de rota (`src/router`),
 * antes desta page montar. Nenhuma regra de negócio aqui.
 *
 * Responsividade: no mobile o formulário vem **primeiro** (a ação nunca abaixo
 * da dobra); o panorama aparece abaixo e a partir de `lg` fica ao lado.
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth-store'
import LoginPanel from '../widgets/login-panel.vue'
import PublicOverviewPanel from '../widgets/public-overview-panel.vue'

const router = useRouter()
const authStore = useAuthStore()

onMounted(() => {
  authStore.init()
})

function goToDashboard(): void {
  void router.replace('/dashboard')
}

function goToRecover(): void {
  void router.push('/recuperar-senha')
}
</script>

<template>
  <main class="min-h-screen w-full bg-surface-canvas p-4 sm:p-6 lg:p-8">
    <div
      class="grid h-full min-h-[calc(100vh-3rem)] grid-cols-1 items-stretch gap-6 lg:grid-cols-[460px_1fr]"
    >
      <!-- Esquerda: ação (protagonista, largura fixa). No mobile (grid-cols-1) a
           ordem do DOM mantém o formulário primeiro e o panorama logo abaixo. -->
      <LoginPanel @authenticated="goToDashboard" @recover="goToRecover" />

      <!-- Direita: panorama público/dinâmico — expande para ocupar o resto da tela -->
      <PublicOverviewPanel />
    </div>
  </main>
</template>
