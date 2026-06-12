<script setup lang="ts">
/**
 * MaskedField — input com **máscara** (Design System §8.1) para dados formatados
 * (CPF, CEP, celular). Usa o PrimeVue `InputMask` com `unmask`, então o
 * `modelValue` trafega **só com dígitos** (a máscara é só de exibição). Quando não
 * há `mask`, vira um input de texto comum.
 *
 * Opcionalmente **pesquisável** (`searchable`): mostra um ícone de busca à direita
 * e emite `search` — para campos que **vão consultar o backend no futuro** (ex.:
 * CEP → consulta de endereço; Endereço → NoturnoMAPS). Segue a regra do produto:
 * todo campo que pesquisa/vem de backend nasce no formato de busca.
 */
import { useId } from 'vue'
import InputMask from 'primevue/inputmask'
import FormField from './form-field.vue'

withDefaults(
  defineProps<{
    modelValue?: string | null
    /** Máscara do PrimeVue InputMask (ex.: `999.999.999-99`). Ausente = texto livre. */
    mask?: string
    label?: string
    hint?: string
    error?: string | null
    placeholder?: string
    required?: boolean
    disabled?: boolean
    inputmode?: 'text' | 'numeric' | 'tel' | 'email' | 'search'
    /** Mostra o gatilho de busca à direita (consulta futura). */
    searchable?: boolean
    searchTitle?: string
  }>(),
  { searchTitle: 'Pesquisar' },
)

const emit = defineEmits<{ 'update:modelValue': [value: string]; search: [] }>()
const id = useId()

const innerClass =
  'min-w-0 flex-1 bg-transparent px-3.5 text-sm text-content outline-none placeholder:text-content-muted disabled:opacity-40'
</script>

<template>
  <FormField :label="label" :hint="hint" :error="error" :required="required" :html-for="id">
    <div
      class="flex h-10 w-full items-center rounded-field border bg-surface-1 pr-1 transition-[color,border-color,box-shadow] duration-[var(--duration-fast)]"
      :class="[
        error ? 'border-danger' : 'border-line-subtle',
        disabled
          ? 'opacity-40'
          : 'hover:border-line focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
      ]"
    >
      <InputMask
        v-if="mask"
        :input-id="id"
        :model-value="modelValue ?? ''"
        :mask="mask"
        unmask
        :placeholder="placeholder"
        :disabled="disabled"
        :pt="{ root: { class: innerClass, inputmode } }"
        @update:model-value="(v) => emit('update:modelValue', v ?? '')"
      />
      <input
        v-else
        :id="id"
        :value="modelValue ?? ''"
        :placeholder="placeholder"
        :disabled="disabled"
        :inputmode="inputmode"
        :class="innerClass"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="searchable"
        type="button"
        :title="searchTitle"
        :aria-label="searchTitle"
        :disabled="disabled"
        class="ds-focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-content-muted transition-colors hover:text-content"
        @click="emit('search')"
      >
        <i class="pi pi-search text-xs" aria-hidden="true"></i>
      </button>
    </div>
  </FormField>
</template>
