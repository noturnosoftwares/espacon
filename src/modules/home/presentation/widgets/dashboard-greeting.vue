<script setup lang="ts">
/**
 * DashboardGreeting — saudação do topo do painel: "Bom dia/tarde/noite, <nome>!"
 * + subtítulo institucional, com a data atual à direita.
 *
 * A saudação e a data são derivadas do relógio local; o nome vem da sessão
 * (`useSessionStore`). Sem regra de negócio — apenas apresentação.
 */
import { computed } from 'vue'
import { useSessionStore } from '@/modules/auth/presentation/stores'

const session = useSessionStore()

const now = new Date()

const greetingWord = computed(() => {
  const hour = now.getHours()
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
})

const firstName = computed(() => session.user?.name ?? 'Usuário')

const longDate = computed(() =>
  now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }),
)
const weekday = computed(() =>
  now.toLocaleDateString('pt-BR', { weekday: 'long' }),
)

/** Capitaliza a primeira letra (pt-BR retorna minúsculo). */
function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}
</script>

<template>
  <div class="flex flex-wrap items-start justify-between gap-4">
    <div>
      <h1 class="text-2xl font-bold text-content lg:text-3xl">
        {{ greetingWord }}, {{ firstName }}! <span aria-hidden="true">👋</span>
      </h1>
      <p class="mt-1 text-sm text-content-muted">
        Bem-vindo ao <span class="font-semibold text-accent">EspaçoN</span>, sua central de
        gestão da Noturno Softwares.
      </p>
    </div>

    <div class="flex items-center gap-2 text-right text-content-muted">
      <i class="pi pi-calendar text-base" aria-hidden="true"></i>
      <div class="leading-tight">
        <div class="text-sm font-medium text-content-soft">{{ capitalize(longDate) }}</div>
        <div class="text-xs">{{ capitalize(weekday) }}</div>
      </div>
    </div>
  </div>
</template>
