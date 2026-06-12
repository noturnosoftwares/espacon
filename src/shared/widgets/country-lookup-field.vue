<script setup lang="ts">
/**
 * CountryLookupField — campo de **referência a País** (fonte: módulo `locations`).
 * Segue o padrão de pesquisa do produto: campo **somente-leitura** (`LookupField`)
 * que, ao acionar, abre a **listagem de Países em modo seleção** (canal
 * `shared/selection`, ADR-003) e recebe o registro de volta. **Não se digita.**
 *
 * Encapsula a metade "abrir" (registra a requisição + navega); a tela solicitante
 * trata o **retorno** (consome a seleção no `onMounted`, por `resource = 'paises'`
 * e, quando houver mais de um lookup do mesmo recurso, pelo `target`).
 */
import { useRoute, useRouter } from 'vue-router'
import { useSelectionStore } from '@/shared/selection'
import LookupField from './lookup-field.vue'

const props = withDefaults(
  defineProps<{
    /** Id do país selecionado (FK) ou `null`. */
    modelValue: number | null
    /** Nome do país selecionado (denormalizado) — rótulo exibido. */
    name?: string
    label?: string
    placeholder?: string
    hint?: string
    error?: string | null
    required?: boolean
    disabled?: boolean
    /** Discriminador quando há mais de um lookup do mesmo recurso na tela. */
    target?: string
    /** Id do campo — para devolver o foco ao voltar da busca. */
    focusId?: string
  }>(),
  { name: '', placeholder: 'Pesquisar país…' },
)

const emit = defineEmits<{ clear: [] }>()

const route = useRoute()
const router = useRouter()
const selection = useSelectionStore()

function onOpen(): void {
  const reqId = selection.open({
    resource: 'paises',
    returnTo: route.path,
    focusId: props.focusId,
    filter: props.target ? { target: props.target } : undefined,
  })
  void router.push({ name: 'locations-countries', query: { mode: 'select', req: reqId } })
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
