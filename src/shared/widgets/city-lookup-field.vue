<script setup lang="ts">
/**
 * CityLookupField — campo de **referência a Cidade** (fonte: módulo `locations`).
 * Mesmo padrão do [[CountryLookupField]]: somente-leitura, abre a listagem de
 * Cidades em **modo seleção** e recebe o registro de volta. Selecionar a cidade
 * preenche UF/País no cadastro consumidor (denormalizado).
 *
 * `stateId` (opcional) restringe a busca a um estado.
 */
import { useRoute, useRouter } from 'vue-router'
import { useSelectionStore } from '@/shared/selection'
import type { SelectionFilter } from '@/shared/selection'
import LookupField from './lookup-field.vue'

const props = withDefaults(
  defineProps<{
    /** Id da cidade selecionada (FK) ou `null`. */
    modelValue: number | null
    /** Rótulo exibido da cidade (ex.: "São Paulo — SP"). */
    name?: string
    /** Restringe a busca a um estado. */
    stateId?: number | null
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
  { name: '', placeholder: 'Pesquisar cidade…' },
)

const emit = defineEmits<{ clear: [] }>()

const route = useRoute()
const router = useRouter()
const selection = useSelectionStore()

function onOpen(): void {
  const filter: SelectionFilter = {}
  if (props.target) filter.target = props.target
  if (props.stateId != null) filter.stateId = props.stateId
  const reqId = selection.open({
    resource: 'cidades',
    returnTo: route.path,
    focusId: props.focusId,
    filter: Object.keys(filter).length ? filter : undefined,
  })
  void router.push({ name: 'locations-cities', query: { mode: 'select', req: reqId } })
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
