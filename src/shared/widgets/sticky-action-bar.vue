<script setup lang="ts">
/**
 * ActionBar — rodapé de ações de formulários longos (§10.10): Salvar/Cancelar
 * sempre acessíveis. **Não flutua nem sobrepõe** o conteúdo — é um rodapé
 * **sólido** posicionado FORA da área de rolagem (o conteúdo rola acima dele,
 * nunca por baixo). Exibida só quando há alteração (dirty).
 *
 * Slot `start` para resumo/contexto à esquerda; slot default (à direita) para as
 * ações.
 */
</script>

<template>
  <div
    class="flex shrink-0 items-center justify-between gap-3 border-t border-line bg-surface-1 px-6 py-3 lg:px-8"
  >
    <div class="min-w-0 text-sm text-content-muted">
      <slot name="start" />
    </div>
    <div class="flex items-center gap-2">
      <slot />
    </div>
  </div>
</template>
