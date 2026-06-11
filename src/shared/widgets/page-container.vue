<script setup lang="ts">
/**
 * PageContainer — **fonte única** do espaçamento horizontal/responsivo das
 * páginas de conteúdo (Design System §4/§9). Toda tela dentro do `AppShell`
 * (pesquisa, cadastro e detalhe) usa este container para o **mesmo** gutter e a
 * **mesma** largura de leitura — eliminando a divergência de margens laterais
 * entre telas de pesquisa e de cadastro/detalhe.
 *
 * Responsabilidades:
 * - área que **rola** (`overflow-y-auto`) com a scrollbar da identidade;
 * - **padding** padronizado (`space-5` no mobile, `space-6` no desktop) — gutter
 *   enxuto em relação à sidebar; nunca redefinido por tela;
 * - conteúdo **centralizado** com largura máxima única.
 *
 * `width` cobre o caso raro de uma tela precisar de leitura mais estreita
 * (`narrow`) ou ocupar tudo (`full`); o padrão (`default`) unifica pesquisa,
 * cadastro e detalhe na mesma largura.
 */
withDefaults(
  defineProps<{
    width?: 'default' | 'narrow' | 'full'
  }>(),
  { width: 'default' },
)

const MAX_WIDTH: Record<'default' | 'narrow' | 'full', string> = {
  default: 'max-w-[1100px]',
  narrow: 'max-w-[768px]',
  full: 'max-w-none',
}
</script>

<template>
  <div class="scrollbar-noturno flex-1 overflow-y-auto p-5 lg:p-6">
    <div class="mx-auto flex w-full flex-col gap-6" :class="MAX_WIDTH[width]">
      <slot />
    </div>
  </div>
</template>
