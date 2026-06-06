<script setup lang="ts">
/**
 * AppCarousel — carrossel do **ecossistema de produtos** da Noturno.
 *
 * Componente **puro/dinâmico**: recebe `apps` por prop (cresce sem alterar a UI)
 * e não conhece a origem dos dados. Carrossel nativo (scroll-snap + botões), sem
 * dependência externa (regra do template: preferir solução própria simples).
 */
import { computed, onMounted, onBeforeUnmount, ref } from 'vue'
import type { AppStatus, OverviewApp } from '../../domain/models'
import { overviewIconClass } from './overview-icon'

defineProps<{
  apps: OverviewApp[]
}>()

const track = ref<HTMLElement | null>(null)
const canPrev = ref(false)
const canNext = ref(false)

const STATUS_LABEL: Readonly<Record<AppStatus, string>> = {
  active: 'Ativo',
  inactive: 'Inativo',
  soon: 'Em breve',
}

function updateArrows(): void {
  const el = track.value
  if (!el) return
  canPrev.value = el.scrollLeft > 4
  canNext.value = el.scrollLeft + el.clientWidth < el.scrollWidth - 4
}

function scrollByCards(direction: 1 | -1): void {
  const el = track.value
  if (!el) return
  // Desliza ~80% da área visível por clique.
  el.scrollBy({ left: direction * el.clientWidth * 0.8, behavior: 'smooth' })
}

onMounted(() => {
  updateArrows()
  window.addEventListener('resize', updateArrows)
})
onBeforeUnmount(() => window.removeEventListener('resize', updateArrows))

const hasControls = computed(() => canPrev.value || canNext.value)
</script>

<template>
  <div class="flex flex-col gap-3">
    <div class="flex items-center justify-between">
      <h3 class="text-sm font-semibold uppercase tracking-wide text-noturno-grey-light">
        Ecossistema Noturno
      </h3>
      <div v-if="hasControls" class="flex gap-1.5">
        <button
          type="button"
          :disabled="!canPrev"
          aria-label="Anterior"
          class="flex h-7 w-7 items-center justify-center rounded-md border border-noturno-grey-light-clean-3 text-noturno-grey-light transition-colors hover:border-noturno-orange hover:text-noturno-orange disabled:opacity-30 disabled:hover:border-noturno-grey-light-clean-3 disabled:hover:text-noturno-grey-light outline-none"
          @click="scrollByCards(-1)"
        >
          <i class="pi pi-chevron-left text-xs" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          :disabled="!canNext"
          aria-label="Próximo"
          class="flex h-7 w-7 items-center justify-center rounded-md border border-noturno-grey-light-clean-3 text-noturno-grey-light transition-colors hover:border-noturno-orange hover:text-noturno-orange disabled:opacity-30 disabled:hover:border-noturno-grey-light-clean-3 disabled:hover:text-noturno-grey-light outline-none"
          @click="scrollByCards(1)"
        >
          <i class="pi pi-chevron-right text-xs" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <ul
      ref="track"
      class="flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      @scroll="updateArrows"
    >
      <li
        v-for="app in apps"
        :key="app.id"
        class="flex w-44 shrink-0 snap-start flex-col gap-2 rounded-xl border border-noturno-grey-light-clean-3 bg-noturno-black-2/70 p-4 transition-colors hover:border-noturno-orange/40"
      >
        <div class="flex items-center justify-between">
          <span
            class="flex h-9 w-9 items-center justify-center rounded-lg bg-noturno-black-secondary text-noturno-orange"
            aria-hidden="true"
          >
            <i :class="overviewIconClass(app.icon)"></i>
          </span>
          <span
            class="flex items-center gap-1 text-[0.65rem] font-medium uppercase tracking-wide"
            :class="app.status === 'active' ? 'text-noturno-green' : 'text-noturno-grey-light'"
          >
            <span
              v-if="app.status === 'active'"
              class="inline-block h-1.5 w-1.5 rounded-full bg-noturno-green"
            ></span>
            {{ STATUS_LABEL[app.status] }}
          </span>
        </div>
        <div class="text-sm font-semibold text-noturno-white">{{ app.name }}</div>
        <p class="text-xs leading-relaxed text-noturno-grey-light">{{ app.description }}</p>
      </li>
    </ul>
  </div>
</template>
