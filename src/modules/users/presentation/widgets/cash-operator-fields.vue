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
import { BaseSelect, FormSection, LookupField, useAppToast } from '@/shared/widgets'
import {
  type CashOperator,
  CashOperatorType,
  copyCashOperator,
  notOperator,
} from '../../domain/models'

const props = defineProps<{ modelValue: CashOperator }>()
const emit = defineEmits<{ 'update:modelValue': [value: CashOperator] }>()

const toast = useAppToast()

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

const isLimited = computed(() => props.modelValue.type === CashOperatorType.Limited)
const codeMissing = computed(() => isLimited.value && !props.modelValue.operatorCode)

/**
 * O operador **limitado** referencia um operador cadastrado — portanto é um
 * **campo de busca** (`LookupField`, DS §9.2), não digitação livre. A tela de
 * cadastro/seleção de operadores **ainda será implementada**; o campo já nasce
 * no formato certo (ADR-003). Até lá, acionar informa que está por vir; valores
 * já gravados nos mocks continuam exibidos pelo `formatSelected`.
 */
function openOperatorSearch(): void {
  toast.add({
    severity: 'info',
    summary: 'Em breve',
    detail: 'O cadastro de operadores de caixa ainda será implementado.',
    life: 4000,
  })
}

function clearOperatorCode(): void {
  emit('update:modelValue', copyCashOperator(props.modelValue, { operatorCode: null }))
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
        hint="Selecione o operador cadastrado."
        :format-selected="(v) => `Operador ${v}`"
        :error="codeMissing ? 'Obrigatório para operador limitado.' : null"
        @open="openOperatorSearch"
        @clear="clearOperatorCode"
      />
    </div>
  </FormSection>
</template>
