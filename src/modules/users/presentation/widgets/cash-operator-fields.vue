<script setup lang="ts">
/**
 * CashOperatorFields — bloco "Caixa" do formulário de usuário.
 *
 * Regra (spec): operador → tipo (ilimitado | limitado); quando **limitado**,
 * exige `código`. Não é portão do checker — é dado consumido pelos módulos
 * financeiros. Emite o `CashOperator` imutável via `update:modelValue`.
 */
import { computed } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'
import { BaseSelect, BaseTextField, FormSection } from '@/shared/widgets'
import {
  type CashOperator,
  CashOperatorType,
  copyCashOperator,
  notOperator,
} from '../../domain/models'

const props = defineProps<{ modelValue: CashOperator }>()
const emit = defineEmits<{ 'update:modelValue': [value: CashOperator] }>()

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
      value ? copyCashOperator(props.modelValue, { isOperator: true, type: CashOperatorType.Unlimited }) : notOperator(),
    )
  },
})

const type = computed({
  get: () => props.modelValue.type,
  set: (value: CashOperatorType | null) => {
    const operatorCode = value === CashOperatorType.Limited ? props.modelValue.operatorCode : null
    emit('update:modelValue', copyCashOperator(props.modelValue, { type: value, operatorCode }))
  },
})

const operatorCode = computed({
  get: () => props.modelValue.operatorCode ?? '',
  set: (value: string) =>
    emit('update:modelValue', copyCashOperator(props.modelValue, { operatorCode: value || null })),
})

const isLimited = computed(() => props.modelValue.type === CashOperatorType.Limited)
const codeMissing = computed(() => isLimited.value && !props.modelValue.operatorCode)
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

      <BaseTextField
        v-if="isLimited"
        v-model="operatorCode"
        label="Código do operador"
        placeholder="Ex.: 07"
        :error="codeMissing ? 'Obrigatório para operador limitado.' : null"
      />
    </div>
  </FormSection>
</template>
