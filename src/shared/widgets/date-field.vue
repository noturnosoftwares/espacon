<script setup lang="ts">
/**
 * DateField — campo de **data** (Design System §8.1): **digitação com máscara**
 * `dd/mm/aaaa` **+ calendário** que acompanha o que é digitado.
 *
 * Composição (o `DatePicker` cru não mascara o input nem segue a digitação): um
 * `InputMask` faz a entrada mascarada e, ao completar uma data válida, **move a
 * seleção do calendário**; o calendário (PrimeVue `DatePicker` inline num
 * `Popover`, aberto pelo ícone) devolve a data ao input. Resolve a dor do
 * `<input type="date">` nativo.
 *
 * O `modelValue` trafega em **ISO `yyyy-mm-dd`** (contrato dos models); a conversão
 * de/para `Date`/dígitos fica encapsulada aqui.
 */
import { ref, watch, useId } from 'vue'
import InputMask from 'primevue/inputmask'
import DatePicker from 'primevue/datepicker'
import Popover from 'primevue/popover'
import FormField from './form-field.vue'

const props = defineProps<{
  modelValue?: string | null
  label?: string
  hint?: string
  error?: string | null
  required?: boolean
  disabled?: boolean
}>()

const emit = defineEmits<{ 'update:modelValue': [value: string | null] }>()
const id = useId()
const popover = ref<InstanceType<typeof Popover> | null>(null)

// ── Conversões ISO ⇄ Date ⇄ dígitos (ddmmyyyy) ──────────────────────────────
function fromIso(iso: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((iso ?? '').trim())
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(date.getTime()) ? null : date
}
function toIso(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
function digitsFromDate(date: Date | null): string {
  if (!date) return ''
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${d}${m}${date.getFullYear()}`
}
/** Dígitos `ddmmyyyy` → Date **válida** (rejeita 31/02, mês 13, etc.) ou `null`. */
function dateFromDigits(digits: string): Date | null {
  if (digits.length !== 8) return null
  const day = Number(digits.slice(0, 2))
  const month = Number(digits.slice(2, 4))
  const year = Number(digits.slice(4, 8))
  const date = new Date(year, month - 1, day)
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) {
    return null
  }
  return date
}

// Espelho local dos dígitos digitados (o `InputMask` com `unmask` trafega só
// dígitos). Reflete mudanças externas do modelValue (reset/edição de outro registro).
const digits = ref(digitsFromDate(fromIso(props.modelValue)))
const calendarDate = ref<Date | null>(fromIso(props.modelValue))
watch(
  () => props.modelValue,
  (iso) => {
    const date = fromIso(iso)
    const next = digitsFromDate(date)
    // Só sobrescreve o que o usuário digita quando a fonte externa realmente muda.
    if (next !== digits.value && date !== null) digits.value = next
    if (!iso) digits.value = ''
    calendarDate.value = date
  },
)

/** Digitação: emite ISO ao completar data válida; limpa ao esvaziar. */
function onType(value: string | null | undefined): void {
  const next = (value ?? '').replace(/\D/g, '')
  digits.value = next
  if (next.length === 0) {
    emit('update:modelValue', null)
    return
  }
  const date = dateFromDigits(next)
  if (date) {
    calendarDate.value = date // move a seleção do calendário conforme o digitado
    emit('update:modelValue', toIso(date))
  }
}

/** Seleção no calendário: preenche o input e devolve a data. */
function onPick(value: Date | Date[] | (Date | null)[] | null | undefined): void {
  if (value instanceof Date) {
    digits.value = digitsFromDate(value)
    calendarDate.value = value
    emit('update:modelValue', toIso(value))
  }
  popover.value?.hide()
}

function toggleCalendar(event: Event): void {
  if (!props.disabled) popover.value?.toggle(event)
}

const innerClass =
  'min-w-0 flex-1 bg-transparent px-3.5 text-sm text-content outline-none placeholder:text-content-muted disabled:opacity-40'
</script>

<template>
  <FormField :label="label" :hint="hint" :error="error" :required="required" :html-for="id">
    <div
      class="flex h-10 w-full items-center rounded-field border bg-surface-1 pr-1 transition-[color,border-color,box-shadow] duration-[var(--duration-fast)]"
      :class="[
        error ? 'border-danger' : 'border-line-subtle',
        disabled
          ? 'opacity-40'
          : 'hover:border-line focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20',
      ]"
    >
      <InputMask
        :input-id="id"
        :model-value="digits"
        mask="99/99/9999"
        unmask
        placeholder="dd/mm/aaaa"
        :disabled="disabled"
        :pt="{ root: { class: innerClass, inputmode: 'numeric' } }"
        @update:model-value="onType"
      />
      <button
        type="button"
        title="Abrir calendário"
        aria-label="Abrir calendário"
        :disabled="disabled"
        class="ds-focus-ring flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-content-muted transition-colors hover:text-content"
        @click="toggleCalendar"
      >
        <i class="pi pi-calendar text-sm" aria-hidden="true"></i>
      </button>
    </div>

    <Popover ref="popover">
      <DatePicker :model-value="calendarDate" inline @update:model-value="onPick" />
    </Popover>
  </FormField>
</template>
