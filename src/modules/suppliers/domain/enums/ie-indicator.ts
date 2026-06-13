/** Indicador de IE do destinatário (espelha `indIEDest` da NF-e) — spec §4.5. */
export enum IeIndicator {
  Taxpayer = 'CONTRIBUINTE', // 1 — contribuinte ICMS·IBS
  Exempt = 'ISENTO', // 2 — contribuinte isento de inscrição
  NonTaxpayer = 'NAO_CONTRIBUINTE', // 9 — não contribuinte
}

export const IE_INDICATORS: readonly IeIndicator[] = [
  IeIndicator.Taxpayer,
  IeIndicator.Exempt,
  IeIndicator.NonTaxpayer,
]

export function ieIndicatorLabel(indicator: IeIndicator): string {
  switch (indicator) {
    case IeIndicator.Taxpayer:
      return 'Contribuinte ICMS·IBS'
    case IeIndicator.Exempt:
      return 'Contribuinte isento de inscrição'
    case IeIndicator.NonTaxpayer:
      return 'Não contribuinte'
  }
}

export function toIeIndicator(value: string | null | undefined): IeIndicator | null {
  return (IE_INDICATORS as readonly string[]).includes(value ?? '')
    ? (value as IeIndicator)
    : null
}
