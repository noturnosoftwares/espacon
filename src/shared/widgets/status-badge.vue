<script setup lang="ts">
/**
 * StatusBadge — situação do registro (§8.3). SEMPRE cor + ícone + rótulo (nunca
 * só cor). Fundo no tint @14% do feedback; texto/ícone na cor cheia. Mapeamento
 * de status em §2.3 (Ativo→success, Inativo→neutral, Bloqueado/Cancelado→danger,
 * Pendente→warning).
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    severity?: 'success' | 'danger' | 'warning' | 'info' | 'neutral'
    label: string
    icon?: string
  }>(),
  { severity: 'neutral' },
)

const tone = computed(() => {
  switch (props.severity) {
    case 'success':
      return { bg: 'bg-success-soft', fg: 'text-success', icon: props.icon ?? 'pi-check-circle' }
    case 'danger':
      return { bg: 'bg-danger-soft', fg: 'text-danger', icon: props.icon ?? 'pi-ban' }
    case 'warning':
      return { bg: 'bg-warning-soft', fg: 'text-warning', icon: props.icon ?? 'pi-clock' }
    case 'info':
      return { bg: 'bg-info-soft', fg: 'text-info', icon: props.icon ?? 'pi-info-circle' }
    case 'neutral':
    default:
      return {
        bg: 'bg-surface-2',
        fg: 'text-content-muted',
        icon: props.icon ?? 'pi-minus-circle',
      }
  }
})
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium"
    :class="[tone.bg, tone.fg]"
  >
    <i :class="['pi', tone.icon, 'text-[0.7rem]']" aria-hidden="true"></i>
    {{ label }}
  </span>
</template>
