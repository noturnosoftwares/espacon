<script setup lang="ts">
/**
 * LookupField — campo de **referência a outro registro** (Design System §9.2).
 * Visualmente é um **campo de busca** (search): mostra o registro selecionado
 * (ou o placeholder) e um ícone de busca; acionar emite `open` — a página/diálogo
 * de pesquisa que **retorna o registro** é plugada por quem usa (pode ainda não
 * existir: o campo já nasce no formato certo).
 *
 * NÃO é um select/listbox nem digitação livre. O valor escolhido vem de um
 * registro existente; `formatSelected(value)` resolve o rótulo exibido.
 */
import { computed } from 'vue'
import { useId } from 'vue'
import FormField from './form-field.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    placeholder?: string
    hint?: string
    error?: string | null
    required?: boolean
    disabled?: boolean
    formatSelected?: (value: string | number) => string
    /** Id explícito do botão — usado para **devolver o foco** ao voltar da busca. */
    inputId?: string
  }>(),
  {},
)

const emit = defineEmits<{
  open: []
  clear: []
  'update:modelValue': [value: string | number | null]
}>()

const generatedId = useId()
const id = computed(() => props.inputId ?? generatedId)

const hasValue = computed(() => props.modelValue != null && props.modelValue !== '')
const display = computed(() =>
  hasValue.value
    ? (props.formatSelected?.(props.modelValue as string | number) ?? `#${props.modelValue}`)
    : '',
)

function onClear(): void {
  emit('update:modelValue', null)
  emit('clear')
}
</script>

<template>
  <FormField :label="label" :hint="hint" :error="error" :required="required" :html-for="id">
    <div
      class="flex h-10 w-full items-center gap-2 rounded-field border bg-surface-1 pl-3 pr-2 transition-[color,border-color,box-shadow] duration-[var(--duration-fast)]"
      :class="[
        error ? 'border-danger' : 'border-line-subtle',
        disabled
          ? 'opacity-40'
          : 'hover:border-line focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
      ]"
    >
      <i class="pi pi-search shrink-0 text-content-muted" aria-hidden="true"></i>
      <button
        :id="id"
        type="button"
        :disabled="disabled"
        class="min-w-0 flex-1 truncate bg-transparent text-left text-sm outline-none"
        :class="hasValue ? 'text-content' : 'text-content-muted'"
        @click="emit('open')"
      >
        {{ hasValue ? display : (placeholder ?? 'Buscar registro…') }}
      </button>
      <button
        v-if="hasValue && !disabled"
        type="button"
        aria-label="Limpar"
        class="ds-focus-ring flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-content-muted hover:text-content"
        @click="onClear"
      >
        <i class="pi pi-times text-xs" aria-hidden="true"></i>
      </button>
    </div>
  </FormField>
</template>
