<script setup lang="ts">
/**
 * DateField — campo de **data** (Design System §8.1) com **calendário + digitação
 * manual**. Usa o PrimeVue `DatePicker` (preset Noturno): aceita digitar
 * `dd/mm/aaaa` direto (rápido, sem precisar do popup) **e** abre o calendário pelo
 * ícone. Resolve a dor do `<input type="date">` nativo (péssimo para digitar).
 *
 * O `modelValue` trafega em **ISO `yyyy-mm-dd`** (contrato dos models); a
 * conversão de/para `Date` fica encapsulada aqui.
 */
import { computed, useId } from 'vue'
import DatePicker from 'primevue/datepicker'
import FormField from './form-field.vue'

const props = defineProps<{
  modelValue?: string | null
  label?: string
  hint?: string
  error?: string | null
  required?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
const id = useId()

function fromIso(iso: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso ?? '').trim())
  if (!match) return null
  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
}
function toIso(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const selectedDate = computed(() => fromIso(props.modelValue))

function onUpdate(value: Date | Date[] | (Date | null)[] | null | undefined): void {
  emit('update:modelValue', value instanceof Date ? toIso(value) : null)
}

const inputClass =
  'h-10 w-full rounded-field border bg-surface-1 pl-3.5 pr-10 text-sm text-content placeholder:text-content-muted outline-none transition-[color,border-color,box-shadow] duration-[var(--duration-fast)] hover:border-line focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-40'
</script>

<template>
  <FormField :label="label" :hint="hint" :error="error" :required="required" :html-for="id">
    <DatePicker
      :input-id="id"
      :model-value="selectedDate"
      date-format="dd/mm/yy"
      placeholder="dd/mm/aaaa"
      show-icon
      icon-display="input"
      :manual-input="true"
      :disabled="disabled"
      fluid
      :pt="{
        root: { class: 'relative w-full' },
        pcInputText: { root: { class: [inputClass, error ? '!border-danger' : ''] } },
        inputIconContainer: {
          class:
            'absolute right-3 top-1/2 flex -translate-y-1/2 items-center text-content-muted',
        },
      }"
      @update:model-value="onUpdate"
    />
  </FormField>
</template>
