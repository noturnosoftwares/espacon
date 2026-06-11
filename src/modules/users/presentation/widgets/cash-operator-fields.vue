<script setup lang="ts">
/**
 * CashOperatorFields — bloco "Caixa" do formulário de usuário.
 *
 * Regra (spec): operador → tipo (ilimitado | limitado); quando **limitado**,
 * exige `operatorCode` que **referencia** um operador cadastrado e ativo. Não é
 * portão do checker — é dado consumido pelos módulos financeiros. Emite o
 * `CashOperatorAssignment` imutável via `update:modelValue`.
 *
 * O operador limitado é um **campo de busca** (`LookupField`, DS §9.2): acionar
 * emite `open-operator-search` para a página abrir a **listagem de operadores em
 * modo seleção** (template ADR-003). O rótulo do operador escolhido chega
 * resolvido em `operatorLabel` (a página o resolve via o módulo de operadores).
 */
import { computed } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'
import { BaseSelect, FormSection, LookupField } from '@/shared/widgets'
import {
  type CashOperatorAssignment,
  CashOperatorType,
  copyCashOperatorAssignment,
  notOperator,
} from '../../domain/models'

const props = defineProps<{
  modelValue: CashOperatorAssignment
  /** Rótulo "código — nome" do operador vinculado, resolvido pela página. */
  operatorLabel?: string | null
}>()
const emit = defineEmits<{
  'update:modelValue': [value: CashOperatorAssignment]
  'open-operator-search': []
  'clear-operator': []
}>()

const TYPE_OPTIONS = [
  { label: 'Ilimitado', value: CashOperatorType.Unlimited },
  { label: 'Limitado', value: CashOperatorType.Limited },
]

const isOperator = computed({
  get: () => props.modelValue.isOperator,
  set: (value: boolean) => {
    // Ligar operador → default ilimitado; desligar → zera tipo e código.
    emit(
      'update:modelValue',
      value
        ? copyCashOperatorAssignment(props.modelValue, { isOperator: true, type: CashOperatorType.Unlimited })
        : notOperator(),
    )
  },
})

const type = computed({
  get: () => props.modelValue.type,
  set: (value: CashOperatorType | null) => {
    const operatorCode = value === CashOperatorType.Limited ? props.modelValue.operatorCode : null
    emit('update:modelValue', copyCashOperatorAssignment(props.modelValue, { type: value, operatorCode }))
  },
})

const isLimited = computed(() => props.modelValue.type === CashOperatorType.Limited)
const codeMissing = computed(() => isLimited.value && !props.modelValue.operatorCode)

/** Rótulo do campo de busca: "código — nome" resolvido, ou fallback pelo código. */
function operatorDisplay(value: string | number): string {
  return props.operatorLabel ?? `Operador ${value}`
}

function clearOperatorCode(): void {
  emit('update:modelValue', copyCashOperatorAssignment(props.modelValue, { operatorCode: null }))
  emit('clear-operator')
}
</script>

<template>
  <FormSection title="Caixa" icon="pi-wallet">
    <label
      class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3"
    >
      <ToggleSwitch v-model="isOperator" inputId="cash-operator" />
      <span class="text-sm text-content-soft">Operador de caixa</span>
    </label>

    <div v-if="isOperator" class="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
      <BaseSelect
        v-model="type"
        label="Tipo de operador"
        :options="TYPE_OPTIONS"
        option-label="label"
        option-value="value"
      />

      <LookupField
        v-if="isLimited"
        :model-value="modelValue.operatorCode"
        label="Operador (limitado)"
        placeholder="Buscar operador de caixa…"
        hint="Selecione um operador ativo do cadastro."
        :format-selected="operatorDisplay"
        :error="codeMissing ? 'Obrigatório para operador limitado.' : null"
        @open="emit('open-operator-search')"
        @clear="clearOperatorCode"
      />
    </div>
  </FormSection>
</template>
