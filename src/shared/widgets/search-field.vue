<script setup lang="ts">
/**
 * SearchField — campo de busca padrão (§8.1/9.1). Ícone à esquerda com padding
 * reservado (NUNCA sobrepõe o texto — bug do DS §8.1). Busca por **Enter**
 * (emite `search`); a digitação só atualiza o modelo (filtro no cache, nunca
 * busca incremental no backend — §9.1). Botão limpar quando há texto.
 */
defineProps<{
  modelValue: string
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  search: []
  clear: []
}>()

function onInput(event: Event): void {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

function onClear(): void {
  emit('update:modelValue', '')
  emit('clear')
}
</script>

<template>
  <div class="relative w-full">
    <i
      class="pi pi-search pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-content-muted"
      aria-hidden="true"
    ></i>
    <input
      :value="modelValue"
      type="search"
      :placeholder="placeholder ?? 'Buscar…'"
      class="h-10 w-full rounded-field border border-line-subtle bg-surface-1 pl-10 pr-10 text-sm text-content placeholder:text-content-muted outline-none transition-[color,border-color,box-shadow] duration-[var(--duration-fast)] hover:border-line focus:border-accent focus:ring-2 focus:ring-accent/20"
      @input="onInput"
      @keydown.enter.prevent="emit('search')"
    />
    <button
      v-if="modelValue"
      type="button"
      aria-label="Limpar busca"
      class="ds-focus-ring absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-content-muted hover:text-content"
      @click="onClear"
    >
      <i class="pi pi-times text-xs" aria-hidden="true"></i>
    </button>
  </div>
</template>
