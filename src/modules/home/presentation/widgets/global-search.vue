<script setup lang="ts">
/**
 * GlobalSearch — campo de busca global do Header (visual premium).
 *
 * Estrutura base: campo grande com ícone e atalho visual **Ctrl + K** (que foca
 * o campo). A busca inteligente é etapa futura (ver "Próxima Etapa" da home spec)
 * — por ora o campo é apresentacional, sem backend. Estado local apenas (foco).
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'

const input = ref<HTMLInputElement | null>(null)

/** Ctrl/⌘ + K foca a busca (padrão de produtividade). */
function onKeydown(event: KeyboardEvent): void {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    input.value?.focus()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="relative w-full max-w-xl">
    <i
      class="pi pi-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted"
      aria-hidden="true"
    ></i>
    <input
      ref="input"
      type="search"
      aria-label="Busca global"
      placeholder="Buscar cliente, contrato, licença, chamado..."
      class="w-full rounded-xl border border-line bg-surface-1 py-2.5 pl-10 pr-16 text-sm text-content placeholder:text-content-muted outline-none transition-colors focus-visible:border-accent focus-visible:ring-1 focus-visible:ring-accent"
    />
    <kbd
      class="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-line bg-surface-canvas px-1.5 py-0.5 text-[0.65rem] font-medium text-content-muted"
    >
      Ctrl + K
    </kbd>
  </div>
</template>
