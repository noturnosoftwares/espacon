/** Regime tributário (CRT) — spec §4.5. */
export enum TaxRegime {
  SimplesNacional = 'SIMPLES_NACIONAL',
  SimplesExcesso = 'SIMPLES_EXCESSO',
  RegimeNormal = 'REGIME_NORMAL',
  Mei = 'MEI',
}

export const TAX_REGIMES: readonly TaxRegime[] = [
  TaxRegime.SimplesNacional,
  TaxRegime.SimplesExcesso,
  TaxRegime.RegimeNormal,
  TaxRegime.Mei,
]

export function taxRegimeLabel(regime: TaxRegime): string {
  switch (regime) {
    case TaxRegime.SimplesNacional:
      return 'Simples Nacional'
    case TaxRegime.SimplesExcesso:
      return 'Simples Nacional (excesso de sublimite)'
    case TaxRegime.RegimeNormal:
      return 'Regime Normal'
    case TaxRegime.Mei:
      return 'MEI'
  }
}

export function toTaxRegime(value: string | null | undefined): TaxRegime | null {
  return (TAX_REGIMES as readonly string[]).includes(value ?? '') ? (value as TaxRegime) : null
}
