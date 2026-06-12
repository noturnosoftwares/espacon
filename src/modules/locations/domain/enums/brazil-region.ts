import { onlyDigits } from '@/shared/extensions'

/**
 * BrazilRegion — região geográfica de uma UF brasileira (spec
 * `locations/location-registry` §9.1). Só se aplica a estados do Brasil; UF
 * estrangeira fica sem região.
 */
export enum BrazilRegion {
  North = 'NORTE',
  Northeast = 'NORDESTE',
  Southeast = 'SUDESTE',
  South = 'SUL',
  CenterWest = 'CENTRO_OESTE',
}

const LABELS: Record<BrazilRegion, string> = {
  [BrazilRegion.North]: 'Norte',
  [BrazilRegion.Northeast]: 'Nordeste',
  [BrazilRegion.Southeast]: 'Sudeste',
  [BrazilRegion.South]: 'Sul',
  [BrazilRegion.CenterWest]: 'Centro-Oeste',
}

export const BRAZIL_REGIONS: BrazilRegion[] = Object.values(BrazilRegion)

export function brazilRegionLabel(region: BrazilRegion | null): string {
  return region ? LABELS[region] : ''
}

/** Converte o texto do JSON para o enum (tolerante a ausência/valor inválido). */
export function toBrazilRegion(value: string | null | undefined): BrazilRegion | null {
  if (!value) return null
  return BRAZIL_REGIONS.find((region) => region === value) ?? null
}

/**
 * Deriva a região pelo **1º dígito do código IBGE da UF** (E-5): 1=Norte,
 * 2=Nordeste, 3=Sudeste, 4=Sul, 5=Centro-Oeste. Só Brasil; estrangeiro → `null`.
 */
export function regionFromIbgeUf(ibgeCode: string): BrazilRegion | null {
  switch (onlyDigits(ibgeCode)[0]) {
    case '1':
      return BrazilRegion.North
    case '2':
      return BrazilRegion.Northeast
    case '3':
      return BrazilRegion.Southeast
    case '4':
      return BrazilRegion.South
    case '5':
      return BrazilRegion.CenterWest
    default:
      return null
  }
}
