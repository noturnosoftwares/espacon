<script setup lang="ts">
/**
 * BaseToast — toasts do sistema (Design System §8.8): **canto superior direito**
 * (não cobre a barra de busca, que fica à esquerda do header), slide+fade, cor +
 * ícone + título + mensagem. Camada flutuante (`elev-3` + sombra suave), barra de
 * cor por severidade, dispensável e empilhável.
 *
 * Renderizado uma vez no `App.vue`. Disparo via `useToast().add({ severity,
 * summary, detail })` — `summary` é o título, `detail` a mensagem.
 */
import Toast from 'primevue/toast'

// `bar` = cor da BORDA esquerda (border-l) — respeita o raio do card, sem
// vazar nos cantos como um elemento absoluto faria.
type Tone = { icon: string; fg: string; bg: string; bar: string }

const INFO: Tone = { icon: 'pi-info-circle', fg: 'text-info', bg: 'bg-info-soft', bar: 'border-l-info' }

const TONES: Record<string, Tone> = {
  success: { icon: 'pi-check-circle', fg: 'text-success', bg: 'bg-success-soft', bar: 'border-l-success' },
  info: INFO,
  warn: { icon: 'pi-exclamation-triangle', fg: 'text-warning', bg: 'bg-warning-soft', bar: 'border-l-warning' },
  error: { icon: 'pi-times-circle', fg: 'text-danger', bg: 'bg-danger-soft', bar: 'border-l-danger' },
}

function tone(severity?: string): Tone {
  return TONES[severity ?? 'info'] ?? INFO
}
</script>

<template>
  <Toast position="top-right">
    <template #container="{ message, closeCallback }">
      <div
        class="ds-rise-in flex w-[22rem] max-w-[calc(100vw-2rem)] items-start gap-3 overflow-hidden rounded-card border border-line border-l-4 bg-surface-3 p-4 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.7)]"
        :class="tone(message.severity).bar"
        role="alert"
      >
        <span
          class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
          :class="[tone(message.severity).bg, tone(message.severity).fg]"
        >
          <i :class="['pi', tone(message.severity).icon]" aria-hidden="true"></i>
        </span>
        <div class="min-w-0 flex-1 pt-0.5">
          <p v-if="message.summary" class="text-sm font-semibold text-content">
            {{ message.summary }}
          </p>
          <p v-if="message.detail" class="mt-0.5 text-sm leading-snug text-content-muted">
            {{ message.detail }}
          </p>
        </div>
        <button
          type="button"
          aria-label="Fechar"
          class="ds-focus-ring -mr-1 -mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-content-muted transition-colors hover:text-content"
          @click="closeCallback"
        >
          <i class="pi pi-times text-xs" aria-hidden="true"></i>
        </button>
      </div>
    </template>
  </Toast>
</template>
