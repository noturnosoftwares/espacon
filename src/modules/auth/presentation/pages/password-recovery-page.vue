<script setup lang="ts">
/**
 * PasswordRecoveryPage — recuperação de senha (rota `/recuperar-senha`).
 * Ver `docs/specifications/auth/password-recovery.md`.
 *
 * Tela standalone (fora do `AppShell`, `guestOnly`): o usuário informa o e-mail
 * e recebe instruções de redefinição. **Anti-enumeração**: o sucesso é genérico
 * e não revela se o e-mail existe — sempre o mesmo estado de confirmação.
 *
 * A page apenas orquestra a presentation (sem regra de negócio): inicializa no
 * mount, dispara o envio pela store e navega de volta ao login.
 */
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { BaseButton, BaseTextField } from '@/shared/widgets'
import { usePasswordRecoveryStore } from '../stores'

const router = useRouter()
const store = usePasswordRecoveryStore()

onMounted(() => {
  store.init()
})

function goToLogin(): void {
  void router.push('/')
}
</script>

<template>
  <main class="flex min-h-screen w-full items-center justify-center bg-surface-canvas p-4 sm:p-6">
    <section
      class="w-full max-w-md rounded-panel border border-line-subtle bg-surface-1/60 p-6 lg:p-8"
      aria-labelledby="recovery-title"
    >
      <!-- Marca -->
      <div class="mb-8">
        <div class="flex items-baseline gap-0.5 text-4xl font-bold tracking-tight">
          <span class="text-content">Espaço</span>
          <span class="text-accent">N</span>
        </div>
        <p class="mt-2 text-sm text-content-muted">Plataforma de gestão da Noturno</p>
      </div>

      <!-- Estado: formulário -->
      <template v-if="!store.sent">
        <h1 id="recovery-title" class="mb-1 text-xl font-semibold text-content">
          Recuperar senha
        </h1>
        <p class="mb-6 text-sm text-content-muted">
          Informe o e-mail da sua conta. Enviaremos as instruções para redefinir sua senha.
        </p>

        <form class="flex flex-col gap-4" novalidate @submit.prevent="store.submit()">
          <BaseTextField
            v-model="store.email"
            label="E-mail"
            type="email"
            inputmode="email"
            autocomplete="username"
            placeholder="voce@empresa.com.br"
          />

          <!-- Erro de validação/envio -->
          <p
            v-if="store.hasError"
            role="alert"
            class="flex items-center gap-2 rounded-field border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
          >
            <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
            {{ store.errorMessage }}
          </p>

          <BaseButton
            type="submit"
            block
            class="mt-1"
            :loading="store.loading"
            :label="store.loading ? 'Enviando…' : 'Enviar instruções'"
          />
        </form>
      </template>

      <!-- Estado: confirmação (anti-enumeração — sempre o mesmo) -->
      <template v-else>
        <div class="flex flex-col items-center text-center">
          <span
            class="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success"
          >
            <i class="pi pi-envelope text-xl" aria-hidden="true"></i>
          </span>
          <h1 id="recovery-title" class="mb-1 text-xl font-semibold text-content">
            Verifique seu e-mail
          </h1>
          <p class="text-sm text-content-muted">
            Se houver uma conta associada a
            <span class="text-content">{{ store.email }}</span>, você receberá as instruções
            para redefinir a senha em instantes.
          </p>
          <button
            type="button"
            class="ds-focus-ring mt-5 text-sm text-content-muted transition-colors hover:text-accent"
            @click="store.reset()"
          >
            Reenviar para outro e-mail
          </button>
        </div>
      </template>

      <!-- Voltar ao login -->
      <div class="mt-6 text-center">
        <button
          type="button"
          class="ds-focus-ring inline-flex items-center gap-1.5 text-sm text-content-muted transition-colors hover:text-accent"
          @click="goToLogin"
        >
          <i class="pi pi-arrow-left text-xs" aria-hidden="true"></i>
          Voltar ao login
        </button>
      </div>
    </section>
  </main>
</template>
