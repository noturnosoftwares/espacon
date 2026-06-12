<script setup lang="ts">
/**
 * FormSkeleton — placeholder de carregamento de **formulário/detalhe** (Design
 * System §10.11). Evita o "flash de conteúdo anterior": como as stores de CRUD
 * são singletons, o `editing` ainda guarda o último registro ao abrir um detalhe;
 * em vez de renderizar esse estado velho enquanto o novo carrega, a tela mostra
 * este esqueleto (mesma anatomia de seções/campos), igual ao skeleton da tabela.
 *
 * `sections` × `fields` desenham blocos pulsantes equivalentes a seção (título) +
 * grade de campos (label + caixa de 40px). Puramente decorativo (`aria-hidden`).
 */
withDefaults(defineProps<{ sections?: number; fields?: number }>(), {
  sections: 1,
  fields: 2,
})
</script>

<template>
  <div class="flex flex-col gap-6" aria-hidden="true">
    <div v-for="s in sections" :key="s" class="flex flex-col gap-4">
      <!-- Título da seção -->
      <div class="h-5 w-44 animate-pulse rounded bg-surface-2"></div>
      <!-- Grade de campos (label + controle) -->
      <div class="grid gap-x-5 gap-y-4 sm:grid-cols-2">
        <div v-for="f in fields" :key="f" class="flex flex-col gap-2">
          <div class="h-3 w-24 animate-pulse rounded bg-surface-2"></div>
          <div class="h-10 w-full animate-pulse rounded-field bg-surface-2"></div>
        </div>
      </div>
    </div>
  </div>
</template>
