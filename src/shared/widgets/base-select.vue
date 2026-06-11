<script setup lang="ts" generic="T">
/**
 * BaseSelect — campo de **seleção** do Design System (§8.1), par do
 * `BaseTextField` para opções discretas. Embrulha o `Select` do PrimeVue (já
 * on-brand pelo preset Noturno) e **força a mesma anatomia dos demais campos**:
 * altura 40px (`h-10`), largura fluida, borda/raio/foco padronizados. Assim um
 * Select nunca fica menor ou com borda diferente de um `SearchField`/`BaseTextField`
 * na mesma linha.
 *
 * É só o **controle** (sem label próprio): use dentro de `FormField` quando
 * precisar de rótulo/hint/erro, ou solto (ex.: filtro de barra). A largura é
 * controlada pelo container (fluido por padrão). `T` = tipo do valor selecionado.
 */
import Select from 'primevue/select'

withDefaults(
  defineProps<{
    modelValue: T
    options: unknown[]
    optionLabel?: string
    optionValue?: string
    placeholder?: string
    disabled?: boolean
    /** Largura total (padrão). Desligue para dimensionar pelo conteúdo. */
    fluid?: boolean
    /** Rótulo acessível quando usado solto, sem FormField. */
    ariaLabel?: string
  }>(),
  { fluid: true },
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
  change: [value: T]
}>()

function onUpdate(value: unknown): void {
  emit('update:modelValue', value as T)
}
function onChange(event: { value: unknown }): void {
  emit('change', event.value as T)
}
</script>

<template>
  <Select
    :model-value="modelValue"
    :options="options"
    :option-label="optionLabel"
    :option-value="optionValue"
    :placeholder="placeholder"
    :disabled="disabled"
    :fluid="fluid"
    :aria-label="ariaLabel"
    :pt="{ root: { class: 'h-10 items-center' }, label: { class: 'flex items-center' } }"
    @update:model-value="onUpdate"
    @change="onChange"
  />
</template>
