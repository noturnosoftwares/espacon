<script setup lang="ts">
/**
 * FormSection — agrupa campos por contexto (§9.2) num card com título e
 * descrição opcional. Substitui o `<fieldset>` "na mão" dos formulários, dando
 * a mesma superfície/borda/raio dos demais cards (§8.4).
 */
defineProps<{
  title: string
  description?: string
  icon?: string
}>()
</script>

<template>
  <section class="rounded-card border border-line-subtle bg-surface-1">
    <header class="border-b border-line-subtle px-5 py-4">
      <h2 class="flex items-center gap-2 text-base font-semibold text-content">
        <i v-if="icon" :class="['pi', icon, 'text-accent']" aria-hidden="true"></i>
        {{ title }}
      </h2>
      <p v-if="description" class="mt-1 text-sm text-content-muted">{{ description }}</p>
    </header>
    <div class="p-5">
      <slot />
    </div>
  </section>
</template>
