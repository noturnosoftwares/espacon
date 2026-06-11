<script setup lang="ts">
/**
 * LoginPanel — coluna de **ação** do login (esquerda), protagonista visual da
 * tela. Formulário objetivo de baixo atrito: e-mail, senha (mostrar/ocultar),
 * "Lembrar e-mail", "Manter acesso", CTA "Entrar" e link "Recuperar senha".
 *
 * Liga-se à `useAuthStore` (sem regra de negócio na tela). A navegação fica na
 * page: emite `authenticated` em sucesso e `recover` no link.
 *
 * Design System (§8): campo e botão vêm dos componentes-base; o **único**
 * elemento dourado de destaque é o botão Entrar (isolamento / Von Restorff).
 */
import { useId } from 'vue'
import { BaseButton, BaseTextField, FormField } from '@/shared/widgets'
import { useAuthStore } from '../stores/auth-store'

const store = useAuthStore()
const passwordId = useId()

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
    class="flex w-full flex-col justify-center rounded-panel border border-line-subtle bg-surface-1/60 p-6 lg:p-8"
    aria-labelledby="login-title"
  >
    <div class="mx-auto w-full max-w-md">
      <!-- Marca (destaque) -->
      <div class="mb-8">
        <div class="flex items-baseline gap-0.5 text-5xl font-bold tracking-tight lg:text-6xl">
          <span class="text-content">Espaço</span>
          <span class="text-accent">N</span>
        </div>
        <p class="mt-2 text-sm text-content-muted">Plataforma de gestão da Noturno</p>
      </div>

      <h1 id="login-title" class="mb-6 text-xl font-semibold text-content">
        Bem-vindo ao EspaçoN
      </h1>

      <form class="flex flex-col gap-4" novalidate @submit.prevent="onSubmit">
        <!-- E-mail -->
        <BaseTextField
          v-model="store.email"
          label="E-mail"
          type="email"
          inputmode="email"
          autocomplete="username"
          placeholder="voce@empresa.com.br"
        />

        <!-- Senha -->
        <FormField label="Senha" :html-for="passwordId">
          <div class="relative">
            <input
              :id="passwordId"
              v-model="store.password"
              :type="store.showPassword ? 'text' : 'password'"
              autocomplete="current-password"
              placeholder="Sua senha"
              class="h-10 w-full rounded-field border border-line-subtle bg-surface-1 px-3.5 pr-11 text-sm text-content placeholder:text-content-muted outline-none transition-[color,border-color,box-shadow] duration-[var(--duration-fast)] hover:border-line focus:border-accent focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="button"
              :aria-label="store.showPassword ? 'Ocultar senha' : 'Mostrar senha'"
              :aria-pressed="store.showPassword"
              class="ds-focus-ring absolute inset-y-0 right-0 flex w-11 items-center justify-center text-content-muted transition-colors hover:text-content"
              @click="store.toggleShowPassword()"
            >
              <i :class="store.showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'" aria-hidden="true"></i>
            </button>
          </div>
        </FormField>

        <!-- Opções -->
        <div class="flex flex-col gap-2.5">
          <label class="flex cursor-pointer items-center gap-2 text-sm text-content-soft">
            <input v-model="store.rememberEmail" type="checkbox" class="h-4 w-4 accent-accent" />
            Lembrar e-mail
          </label>
          <label class="flex cursor-pointer items-center gap-2 text-sm text-content-soft">
            <input v-model="store.keepSignedIn" type="checkbox" class="h-4 w-4 accent-accent" />
            Manter acesso
          </label>
        </div>

        <!-- Erro de acesso -->
        <p
          v-if="store.hasError"
          role="alert"
          class="flex items-center gap-2 rounded-field border border-danger/40 bg-danger-soft px-3 py-2 text-sm text-danger"
        >
          <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
          {{ store.errorMessage }}
        </p>

        <!-- CTA primário (único dourado de destaque) -->
        <BaseButton
          type="submit"
          block
          class="mt-1"
          :loading="store.loading"
          :label="store.loading ? 'Entrando…' : 'Entrar'"
        />

        <!-- Confiança junto ao CTA -->
        <p class="flex items-center justify-center gap-1.5 text-xs text-content-muted">
          <i class="pi pi-lock text-[0.7rem]" aria-hidden="true"></i>
          Seu acesso é protegido. A senha nunca é salva no navegador.
        </p>

        <!-- Link secundário (discreto) -->
        <div class="mt-1 text-center">
          <button
            type="button"
            class="ds-focus-ring text-sm text-content-muted transition-colors hover:text-accent"
            @click="emit('recover')"
          >
            Esqueci minha senha →
          </button>
        </div>
      </form>
    </div>
  </section>
</template>
