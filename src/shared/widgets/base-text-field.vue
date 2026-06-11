<script setup lang="ts">
/**
 * BaseTextField — input de texto do Design System (§8.1) já embrulhado em
 * FormField (label/hint/erro). Fundo `surface-1`, `radius-field`, altura 40px,
 * estados hover/foco/erro padronizados. Substitui inputs "na mão" nas telas.
 */
import { useId } from 'vue'
import FormField from './form-field.vue'

withDefaults(
  defineProps<{
    modelValue?: string | number | null
    label?: string
    hint?: string
    error?: string | null
    placeholder?: string
    type?: string
    required?: boolean
    disabled?: boolean
    autocomplete?: string
    inputmode?: 'text' | 'email' | 'numeric' | 'tel' | 'search'
  }>(),
  { type: 'text' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()
</script>

<template>
  <FormField :label="label" :hint="hint" :error="error" :required="required" :html-for="id">
    <input
      :id="id"
      :value="modelValue ?? ''"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :required="required"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      class="h-10 w-full rounded-field border bg-surface-1 px-3.5 text-sm text-content placeholder:text-content-muted outline-none transition-[color,border-color,box-shadow] duration-[var(--duration-fast)] hover:border-line focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-40"
      :class="error ? 'border-danger' : 'border-line-subtle'"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </FormField>
</template>
