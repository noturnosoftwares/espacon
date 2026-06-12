<script setup lang="ts">
/**
 * InitialsAvatar — avatar de **iniciais** para identidade de pessoas (Design
 * System §8.11). Usado nas listas de pessoas (funcionários, usuários e, no futuro,
 * clientes/fornecedores) para dar leitura rápida e elegante.
 *
 * - **Iniciais:** primeira letra do **primeiro** e do **último** nome (ignora
 *   conectivos como "da/de/dos"); nome único → duas primeiras letras.
 * - **Cor determinística:** o nome escolhe uma das cores curadas de avatar (tokens
 *   `--color-avatar-*`, todas da paleta oficial). A mesma pessoa tem **sempre** a
 *   mesma cor — sem aleatoriedade.
 *
 * Puramente decorativo (`aria-hidden`): o nome legível fica ao lado.
 */
import { computed } from 'vue'
import { normalizeText } from '@/shared/extensions'

const props = withDefaults(
  defineProps<{
    name: string
    /** Tamanho do círculo. */
    size?: 'sm' | 'md'
  }>(),
  { size: 'md' },
)

// Conectivos de nome que não viram inicial.
const CONNECTORS = new Set(['da', 'de', 'do', 'das', 'dos', 'e', 'di', 'du', 'del', 'la'])

const initials = computed(() => {
  const words = props.name
    .trim()
    .split(/\s+/)
    .filter((word) => word && !CONNECTORS.has(normalizeText(word)))
  const first = words[0]
  if (!first) return '?'
  if (words.length === 1) return first.slice(0, 2).toUpperCase()
  const last = words[words.length - 1] ?? first
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase()
})

// Paleta curada (classes **literais** para o Tailwind gerar): tint suave + cor cheia.
const PALETTE = [
  { bg: 'bg-avatar-1-soft', fg: 'text-avatar-1' },
  { bg: 'bg-avatar-2-soft', fg: 'text-avatar-2' },
  { bg: 'bg-avatar-3-soft', fg: 'text-avatar-3' },
  { bg: 'bg-avatar-4-soft', fg: 'text-avatar-4' },
  { bg: 'bg-avatar-5-soft', fg: 'text-avatar-5' },
] as const

/** Hash determinístico do nome → índice da paleta (mesma pessoa, mesma cor). */
const tone = computed(() => {
  const key = normalizeText(props.name)
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) % 100000
  return PALETTE[hash % PALETTE.length] ?? PALETTE[0]
})

const sizeClass = computed(() =>
  props.size === 'sm' ? 'h-8 w-8 text-[0.7rem]' : 'h-9 w-9 text-xs',
)
</script>

<template>
  <span
    class="inline-flex shrink-0 items-center justify-center rounded-full font-semibold uppercase ring-1 ring-inset ring-current/15"
    :class="[sizeClass, tone.bg, tone.fg]"
    aria-hidden="true"
  >
    {{ initials }}
  </span>
</template>
