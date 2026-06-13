<script setup lang="ts">
/**
 * AddressSection — seção de **endereço de pessoa** compartilhada (ADR-010). Todo
 * cadastro de pessoa (Fornecedor, e futuros Cliente/Transportadora) monta o
 * endereço a partir DAQUI — não remonta os campos por tela.
 *
 * Controlado: recebe `PersonAddress` em `modelValue`, emite `update:modelValue`
 * imutável a cada mudança. A **Cidade** usa `CityLookupField` (módulo `locations`,
 * modo seleção / ADR-003): a tela **consumidora** trata o retorno da seleção
 * (aplica a cidade — `target`/`focusId` identificam o campo); aqui só renderiza e
 * trata o **limpar**. UF e País são **somente leitura** (derivados da cidade).
 */
import { computed } from 'vue'
import { type PersonAddress, copyPersonAddress } from '@/shared/domain'
import { onlyDigits } from '@/shared/extensions'
import BaseTextField from './base-text-field.vue'
import MaskedField from './masked-field.vue'
import CityLookupField from './city-lookup-field.vue'
import { useAppToast } from './use-app-toast'

const props = withDefaults(
  defineProps<{
    modelValue: PersonAddress
    errors?: {
      street?: string | null
      number?: string | null
      district?: string | null
      city?: string | null
      zipCode?: string | null
    }
    submitted?: boolean
    /** Discriminador da seleção de cidade (quando há mais de um lookup na tela). */
    cityTarget?: string
    /** Id do campo de cidade — devolve o foco ao voltar da busca. */
    cityFocusId?: string
    required?: boolean
    disabled?: boolean
  }>(),
  { cityTarget: 'address', cityFocusId: 'address-city', required: true },
)

const emit = defineEmits<{ 'update:modelValue': [value: PersonAddress] }>()
const toast = useAppToast()

function patch(changes: Partial<PersonAddress>): void {
  emit('update:modelValue', copyPersonAddress(props.modelValue, changes))
}
function err(key: 'street' | 'number' | 'district' | 'city' | 'zipCode'): string | null {
  return props.submitted ? (props.errors?.[key] ?? null) : null
}

const street = computed({
  get: () => props.modelValue.street,
  set: (v: string) => patch({ street: v }),
})
const number = computed({
  get: () => props.modelValue.number,
  set: (v: string) => patch({ number: v }),
})
const complement = computed({
  get: () => props.modelValue.complement,
  set: (v: string) => patch({ complement: v }),
})
const district = computed({
  get: () => props.modelValue.district,
  set: (v: string) => patch({ district: v }),
})
const zipCode = computed({
  get: () => props.modelValue.zipCode,
  set: (v: string) => patch({ zipCode: onlyDigits(v) }),
})

function onCityClear(): void {
  patch({ cityId: null, cityName: '', uf: '', countryId: null, countryName: '' })
}
function onAddressSearch(): void {
  toast.add({
    severity: 'info',
    summary: 'Em breve',
    detail: 'A busca de endereço por mapa (NoturnoMAPS) será habilitada em breve.',
    life: 4000,
  })
}
function onCepSearch(): void {
  toast.add({
    severity: 'info',
    summary: 'Em breve',
    detail: 'A consulta de endereço por CEP será habilitada quando a API existir.',
    life: 4000,
  })
}
</script>

<template>
  <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
    <MaskedField
      v-model="street"
      label="Endereço"
      hint="Campo de busca preparado para mapas (NoturnoMAPS)."
      searchable
      search-title="Buscar endereço no mapa (em breve)"
      :required="required"
      :disabled="disabled"
      :error="err('street')"
      @search="onAddressSearch"
    />
    <BaseTextField v-model="number" label="Número" :required="required" :disabled="disabled" :error="err('number')" />
    <BaseTextField v-model="complement" label="Complemento" :disabled="disabled" />
    <BaseTextField v-model="district" label="Bairro" :required="required" :disabled="disabled" :error="err('district')" />
    <CityLookupField
      :model-value="modelValue.cityId"
      :name="modelValue.cityName"
      label="Cidade"
      :target="cityTarget"
      :focus-id="cityFocusId"
      hint="Selecionar a cidade preenche UF e País."
      :required="required"
      :disabled="disabled"
      :error="err('city')"
      @clear="onCityClear"
    />
    <BaseTextField :model-value="modelValue.uf" label="UF" hint="Preenchida pela cidade." disabled />
    <BaseTextField :model-value="modelValue.countryName" label="País" hint="Preenchido pela cidade." disabled />
    <MaskedField
      v-model="zipCode"
      label="CEP"
      mask="99999-999"
      inputmode="numeric"
      searchable
      search-title="Consultar endereço por CEP (em breve)"
      :required="required"
      :disabled="disabled"
      :error="err('zipCode')"
      @search="onCepSearch"
    />
  </div>
</template>
