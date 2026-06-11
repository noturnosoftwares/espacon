<script setup lang="ts">
/**
 * FormField — wrapper de campo do Design System (§8.1): label (em cima) →
 * controle (slot) → hint/erro (embaixo). Padroniza espaçamento (gap label↔campo
 * §4) e o estado de erro. Use ao redor de inputs nativos e de controles
 * PrimeVue (Select, ToggleSwitch, Textarea) — assim a anatomia é única.
 */
defineProps<{
  label?: string
  hint?: string
  error?: string | null
  required?: boolean
  htmlFor?: string
}>()
</script>

<template>
  <div class="flex flex-col gap-2">
    <label v-if="label" :for="htmlFor" class="text-[13px] font-medium text-content-soft">
      {{ label }}
      <span v-if="required" class="text-danger" aria-hidden="true">*</span>
    </label>

    <slot />

    <p v-if="error" class="flex items-center gap-1 text-xs text-danger">
      <i class="pi pi-exclamation-circle text-[0.7rem]" aria-hidden="true"></i>
      {{ error }}
    </p>
    <p v-else-if="hint" class="text-xs text-content-muted">{{ hint }}</p>
  </div>
</template>
