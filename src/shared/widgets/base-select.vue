<script setup lang="ts" generic="T">
/**
 * BaseSelect — campo de **seleção** do Design System (§8.1), **par exato** do
 * `BaseTextField` para opções discretas. Mesma anatomia de TODOS os campos:
 * `FormField` (label em cima → controle → hint/erro embaixo) e a **mesma caixa**
 * (altura 40px, borda em repouso `border-line-subtle`, hover `border-line`, foco
 * dourado + anel suave, erro `border-danger`).
 *
 * A caixa é pintada com os mesmos utilitários do `BaseTextField` (camada
 * `tailwind-utilities`, que vence a camada `primevue`), em vez de depender do tema
 * do PrimeVue — assim a borda aparece **em repouso**, igual aos demais campos.
 *
 * Use como o `BaseTextField` (passe `label`/`hint`/`error`), ou solto sem `label`
 * (ex.: filtro de barra). `T` = tipo do valor selecionado.
 */
import { computed, useId } from 'vue'
import Select from 'primevue/select'
import FormField from './form-field.vue'

const props = withDefaults(
  defineProps<{
    modelValue: T
    options: unknown[]
    optionLabel?: string
    optionValue?: string
    label?: string
    hint?: string
    error?: string | null
    placeholder?: string
    required?: boolean
    disabled?: boolean
    /** Largura total (padrão). A largura final é dada pelo container. */
    fluid?: boolean
    /** Rótulo acessível quando usado solto, sem `label`. */
    ariaLabel?: string
  }>(),
  { fluid: true },
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [value: T]
}>()

const id = useId()

// Mesma caixa do BaseTextField (estados padrão/hover/foco/erro/desabilitado).
const rootClass = computed(() => [
  'flex h-10 items-center rounded-field border bg-surface-1 text-sm text-content outline-none transition-[color,border-color,box-shadow] duration-[var(--duration-fast)]',
  props.disabled
    ? 'opacity-40'
    : 'hover:border-line focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
  props.error ? 'border-danger' : 'border-line-subtle',
  props.fluid ? 'w-full' : '',
])

function onUpdate(value: unknown): void {
  emit('update:modelValue', value as T)
}
function onChange(event: { value: unknown }): void {
  emit('change', event.value as T)
}
</script>

<template>
  <FormField :label="label" :hint="hint" :error="error" :required="required" :html-for="id">
    <Select
      :input-id="id"
      :model-value="modelValue"
      :options="options"
      :option-label="optionLabel"
      :option-value="optionValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :fluid="fluid"
      :aria-label="ariaLabel"
      :pt="{
        root: { class: rootClass },
        label: { class: 'min-w-0 flex-1 truncate pl-3.5 pr-2 text-left' },
        dropdown: { class: 'flex w-9 shrink-0 items-center justify-center text-content-muted' },
      }"
      @update:model-value="onUpdate"
      @change="onChange"
    />
  </FormField>
</template>
