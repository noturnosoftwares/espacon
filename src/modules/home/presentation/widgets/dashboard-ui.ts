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
  orange: 'bg-accent/10 text-accent',
  blue: 'bg-info/10 text-info',
  blueLight: 'bg-info/10 text-info',
  green: 'bg-success/10 text-success',
  yellow: 'bg-warning/10 text-warning',
  red: 'bg-danger/10 text-danger',
}

/** Badge de contagem (borda + texto) por acento. */
const ACCENT_BADGE: Readonly<Record<AccentTone, string>> = {
  orange: 'border-accent/40 text-accent',
  blue: 'border-info/40 text-info',
  blueLight: 'border-info/40 text-info',
  green: 'border-success/40 text-success',
  yellow: 'border-warning/40 text-warning',
  red: 'border-danger/40 text-danger',
}

/** Apenas a cor do texto/ícone por acento. */
const ACCENT_TEXT: Readonly<Record<AccentTone, string>> = {
  orange: 'text-accent',
  blue: 'text-info',
  blueLight: 'text-info',
  green: 'text-success',
  yellow: 'text-warning',
  red: 'text-danger',
}

const TREND_TEXT: Readonly<Record<TrendTone, string>> = {
  positive: 'text-success',
  critical: 'text-danger',
  neutral: 'text-content-muted',
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
  atendimento: 'bg-info/15 text-info',
  sistema: 'bg-info/15 text-info',
  financeiro: 'bg-success/15 text-success',
  pessoal: 'bg-accent/15 text-accent',
  comercial: 'bg-warning/15 text-warning',
}

/** Apenas a cor do texto/ícone por categoria. */
const CATEGORY_TEXT: Readonly<Record<BusinessCategory, string>> = {
  atendimento: 'text-info',
  sistema: 'text-info',
  financeiro: 'text-success',
  pessoal: 'text-accent',
  comercial: 'text-warning',
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
