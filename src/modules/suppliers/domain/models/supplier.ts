import {
  type BankAccount,
  type PersonAddress,
  emptyBankAccount,
  emptyPersonAddress,
  toBankAccountType,
} from '@/shared/domain'
import { normalizeCnpj, normalizeEmail, onlyDigits } from '@/shared/extensions'
import { SupplierStatus, toSupplierStatus } from '../enums/supplier-status'
import { SupplierType, isGenericType, toSupplierType } from '../enums/supplier-type'
import {
  type SupplierFiscal,
  type SupplierFiscalJson,
  emptySupplierFiscal,
  supplierFiscalFromJson,
  supplierFiscalToJson,
} from './supplier-fiscal'

/**
 * Supplier — fornecedor (model raiz, spec §10.2). Imutável (use `copySupplier`),
 * em inglês, com `fromJson`/`toJson`. Usa `PersonAddress` e `BankAccount`
 * **compartilhados** (`shared/domain`, ADR-010). `document` guarda **só
 * dígitos/alfanuméricos em maiúsculas** (a UI formata) — vazio para genérico.
 */
export interface Supplier {
  id: number | null
  type: SupplierType
  legalName: string
  tradeName: string
  document: string
  stateRegistration: string
  address: PersonAddress
  phone: string
  fax: string
  mobile: string
  contactName: string
  email: string
  salesRepName: string
  salesRepPhone: string
  bankAccount: BankAccount
  fiscal: SupplierFiscal
  notes: string
  status: SupplierStatus
}

interface AddressJson {
  logradouro: string
  numero: string
  complemento: string
  bairro: string
  cidadeId: number | null
  cidadeNome: string
  uf: string
  paisId: number | null
  paisNome: string
  cep: string
}

interface BankJson {
  tipo: string | null
  banco: string
  agencia: string
  conta: string
  favorecido: string
  documentoFavorecido: string
}

export interface SupplierJson {
  codigo: number | null
  natureza: string
  razaoSocial: string
  fantasia: string
  documento: string
  inscricaoEstadual: string
  endereco: AddressJson
  telefone: string
  fax: string
  celular: string
  nomeContato: string
  email: string
  representante: string
  representanteTelefone: string
  banco: BankJson
  fiscal: SupplierFiscalJson
  observacao: string
  situacao: string
}

/** Resumo para grid e lookup (acesso rápido — regra de grid §14.4). */
export interface SupplierSummary {
  id: number
  type: SupplierType
  legalName: string
  tradeName: string
  document: string
  mobile: string
  phone: string
  cityUf: string
  status: SupplierStatus
}

function addressFromJson(json: AddressJson): PersonAddress {
  return {
    street: json.logradouro ?? '',
    number: json.numero ?? '',
    complement: json.complemento ?? '',
    district: json.bairro ?? '',
    cityId: json.cidadeId ?? null,
    cityName: json.cidadeNome ?? '',
    uf: json.uf ?? '',
    countryId: json.paisId ?? null,
    countryName: json.paisNome ?? '',
    zipCode: onlyDigits(json.cep ?? ''),
  }
}

function addressToJson(address: PersonAddress): AddressJson {
  return {
    logradouro: address.street,
    numero: address.number,
    complemento: address.complement,
    bairro: address.district,
    cidadeId: address.cityId,
    cidadeNome: address.cityName,
    uf: address.uf,
    paisId: address.countryId,
    paisNome: address.countryName,
    cep: onlyDigits(address.zipCode),
  }
}

function bankFromJson(json: BankJson): BankAccount {
  return {
    type: toBankAccountType(json.tipo),
    bank: json.banco ?? '',
    branch: json.agencia ?? '',
    number: json.conta ?? '',
    holderName: json.favorecido ?? '',
    holderDocument: normalizeCnpj(json.documentoFavorecido ?? ''),
  }
}

function bankToJson(bank: BankAccount): BankJson {
  return {
    tipo: bank.type,
    banco: bank.bank,
    agencia: bank.branch,
    conta: bank.number,
    favorecido: bank.holderName,
    documentoFavorecido: bank.holderDocument,
  }
}

export function supplierFromJson(json: SupplierJson): Supplier {
  return {
    id: json.codigo ?? null,
    type: toSupplierType(json.natureza),
    legalName: json.razaoSocial ?? '',
    tradeName: json.fantasia ?? '',
    document: normalizeCnpj(json.documento ?? ''),
    stateRegistration: json.inscricaoEstadual ?? '',
    address: addressFromJson(json.endereco),
    phone: onlyDigits(json.telefone ?? ''),
    fax: onlyDigits(json.fax ?? ''),
    mobile: onlyDigits(json.celular ?? ''),
    contactName: json.nomeContato ?? '',
    email: normalizeEmail(json.email ?? ''),
    salesRepName: json.representante ?? '',
    salesRepPhone: onlyDigits(json.representanteTelefone ?? ''),
    bankAccount: bankFromJson(json.banco),
    fiscal: supplierFiscalFromJson(json.fiscal),
    notes: json.observacao ?? '',
    status: toSupplierStatus(json.situacao),
  }
}

export function supplierToJson(supplier: Supplier): SupplierJson {
  return {
    codigo: supplier.id,
    natureza: supplier.type,
    razaoSocial: supplier.legalName,
    fantasia: supplier.tradeName,
    documento: supplier.document,
    inscricaoEstadual: supplier.stateRegistration,
    endereco: addressToJson(supplier.address),
    telefone: onlyDigits(supplier.phone),
    fax: onlyDigits(supplier.fax),
    celular: onlyDigits(supplier.mobile),
    nomeContato: supplier.contactName,
    email: supplier.email,
    representante: supplier.salesRepName,
    representanteTelefone: onlyDigits(supplier.salesRepPhone),
    banco: bankToJson(supplier.bankAccount),
    fiscal: supplierFiscalToJson(supplier.fiscal),
    observacao: supplier.notes,
    situacao: supplier.status,
  }
}

export function copySupplier(base: Supplier, changes: Partial<Supplier>): Supplier {
  return { ...base, ...changes }
}

/** Fornecedor novo (vazio) — nasce Jurídico e Ativo. */
export function emptySupplier(): Supplier {
  return {
    id: null,
    type: SupplierType.Company,
    legalName: '',
    tradeName: '',
    document: '',
    stateRegistration: '',
    address: emptyPersonAddress(),
    phone: '',
    fax: '',
    mobile: '',
    contactName: '',
    email: '',
    salesRepName: '',
    salesRepPhone: '',
    bankAccount: emptyBankAccount(),
    fiscal: emptySupplierFiscal(),
    notes: '',
    status: SupplierStatus.Active,
  }
}

/** "Cidade/UF" para o grid (vazio quando não há cidade). */
export function supplierCityUf(supplier: Pick<Supplier, 'address'>): string {
  const { cityName, uf } = supplier.address
  if (!cityName) return ''
  return uf ? `${cityName}/${uf}` : cityName
}

/** Nome de exibição: fantasia quando houver, senão razão/nome. */
export function supplierDisplayName(supplier: Pick<Supplier, 'legalName' | 'tradeName'>): string {
  return supplier.tradeName.trim() || supplier.legalName.trim()
}

export function toSupplierSummary(supplier: Supplier): SupplierSummary {
  return {
    id: supplier.id ?? 0,
    type: supplier.type,
    legalName: supplier.legalName,
    tradeName: supplier.tradeName,
    document: isGenericType(supplier.type) ? '' : supplier.document,
    mobile: supplier.mobile,
    phone: supplier.phone,
    cityUf: supplierCityUf(supplier),
    status: supplier.status,
  }
}
