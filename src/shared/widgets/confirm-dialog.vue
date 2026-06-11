<script setup lang="ts">
/**
 * ConfirmDialog — diálogo de confirmação do Design System (§8.7). A **cor
 * representa a finalidade**: exclusão→danger, confirmação→accent, sucesso→
 * success, info→info. Painel `elev-3`, header colorido por finalidade, rodapé
 * com Cancelar (neutral) + confirmação na cor. Usado antes de toda ação
 * destrutiva/irreversível (§9.2).
 */
import { computed } from 'vue'
import Dialog from 'primevue/dialog'
import BaseButton from './base-button.vue'

const props = withDefaults(
  defineProps<{
    visible: boolean
    purpose?: 'danger' | 'confirm' | 'success' | 'info'
    title: string
    message?: string
    confirmLabel?: string
    confirmIcon?: string
    cancelLabel?: string
    loading?: boolean
  }>(),
  { purpose: 'confirm', confirmLabel: 'Confirmar', cancelLabel: 'Cancelar' },
)

const emit = defineEmits<{
  confirm: []
  cancel: []
  'update:visible': [value: boolean]
}>()

const tone = computed(() => {
  switch (props.purpose) {
    case 'danger':
      return { fg: 'text-danger', bg: 'bg-danger-soft', icon: 'pi-exclamation-triangle' }
    case 'success':
      return { fg: 'text-success', bg: 'bg-success-soft', icon: 'pi-check-circle' }
    case 'info':
      return { fg: 'text-info', bg: 'bg-info-soft', icon: 'pi-info-circle' }
    case 'confirm':
    default:
      return { fg: 'text-accent', bg: 'bg-accent-soft', icon: 'pi-question-circle' }
  }
})

const confirmVariant = computed(() => (props.purpose === 'danger' ? 'danger' : 'primary'))

function close(): void {
  emit('update:visible', false)
  emit('cancel')
}
</script>

<template>
  <Dialog
    :visible="visible"
    modal
    :showHeader="false"
    :style="{ width: '24rem', maxWidth: 'calc(100vw - 2rem)' }"
    :pt="{
      root: { class: 'rounded-panel overflow-hidden border border-line' },
      content: { class: 'p-0' },
    }"
    @update:visible="(v: boolean) => { if (!v) close() }"
  >
    <div class="flex flex-col gap-4 p-5">
      <!-- Ícone menor, alinhado ao título (não ao bloco todo). -->
      <div class="flex items-center gap-2.5">
        <span
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
          :class="[tone.bg, tone.fg]"
        >
          <i :class="['pi', tone.icon, 'text-sm']" aria-hidden="true"></i>
        </span>
        <h2 class="text-base font-semibold text-content">{{ title }}</h2>
      </div>

      <p v-if="message" class="text-sm leading-relaxed text-content-muted">{{ message }}</p>
      <slot />

      <!-- Botões: mesma altura/largura, alinhados à direita. -->
      <div class="mt-1 flex justify-end gap-2">
        <BaseButton
          variant="neutral"
          class="min-w-[6.5rem] justify-center"
          :label="cancelLabel"
          @click="close"
        />
        <BaseButton
          :variant="confirmVariant"
          class="min-w-[6.5rem] justify-center"
          :label="confirmLabel"
          :icon="confirmIcon"
          :loading="loading"
          @click="emit('confirm')"
        />
      </div>
    </div>
  </Dialog>
</template>
