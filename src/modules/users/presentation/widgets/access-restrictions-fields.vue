<script setup lang="ts">
/**
 * AccessRestrictionsFields — blocos opcionais "Horário" e "IP" do usuário.
 *
 * Frontend modela e reflete; em produção o backend é a autoridade (spec). Cada
 * restrição é ativada por um switch; quando ausente (`null`), não há restrição.
 * Emite via `update:time` e `update:ip` (imutável).
 */
import { computed } from 'vue'
import ToggleSwitch from 'primevue/toggleswitch'
import Textarea from 'primevue/textarea'
import { BaseTextField, FormField, FormSection } from '@/shared/widgets'
import type { AccessTimeRestriction, IpRestriction } from '../../domain/models'

const props = defineProps<{
  time: AccessTimeRestriction
  ip: IpRestriction
}>()

const emit = defineEmits<{
  'update:time': [value: AccessTimeRestriction]
  'update:ip': [value: IpRestriction]
}>()

// Horário
const timeEnabled = computed({
  get: () => props.time !== null,
  set: (value: boolean) => emit('update:time', value ? { start: '08:00', end: '18:00' } : null),
})
const start = computed({
  get: () => props.time?.start ?? '08:00',
  set: (value: string) => emit('update:time', { start: value, end: props.time?.end ?? '18:00' }),
})
const end = computed({
  get: () => props.time?.end ?? '18:00',
  set: (value: string) => emit('update:time', { start: props.time?.start ?? '08:00', end: value }),
})

// IP
const ipEnabled = computed({
  get: () => props.ip !== null,
  set: (value: boolean) => emit('update:ip', value ? { allowedPublicIps: [] } : null),
})
const ipsText = computed({
  get: () => (props.ip?.allowedPublicIps ?? []).join('\n'),
  set: (value: string) => {
    const allowedPublicIps = value
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
    emit('update:ip', { allowedPublicIps })
  },
})
</script>

<template>
  <div class="grid gap-6 lg:grid-cols-2">
    <!-- Horário -->
    <FormSection title="Restrição de horário" icon="pi-clock">
      <label
        class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3"
      >
        <ToggleSwitch v-model="timeEnabled" inputId="time-enabled" />
        <span class="text-sm text-content-soft">Limitar janela de acesso</span>
      </label>
      <div v-if="timeEnabled" class="mt-4 grid grid-cols-2 gap-x-5">
        <BaseTextField v-model="start" label="Início" type="time" />
        <BaseTextField v-model="end" label="Fim" type="time" />
      </div>
    </FormSection>

    <!-- IP -->
    <FormSection title="Restrição de IP" icon="pi-server">
      <label
        class="flex items-center gap-3 rounded-field border border-line-subtle bg-surface-2/40 px-4 py-3"
      >
        <ToggleSwitch v-model="ipEnabled" inputId="ip-enabled" />
        <span class="text-sm text-content-soft">Limitar por IP público</span>
      </label>
      <div v-if="ipEnabled" class="mt-4">
        <FormField label="IPs liberados (um por linha)" html-for="ip-list">
          <Textarea id="ip-list" v-model="ipsText" rows="3" placeholder="200.150.0.10" fluid />
        </FormField>
      </div>
    </FormSection>
  </div>
</template>
