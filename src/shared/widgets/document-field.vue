<script setup lang="ts">
/**
 * DocumentField — campo de **CPF/CNPJ combinado** que decide o formato **pelo
 * comprimento**: até 11 caracteres aplica máscara de **CPF** (`000.000.000-00`);
 * ao passar de 11, vira **CNPJ** (`00.000.000/0000-00`, aceitando o novo formato
 * **alfanumérico** — ADR-009). A máscara é aplicada **enquanto digita**
 * (formatação progressiva). Guarda o valor **normalizado** (dígitos/alfanum.
 * maiúsculos, sem máscara); a validação (`isValidCpf`/`isValidCnpj`) fica na tela.
 */
import { computed, useId } from 'vue'
import { normalizeCnpj } from '@/shared/extensions'
import FormField from './form-field.vue'

const props = defineProps<{
  modelValue?: string | null
  label?: string
  hint?: string
  error?: string | null
  required?: boolean
  disabled?: boolean
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()
const id = useId()

function maskCpf(value: string): string {
  const d = value.slice(0, 11)
  let out = d.slice(0, 3)
  if (d.length > 3) out += `.${d.slice(3, 6)}`
  if (d.length > 6) out += `.${d.slice(6, 9)}`
  if (d.length > 9) out += `-${d.slice(9, 11)}`
  return out
}
function maskCnpj(value: string): string {
  const c = value.slice(0, 14)
  let out = c.slice(0, 2)
  if (c.length > 2) out += `.${c.slice(2, 5)}`
  if (c.length > 5) out += `.${c.slice(5, 8)}`
  if (c.length > 8) out += `/${c.slice(8, 12)}`
  if (c.length > 12) out += `-${c.slice(12, 14)}`
  return out
}

/** Valor exibido (mascarado) — CPF até 11, CNPJ acima de 11 (regra do produto). */
const display = computed(() => {
  const clean = normalizeCnpj(props.modelValue ?? '')
  return clean.length <= 11 ? maskCpf(clean) : maskCnpj(clean)
})

function onInput(event: Event): void {
  const raw = (event.target as HTMLInputElement).value
  emit('update:modelValue', normalizeCnpj(raw).slice(0, 14))
}

const inputClass =
  'h-10 w-full rounded-field border bg-surface-1 px-3.5 text-sm text-content outline-none transition-[color,border-color,box-shadow] duration-[var(--duration-fast)] hover:border-line focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-40'
</script>

<template>
  <FormField :label="label" :hint="hint" :error="error" :required="required" :html-for="id">
    <input
      :id="id"
      :value="display"
      :placeholder="placeholder ?? '000.000.000-00 ou CNPJ'"
      :disabled="disabled"
      inputmode="text"
      autocapitalize="characters"
      class="border-line-subtle"
      :class="[inputClass, error ? '!border-danger' : '']"
      @input="onInput"
    />
  </FormField>
</template>
