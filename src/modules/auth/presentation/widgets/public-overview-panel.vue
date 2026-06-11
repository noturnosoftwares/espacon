<script setup lang="ts">
/**
 * PublicOverviewPanel — painel institucional/dinâmico do login (direita, ~65%).
 *
 * **Container**: conhece a `useLoginOverviewStore` (origem dos dados) e distribui
 * os três blocos para componentes **puros** (DashboardSummary, MapPreview,
 * AppCarousel), que recebem tudo por prop. Trata loading / erro discreto / vazio
 * e **nunca** bloqueia o login (ver ADR-007).
 *
 * Conteúdo 100% dinâmico: nada de dashboard/mapa/apps fica fixo aqui.
 */
import { computed, onMounted } from 'vue'
import { useLoginOverviewStore } from '../stores/login-overview-store'
import DashboardSummary from './dashboard-summary.vue'
import MapPreview from './map-preview.vue'
import AppCarousel from './app-carousel.vue'

const store = useLoginOverviewStore()

onMounted(() => {
  void store.load()
})

const hasContent = computed(
  () => store.dashboard.length > 0 || store.map.length > 0 || store.apps.length > 0,
)

const citiesOnMap = computed(() => store.map.length)
</script>

<template>
  <section
    class="relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-gradient-to-br from-surface-canvas to-surface-1 p-6 lg:p-8"
    aria-label="Panorama da rede Noturno"
  >
    <!-- Brilho dourado sutil (premium, discreto) -->
    <div
      class="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-accent/10 blur-3xl"
      aria-hidden="true"
    ></div>

    <!-- Cabeçalho institucional -->
    <header class="relative mb-6">
      <p class="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        Noturno Softwares
      </p>
      <h2 class="mt-1 text-xl font-semibold text-content lg:text-2xl">
        Uma rede, vários sistemas.
      </h2>
      <p class="mt-1 text-sm text-content-muted">
        Tecnologia, presença nacional e um ecossistema de produtos integrados.
      </p>
    </header>

    <!-- Estado: carregando -->
    <div
      v-if="store.loading"
      class="relative flex flex-1 flex-col items-center justify-center gap-3 text-content-muted"
    >
      <i class="pi pi-spinner animate-spin text-2xl" aria-hidden="true"></i>
      <span class="text-sm">Carregando panorama…</span>
    </div>

    <!-- Estado: erro discreto (login segue funcionando) -->
    <div
      v-else-if="store.hasError"
      class="relative flex flex-1 flex-col items-center justify-center gap-2 text-center text-content-muted"
    >
      <i class="pi pi-cloud text-2xl" aria-hidden="true"></i>
      <p class="text-sm">{{ store.errorMessage ?? 'Não foi possível carregar.' }}</p>
      <button
        type="button"
        class="text-sm text-accent transition-colors hover:text-accent-hover outline-none focus-visible:underline"
        @click="store.load()"
      >
        Tentar novamente
      </button>
    </div>

    <!-- Estado: conteúdo -->
    <div v-else-if="hasContent" class="relative flex flex-1 flex-col gap-6">
      <!-- Indicadores (qualquer quantidade) -->
      <DashboardSummary v-if="store.dashboard.length" :indicators="store.dashboard" />

      <!-- Mapa discreto de pontos de atuação -->
      <div v-if="store.map.length" class="flex flex-col gap-2">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase tracking-wide text-content-muted">
            Pontos de atuação
          </h3>
          <span class="text-xs text-content-muted">
            {{ citiesOnMap }} {{ citiesOnMap === 1 ? 'cidade' : 'cidades' }}
          </span>
        </div>
        <div
          class="h-44 overflow-hidden rounded-xl border border-line bg-surface-1/60 lg:h-52"
        >
          <MapPreview :points="store.map" />
        </div>
      </div>

      <!-- Ecossistema de apps -->
      <AppCarousel v-if="store.apps.length" class="mt-auto" :apps="store.apps" />
    </div>

    <!-- Estado: vazio -->
    <div
      v-else
      class="relative flex flex-1 items-center justify-center text-sm text-content-muted"
    >
      Sem dados de panorama no momento.
    </div>
  </section>
</template>
