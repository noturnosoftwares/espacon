<script setup lang="ts">
/**
 * BaseCard — superfície padrão do Design System (§8.4): `elev-1` (surface-1 +
 * border-subtle), `radius-card`, padding §4. Título opcional `text-h2` com ícone.
 * `interactive` aplica o lift sutil no hover (§7) para cards clicáveis/dashboard.
 *
 * Slots: `header-actions` (canto direito do cabeçalho), default (corpo).
 */
withDefaults(
  defineProps<{
    title?: string
    icon?: string
    interactive?: boolean
    flush?: boolean
  }>(),
  { interactive: false, flush: false },
)
</script>

<template>
  <section
    class="rounded-card border border-line-subtle bg-surface-1"
    :class="interactive ? 'ds-card-lift cursor-pointer' : ''"
  >
    <header
      v-if="title || $slots['header-actions']"
      class="flex items-center justify-between gap-3 px-5 pt-5"
    >
      <h2 v-if="title" class="flex items-center gap-2 text-base font-semibold text-content">
        <i v-if="icon" :class="['pi', icon, 'text-accent']" aria-hidden="true"></i>
        {{ title }}
      </h2>
      <div v-if="$slots['header-actions']" class="flex items-center gap-2">
        <slot name="header-actions" />
      </div>
    </header>

    <div :class="flush ? '' : 'p-5'">
      <slot />
    </div>
  </section>
</template>
