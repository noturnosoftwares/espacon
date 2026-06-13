<script setup lang="ts">
/**
 * BankAccountSection — seção de **conta bancária de pessoa** compartilhada
 * (ADR-010). Controlado: recebe `BankAccount` em `modelValue`, emite
 * `update:modelValue` imutável. `showHolder` exibe **Favorecido** + **CNPJ/CPF do
 * favorecido** (Fornecedor usa; Funcionário não). Todo cadastro de pessoa monta o
 * bloco bancário DAQUI.
 */
import { computed } from 'vue'
import {
  type BankAccount,
  BankAccountType,
  bankAccountTypeLabel,
  copyBankAccount,
} from '@/shared/domain'
import BaseSelect from './base-select.vue'
import BaseTextField from './base-text-field.vue'

const props = withDefaults(
  defineProps<{
    modelValue: BankAccount
    errors?: {
      type?: string | null
      bank?: string | null
      branch?: string | null
      number?: string | null
      holderDocument?: string | null
    }
    submitted?: boolean
    showHolder?: boolean
    required?: boolean
    disabled?: boolean
  }>(),
  { showHolder: true, required: false },
)

const emit = defineEmits<{ 'update:modelValue': [value: BankAccount] }>()

const TYPE_OPTIONS = [
  { label: bankAccountTypeLabel(BankAccountType.Checking), value: BankAccountType.Checking },
  { label: bankAccountTypeLabel(BankAccountType.Savings), value: BankAccountType.Savings },
]

function patch(changes: Partial<BankAccount>): void {
  emit('update:modelValue', copyBankAccount(props.modelValue, changes))
}
function err(key: 'type' | 'bank' | 'branch' | 'number' | 'holderDocument'): string | null {
  return props.submitted ? (props.errors?.[key] ?? null) : null
}

const type = computed({
  get: () => props.modelValue.type,
  set: (v: BankAccountType | null) => patch({ type: v }),
})
const bank = computed({ get: () => props.modelValue.bank, set: (v: string) => patch({ bank: v }) })
const branch = computed({
  get: () => props.modelValue.branch,
  set: (v: string) => patch({ branch: v }),
})
const accountNumber = computed({
  get: () => props.modelValue.number,
  set: (v: string) => patch({ number: v }),
})
const holderName = computed({
  get: () => props.modelValue.holderName,
  set: (v: string) => patch({ holderName: v }),
})
const holderDocument = computed({
  get: () => props.modelValue.holderDocument,
  set: (v: string) => patch({ holderDocument: v }),
})
</script>

<template>
  <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
    <BaseSelect
      v-model="type"
      label="Tipo de conta"
      placeholder="Selecione"
      :options="TYPE_OPTIONS"
      option-label="label"
      option-value="value"
      :disabled="disabled"
      :error="err('type')"
    />
    <BaseTextField v-model="bank" label="Banco" :required="required" :disabled="disabled" :error="err('bank')" />
    <BaseTextField v-model="branch" label="Agência" :required="required" :disabled="disabled" :error="err('branch')" />
    <BaseTextField v-model="accountNumber" label="Conta" :required="required" :disabled="disabled" :error="err('number')" />
    <template v-if="showHolder">
      <BaseTextField v-model="holderName" label="Favorecido" :disabled="disabled" />
      <BaseTextField
        v-model="holderDocument"
        label="CNPJ/CPF do favorecido"
        inputmode="numeric"
        :disabled="disabled"
        :error="err('holderDocument')"
      />
    </template>
  </div>
</template>
