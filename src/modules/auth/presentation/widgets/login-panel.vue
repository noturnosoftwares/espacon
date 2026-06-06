<script setup lang="ts">
/**
 * LoginPanel — coluna de **ação** do login (esquerda, ~35%), o protagonista
 * visual da tela. Formulário objetivo de baixo atrito: e-mail, senha
 * (mostrar/ocultar), "Lembrar e-mail", "Manter acesso", CTA "ENTRAR" e link
 * "Recuperar senha".
 *
 * Liga-se à `useAuthStore` (sem regra de negócio na tela). A navegação fica na
 * page: emite `authenticated` em sucesso e `recover` no link.
 *
 * Design System: o **único** elemento dourado de destaque é o botão ENTRAR
 * (isolamento / Von Restorff). Nenhuma cor fora da paleta da Noturno.
 */
import { useAuthStore } from '../stores/auth-store'

const store = useAuthStore()

const emit = defineEmits<{
  authenticated: []
  recover: []
}>()

async function onSubmit(): Promise<void> {
  const session = await store.submit()
  if (session) emit('authenticated')
}
</script>

<template>
  <section
    class="flex w-full flex-col justify-center rounded-2xl border border-noturno-grey-light-clean-3 bg-noturno-black-2/40 p-6 lg:p-8"
    aria-labelledby="login-title"
  >
    <div class="mx-auto w-full max-w-md">
      <!-- Marca (destaque) -->
      <div class="mb-8">
        <div class="flex items-baseline gap-0.5 text-5xl font-bold tracking-tight lg:text-6xl">
          <span class="text-noturno-white">Espaço</span>
          <span class="text-noturno-orange">N</span>
        </div>
        <p class="mt-2 text-sm text-noturno-grey-light">Plataforma de gestão da Noturno</p>
      </div>

      <h1 id="login-title" class="mb-6 text-xl font-semibold text-noturno-white">
        Bem-vindo ao EspaçoN
      </h1>

      <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
        <!-- E-mail -->
        <div class="flex flex-col gap-1.5">
          <label for="login-email" class="text-sm font-medium text-noturno-grey-light-clean">
            E-mail
          </label>
          <input
            id="login-email"
            v-model="store.email"
            type="email"
            autocomplete="username"
            inputmode="email"
            placeholder="voce@empresa.com.br"
            class="rounded-lg border border-noturno-grey-light-clean-3 bg-noturno-black-2 px-3.5 py-2.5 text-noturno-white placeholder:text-noturno-grey-light outline-none transition-colors focus-visible:border-noturno-orange focus-visible:ring-1 focus-visible:ring-noturno-orange"
          />
        </div>

        <!-- Senha -->
        <div class="flex flex-col gap-1.5">
          <label for="login-password" class="text-sm font-medium text-noturno-grey-light-clean">
            Senha
          </label>
          <div class="relative">
            <input
              id="login-password"
              v-model="store.password"
              :type="store.showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Sua senha"
              class="w-full rounded-lg border border-noturno-grey-light-clean-3 bg-noturno-black-2 px-3.5 py-2.5 pr-11 text-noturno-white placeholder:text-noturno-grey-light outline-none transition-colors focus-visible:border-noturno-orange focus-visible:ring-1 focus-visible:ring-noturno-orange"
            />
            <button
              type="button"
              :aria-label="store.showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              :aria-pressed="store.showPassword"
              class="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-noturno-grey-light transition-colors hover:text-noturno-white focus-visible:text-noturno-white outline-none"
              @click="store.toggleShowPassword()"
            >
              <i :class="store.showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" aria-hidden="true"></i>
            </button>
          </div>
        </div>

        <!-- Opções -->
        <div class="flex flex-col gap-2.5">
          <label class="flex cursor-pointer items-center gap-2 text-sm text-noturno-grey-light-clean">
            <input
              v-model="store.rememberEmail"
              type="checkbox"
              class="h-4 w-4 accent-noturno-orange"
            />
            Lembrar e-mail
          </label>
          <label class="flex cursor-pointer items-center gap-2 text-sm text-noturno-grey-light-clean">
            <input
              v-model="store.keepSignedIn"
              type="checkbox"
              class="h-4 w-4 accent-noturno-orange"
            />
            Manter acesso
          </label>
        </div>

        <!-- Erro de acesso -->
        <p
          v-if="store.hasError"
          role="alert"
          class="rounded-lg border border-noturno-red/40 bg-noturno-red/10 px-3 py-2 text-sm text-noturno-red"
        >
          {{ store.errorMessage }}
        </p>

        <!-- CTA primário (único dourado de destaque) -->
        <button
          type="submit"
          :disabled="store.loading"
          class="mt-1 flex items-center justify-center gap-2 rounded-lg bg-noturno-orange px-4 py-3 text-sm font-bold uppercase tracking-wide text-noturno-black transition-colors hover:bg-noturno-orange-dark disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-noturno-orange focus-visible:ring-offset-2 focus-visible:ring-offset-noturno-black-secondary"
        >
          <i v-if="store.loading" class="pi pi-spinner animate-spin" aria-hidden="true"></i>
          <span>{{ store.loading ? 'Entrando…' : 'Entrar' }}</span>
        </button>

        <!-- Confiança junto ao CTA -->
        <p class="flex items-center justify-center gap-1.5 text-xs text-noturno-grey-light">
          <i class="pi pi-lock text-[0.7rem]" aria-hidden="true"></i>
          Seu acesso é protegido. A senha nunca é salva no navegador.
        </p>

        <!-- Link secundário (discreto) -->
        <div class="mt-1 text-center">
          <button
            type="button"
            class="text-sm text-noturno-grey-light transition-colors hover:text-noturno-orange focus-visible:text-noturno-orange outline-none"
            @click="emit('recover')"
          >
            Recuperar senha →
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
