import { type IeIndicator, toIeIndicator } from '../enums/ie-indicator'
import { type TaxRegime, toTaxRegime } from '../enums/tax-regime'

/**
 * SupplierFiscal — bloco fiscal (Reforma Tributária) do fornecedor (spec §4.5).
 * **Opcional até o módulo fiscal existir** (D6/P6): o cadastro só **estrutura** os
 * campos que **classificam** o fornecedor para a apuração CBS/IBS futura. Sem
 * cálculo aqui.
 */
export interface SupplierFiscal {
  taxRegime: TaxRegime | null
  ieIndicator: IeIndicator | null
  /** Contribuinte IBS/CBS (Reforma) — crédito/apuração. */
  isIbsCbsTaxpayer: boolean
  municipalRegistration: string
  cnae: string
  suframa: string
  optsForSimples: boolean
  isRuralProducer: boolean
  ruralProducerRegistration: string
}

export interface SupplierFiscalJson {
  regimeTributario: string | null
  indicadorIe: string | null
  contribuinteIbsCbs: boolean
  inscricaoMunicipal: string
  cnae: string
  suframa: string
  optanteSimples: boolean
  produtorRural: boolean
  inscricaoProdutor: string
}

export function supplierFiscalFromJson(json: SupplierFiscalJson): SupplierFiscal {
  return {
    taxRegime: toTaxRegime(json.regimeTributario),
    ieIndicator: toIeIndicator(json.indicadorIe),
    isIbsCbsTaxpayer: json.contribuinteIbsCbs === true,
    municipalRegistration: json.inscricaoMunicipal ?? '',
    cnae: json.cnae ?? '',
    suframa: json.suframa ?? '',
    optsForSimples: json.optanteSimples === true,
    isRuralProducer: json.produtorRural === true,
    ruralProducerRegistration: json.inscricaoProdutor ?? '',
  }
}

export function supplierFiscalToJson(fiscal: SupplierFiscal): SupplierFiscalJson {
  return {
    regimeTributario: fiscal.taxRegime,
    indicadorIe: fiscal.ieIndicator,
    contribuinteIbsCbs: fiscal.isIbsCbsTaxpayer,
    inscricaoMunicipal: fiscal.municipalRegistration,
    cnae: fiscal.cnae,
    suframa: fiscal.suframa,
    optanteSimples: fiscal.optsForSimples,
    produtorRural: fiscal.isRuralProducer,
    inscricaoProdutor: fiscal.ruralProducerRegistration,
  }
}

export function copySupplierFiscal(
  base: SupplierFiscal,
  changes: Partial<SupplierFiscal>,
): SupplierFiscal {
  return { ...base, ...changes }
}

export function emptySupplierFiscal(): SupplierFiscal {
  return {
    taxRegime: null,
    ieIndicator: null,
    isIbsCbsTaxpayer: false,
    municipalRegistration: '',
    cnae: '',
    suframa: '',
    optsForSimples: false,
    isRuralProducer: false,
    ruralProducerRegistration: '',
  }
}
