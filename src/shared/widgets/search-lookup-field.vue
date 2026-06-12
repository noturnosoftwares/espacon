<script setup lang="ts" generic="T">
/**
 * SearchLookupField — campo de **referência type-to-search** (Design System §9.2)
 * para dados de **backend** que ainda **não têm tela de listagem** própria (ex.:
 * Cidade, Representante). Diferente do `LookupField` (que abre uma listagem em modo
 * seleção — template ADR-003), aqui o usuário **digita** e escolhe numa lista de
 * sugestões resolvida por uma função de busca assíncrona.
 *
 * Quando o cadastro daquele dado existir como tela, prefira o `LookupField` +
 * canal de seleção. Este widget é a ponte enquanto o cadastro não existe.
 *
 * Devolve o **registro escolhido** (objeto `T`) via `update:modelValue`/`select`;
 * `null` ao limpar. `forceSelection` impede gravar texto que não casa com a lista.
 */
import { ref, watch, useId } from 'vue'
import AutoComplete from 'primevue/autocomplete'
import FormField from './form-field.vue'

const props = withDefaults(
  defineProps<{
    /** Registro selecionado (objeto) ou `null`. */
    modelValue: T | null
    /** Busca assíncrona: recebe o termo e devolve os candidatos. */
    searchFn: (query: string) => Promise<T[]>
    /** Campo do objeto exibido como rótulo (ex.: `'name'`). */
    optionLabel: string
    label?: string
    hint?: string
    error?: string | null
    placeholder?: string
    required?: boolean
    disabled?: boolean
    /** Mínimo de caracteres para disparar a busca (spec: cidade ≥ 2). */
    minLength?: number
  }>(),
  { minLength: 2 },
)

const emit = defineEmits<{
  'update:modelValue': [value: T | null]
  select: [value: T]
  clear: []
}>()

const id = useId()
const suggestions = ref<T[]>([])
// Espelho local do valor: durante a digitação o AutoComplete troca para string e
// PRECISA refletir isso (componente controlado), senão o texto não aparece. Só
// promovemos ao pai um **objeto** em `select` (ou `null` em `clear`), mantendo o
// valor do pai sempre íntegro.
const selection = ref<T | string | null>(props.modelValue)
watch(
  () => props.modelValue,
  (value) => {
    selection.value = value
  },
)

/** Reflete a digitação/seleção interna (mantém o input responsivo). */
function onInternalUpdate(value: T | string | null): void {
  selection.value = value
}

async function onComplete(event: { query: string }): Promise<void> {
  suggestions.value = await props.searchFn(event.query)
}

function onItemSelect(event: { value: T }): void {
  selection.value = event.value
  emit('update:modelValue', event.value)
  emit('select', event.value)
}

function onClear(): void {
  selection.value = null
  emit('update:modelValue', null)
  emit('clear')
}

// Mesma caixa de 40px dos demais campos (par do BaseTextField/BaseSelect).
const inputClass = [
  'h-10 w-full rounded-field border bg-surface-1 px-3.5 text-sm text-content placeholder:text-content-muted outline-none transition-[color,border-color,box-shadow] duration-[var(--duration-fast)] hover:border-line focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-40',
]
</script>

<template>
  <FormField :label="label" :hint="hint" :error="error" :required="required" :html-for="id">
    <AutoComplete
      :input-id="id"
      :model-value="selection"
      :suggestions="suggestions"
      :option-label="optionLabel"
      :placeholder="placeholder"
      :disabled="disabled"
      :min-length="minLength"
      :delay="250"
      force-selection
      show-clear
      fluid
      complete-on-focus
      @complete="onComplete"
      @update:model-value="onInternalUpdate"
      @item-select="onItemSelect"
      @clear="onClear"
      :pt="{
        root: { class: 'w-full' },
        pcInputText: {
          root: { class: [inputClass, error ? 'border-danger' : 'border-line-subtle'] },
        },
        overlay: {
          class:
            'mt-1 overflow-hidden rounded-field border border-line bg-surface-2 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]',
        },
        list: { class: 'flex flex-col gap-0.5 p-1' },
        option: ({ context }) => ({
          class: [
            'cursor-pointer rounded-field px-3.5 py-2 text-sm transition-colors',
            context.focused
              ? 'bg-surface-3 text-content'
              : 'text-content-soft hover:bg-surface-3 hover:text-content',
          ],
        }),
        emptyMessage: { class: 'px-3.5 py-2 text-sm text-content-muted' },
      }"
    />
  </FormField>
</template>
