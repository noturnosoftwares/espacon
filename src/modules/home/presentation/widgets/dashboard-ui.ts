import type { AccentTone, BusinessCategory, TrendTone } from '../../domain/models'

/**
 * dashboard-ui — tradução das **chaves semânticas** do contrato do dashboard
 * (accent/trend/category) para classes do Design System (paleta Noturno).
 *
 * Fica na presentation de propósito: o contrato carrega só a intenção; a cor é
 * decisão visual. Classes escritas como **strings literais completas** para que
 * o Tailwind as detecte na varredura. Sem cores fora da paleta oficial.
 */

/** Chip do ícone (texto + leve preenchimento) por acento. */
const ACCENT_CHIP: Readonly<Record<AccentTone, string>> = {
  orange: 'bg-noturno-orange/10 text-noturno-orange',
  blue: 'bg-noturno-blue-dark/10 text-noturno-blue-dark',
  blueLight: 'bg-noturno-blue-light/10 text-noturno-blue-light',
  green: 'bg-noturno-green/10 text-noturno-green',
  yellow: 'bg-noturno-yellow/10 text-noturno-yellow',
  red: 'bg-noturno-red/10 text-noturno-red',
}

/** Badge de contagem (borda + texto) por acento. */
const ACCENT_BADGE: Readonly<Record<AccentTone, string>> = {
  orange: 'border-noturno-orange/40 text-noturno-orange',
  blue: 'border-noturno-blue-dark/40 text-noturno-blue-dark',
  blueLight: 'border-noturno-blue-light/40 text-noturno-blue-light',
  green: 'border-noturno-green/40 text-noturno-green',
  yellow: 'border-noturno-yellow/40 text-noturno-yellow',
  red: 'border-noturno-red/40 text-noturno-red',
}

/** Apenas a cor do texto/ícone por acento. */
const ACCENT_TEXT: Readonly<Record<AccentTone, string>> = {
  orange: 'text-noturno-orange',
  blue: 'text-noturno-blue-dark',
  blueLight: 'text-noturno-blue-light',
  green: 'text-noturno-green',
  yellow: 'text-noturno-yellow',
  red: 'text-noturno-red',
}

const TREND_TEXT: Readonly<Record<TrendTone, string>> = {
  positive: 'text-noturno-green',
  critical: 'text-noturno-red',
  neutral: 'text-noturno-grey-light',
}

const CATEGORY_LABEL: Readonly<Record<BusinessCategory, string>> = {
  atendimento: 'Atendimento',
  sistema: 'Sistema',
  financeiro: 'Financeiro',
  pessoal: 'Pessoal',
  comercial: 'Comercial',
}

/** Pílula da categoria (texto + leve preenchimento). */
const CATEGORY_BADGE: Readonly<Record<BusinessCategory, string>> = {
  atendimento: 'bg-noturno-blue-light/15 text-noturno-blue-light',
  sistema: 'bg-noturno-blue-dark/15 text-noturno-blue-dark',
  financeiro: 'bg-noturno-green/15 text-noturno-green',
  pessoal: 'bg-noturno-orange/15 text-noturno-orange',
  comercial: 'bg-noturno-yellow/15 text-noturno-yellow',
}

/** Apenas a cor do texto/ícone por categoria. */
const CATEGORY_TEXT: Readonly<Record<BusinessCategory, string>> = {
  atendimento: 'text-noturno-blue-light',
  sistema: 'text-noturno-blue-dark',
  financeiro: 'text-noturno-green',
  pessoal: 'text-noturno-orange',
  comercial: 'text-noturno-yellow',
}

export const accentChipClass = (tone: AccentTone): string => ACCENT_CHIP[tone]
export const accentBadgeClass = (tone: AccentTone): string => ACCENT_BADGE[tone]
export const accentTextClass = (tone: AccentTone): string => ACCENT_TEXT[tone]
export const trendTextClass = (tone: TrendTone): string => TREND_TEXT[tone]
export const categoryLabel = (category: BusinessCategory): string => CATEGORY_LABEL[category]
export const categoryBadgeClass = (category: BusinessCategory): string => CATEGORY_BADGE[category]
export const categoryTextClass = (category: BusinessCategory): string => CATEGORY_TEXT[category]

/** Ícone PrimeIcons a partir da chave semântica do contrato. */
export const iconClass = (key: string): string => `pi pi-${key}`
