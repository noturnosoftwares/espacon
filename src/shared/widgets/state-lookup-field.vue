<script setup lang="ts">
/**
 * StateLookupField — campo de **referência a Estado/UF** (fonte: módulo
 * `locations`). Mesmo padrão do [[CountryLookupField]]: somente-leitura, abre a
 * listagem de Estados em **modo seleção** e recebe o registro de volta.
 *
 * `countryId` (opcional) restringe a busca a um país — passado como critério de
 * aceitação para a listagem (filtro `countryId`).
 */
import { useRoute, useRouter } from 'vue-router'
import { useSelectionStore } from '@/shared/selection'
import type { SelectionFilter } from '@/shared/selection'
import LookupField from './lookup-field.vue'

const props = withDefaults(
  defineProps<{
    /** Id do estado selecionado (FK) ou `null`. */
    modelValue: number | null
    /** Rótulo exibido do estado (ex.: "SP — São Paulo"). */
    name?: string
    /** Restringe a busca a um país. */
    countryId?: number | null
    label?: string
    placeholder?: string
    hint?: string
    error?: string | null
    required?: boolean
    disabled?: boolean
    target?: string
    /** Id do campo — para devolver o foco ao voltar da busca. */
    focusId?: string
  }>(),
  { name: '', placeholder: 'Pesquisar estado/UF…' },
)

const emit = defineEmits<{ clear: [] }>()

const route = useRoute()
const router = useRouter()
const selection = useSelectionStore()

function onOpen(): void {
  const filter: SelectionFilter = {}
  if (props.target) filter.target = props.target
  if (props.countryId != null) filter.countryId = props.countryId
  const reqId = selection.open({
    resource: 'estados',
    returnTo: route.path,
    focusId: props.focusId,
    filter: Object.keys(filter).length ? filter : undefined,
  })
  void router.push({ name: 'locations-states', query: { mode: 'select', req: reqId } })
}
</script>

<template>
  <LookupField
    :model-value="modelValue"
    :input-id="focusId"
    :label="label"
    :placeholder="placeholder"
    :hint="hint"
    :error="error"
    :required="required"
    :disabled="disabled"
    :format-selected="() => name"
    @open="onOpen"
    @clear="emit('clear')"
  />
</template>
