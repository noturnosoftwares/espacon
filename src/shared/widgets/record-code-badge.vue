<script setup lang="ts">
/**
 * RecordCodeBadge — indicador do **código do registro** (id), reutilizável por
 * todos os cadastros do ERP (ver spec `employee-registration` §4.4).
 *
 * - registro **novo** (`code` nulo/0) → pílula neutra **"Novo"**;
 * - registro **existente** → destaque com o código zero-padded (`Cód. 00042`),
 *   na identidade dourada (accent), comunicando que já está persistido.
 */
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    /** Código/id do registro; nulo ou ≤ 0 = registro novo. */
    code?: number | null
    /** Casas para zero-pad do código (ex.: 5 → `00042`). */
    pad?: number
    /** Rótulo do prefixo (ex.: `Cód.`). */
    prefix?: string
  }>(),
  { pad: 5, prefix: 'Cód.' },
)

const isNew = computed(() => props.code == null || props.code <= 0)
const display = computed(() =>
  isNew.value ? '' : `${props.prefix} ${String(props.code).padStart(props.pad, '0')}`,
)
</script>

<template>
  <span
    class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
    :class="isNew ? 'bg-surface-2 text-content-muted' : 'bg-accent-soft text-accent'"
  >
    <i :class="['pi', isNew ? 'pi-sparkles' : 'pi-hashtag', 'text-[0.7rem]']" aria-hidden="true"></i>
    {{ isNew ? 'Novo' : display }}
  </span>
</template>
