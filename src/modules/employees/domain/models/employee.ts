import {
  type BankAccount,
  type PersonAddress,
  emptyBankAccount,
  emptyPersonAddress,
  toBankAccountType,
} from '@/shared/domain'
import { normalizeEmail, onlyDigits } from '@/shared/extensions'
import { EmployeeStatus, toEmployeeStatus } from '../enums/employee-status'

/**
 * Employee — funcionário (model raiz do módulo, ver spec `employee-registration`
 * §9.2). Model **imutável** (use `copyEmployee`), em inglês, com `fromJson`/`toJson`.
 * Usa o `PersonAddress` e o `BankAccount` **compartilhados** (`shared/domain`, ADR-010).
 *
 * Notas de contrato:
 * - CPF e telefones são guardados **só com dígitos** (a UI formata).
 * - `group` é **texto livre** nesta fase (decisão P8); vira lookup quando o
 *   Cadastro de Grupos existir.
 * - `dismissalDate` só é relevante quando `status === Dismissed` (decisão P3).
 */
export interface Employee {
  id: number | null
  name: string
  nickname: string
  cpf: string
  rg: string
  birthDate: string | null
  fatherName: string
  motherName: string
  spouseName: string
  /** Naturalidade — FK de Cidade (módulo `locations`); UF derivada (§16.2). */
  naturalCityId: number | null
  naturalCityName: string
  naturalUf: string
  address: PersonAddress
  companyPhone: string
  personalPhone: string
  email: string
  admissionDate: string | null
  dismissalDate: string | null
  salary: number
  /** Comissão em **percentual** (0–100) — decisão P7. */
  commission: number
  status: EmployeeStatus
  isRepresentative: boolean
  representativeId: number | null
  representativeName: string
  /** Grupo — texto livre nesta fase (decisão P8). */
  group: string
  bankAccount: BankAccount
}

export interface EmployeeJson {
  codigo: number | null
  nome: string
  apelido: string
  cpf: string
  rg: string
  nascimento: string | null
  nomePai: string
  nomeMae: string
  conjuge: string
  cidadeNaturalId: number | null
  cidadeNaturalNome: string
  ufNatural: string
  endereco: string
  numero: string
  complemento: string
  bairro: string
  cidadeId: number | null
  cidadeNome: string
  uf: string
  paisId: number | null
  paisNome: string
  cep: string
  foneEmpresa: string
  fonePessoal: string
  email: string
  admissao: string | null
  demissao: string | null
  salario: number
  comissao: number
  situacao: string
  representante: boolean
  representanteId: number | null
  representanteNome: string
  grupo: string
  contaTipo: string | null
  banco: string
  agencia: string
  conta: string
}

export function employeeFromJson(json: EmployeeJson): Employee {
  return {
    id: json.codigo ?? null,
    name: json.nome ?? '',
    nickname: json.apelido ?? '',
    cpf: onlyDigits(json.cpf ?? ''),
    rg: json.rg ?? '',
    birthDate: json.nascimento ?? null,
    fatherName: json.nomePai ?? '',
    motherName: json.nomeMae ?? '',
    spouseName: json.conjuge ?? '',
    naturalCityId: json.cidadeNaturalId ?? null,
    naturalCityName: json.cidadeNaturalNome ?? '',
    naturalUf: json.ufNatural ?? '',
    address: {
      street: json.endereco ?? '',
      number: json.numero ?? '',
      complement: json.complemento ?? '',
      district: json.bairro ?? '',
      cityId: json.cidadeId ?? null,
      cityName: json.cidadeNome ?? '',
      uf: json.uf ?? '',
      countryId: json.paisId ?? null,
      countryName: json.paisNome ?? '',
      zipCode: onlyDigits(json.cep ?? ''),
    },
    companyPhone: onlyDigits(json.foneEmpresa ?? ''),
    personalPhone: onlyDigits(json.fonePessoal ?? ''),
    email: normalizeEmail(json.email ?? ''),
    admissionDate: json.admissao ?? null,
    dismissalDate: json.demissao ?? null,
    salary: Number(json.salario ?? 0),
    commission: Number(json.comissao ?? 0),
    status: toEmployeeStatus(json.situacao),
    isRepresentative: json.representante === true,
    representativeId: json.representanteId ?? null,
    representativeName: json.representanteNome ?? '',
    group: json.grupo ?? '',
    bankAccount: {
      type: toBankAccountType(json.contaTipo),
      bank: json.banco ?? '',
      branch: json.agencia ?? '',
      number: json.conta ?? '',
      // Funcionário não usa favorecido (campos compartilhados, opcionais — ADR-010).
      holderName: '',
      holderDocument: '',
    },
  }
}

export function employeeToJson(employee: Employee): EmployeeJson {
  return {
    codigo: employee.id,
    nome: employee.name,
    apelido: employee.nickname,
    cpf: onlyDigits(employee.cpf),
    rg: employee.rg,
    nascimento: employee.birthDate,
    nomePai: employee.fatherName,
    nomeMae: employee.motherName,
    conjuge: employee.spouseName,
    cidadeNaturalId: employee.naturalCityId,
    cidadeNaturalNome: employee.naturalCityName,
    ufNatural: employee.naturalUf,
    endereco: employee.address.street,
    numero: employee.address.number,
    complemento: employee.address.complement,
    bairro: employee.address.district,
    cidadeId: employee.address.cityId,
    cidadeNome: employee.address.cityName,
    uf: employee.address.uf,
    paisId: employee.address.countryId,
    paisNome: employee.address.countryName,
    cep: onlyDigits(employee.address.zipCode),
    foneEmpresa: onlyDigits(employee.companyPhone),
    fonePessoal: onlyDigits(employee.personalPhone),
    email: employee.email,
    admissao: employee.admissionDate,
    demissao: employee.dismissalDate,
    salario: employee.salary,
    comissao: employee.commission,
    situacao: employee.status,
    representante: employee.isRepresentative,
    representanteId: employee.representativeId,
    representanteNome: employee.representativeName,
    grupo: employee.group,
    contaTipo: employee.bankAccount.type,
    banco: employee.bankAccount.bank,
    agencia: employee.bankAccount.branch,
    conta: employee.bankAccount.number,
  }
}

export function copyEmployee(base: Employee, changes: Partial<Employee>): Employee {
  return { ...base, ...changes }
}

/** Funcionário novo (vazio) — estado inicial do formulário. */
export function emptyEmployee(): Employee {
  return {
    id: null,
    name: '',
    nickname: '',
    cpf: '',
    rg: '',
    birthDate: null,
    fatherName: '',
    motherName: '',
    spouseName: '',
    naturalCityId: null,
    naturalCityName: '',
    naturalUf: '',
    address: emptyPersonAddress(),
    companyPhone: '',
    personalPhone: '',
    email: '',
    admissionDate: null,
    dismissalDate: null,
    salary: 0,
    commission: 0,
    status: EmployeeStatus.Active,
    isRepresentative: false,
    representativeId: null,
    representativeName: '',
    group: '',
    bankAccount: emptyBankAccount(),
  }
}
