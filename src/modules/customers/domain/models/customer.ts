// Scope: [M] module-customers
//
// Model interno do Cliente — núcleo do sistema (ver
// docs/specifications/customers/README.md). Esta fase cobre a Aba Principal
// (dados básicos, endereço, contatos, forma de pagamento, situação) + um resumo
// de contrato/licenciamento e da representação (matriz/franquia/representante),
// suficiente para a listagem e o detalhe. As demais áreas (aditivos, ferramentas,
// pedidos, integrações, sócios, instalações, histórico) entram em fases seguintes
// e plugam neste model sem refatoração estrutural.

import type { PersonType } from "../enums/person-type";
import type { CustomerStatus } from "../enums/customer-status";
import type { ContractSignStatus } from "../enums/contract-sign-status";

/** Forma de pagamento do cliente. */
export type PaymentMethod = "boleto" | "pix" | "cartao" | "transferencia";

/** Situação financeira (coluna/filtro "Financeiro" da listagem). */
export type FinancialStatus = "em-dia" | "atrasado" | "inadimplente";

/** Endereço (Aba Principal → Dados básicos). */
export type Address = {
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  uf: string;
  zip: string;
};

/** Contato do cliente (múltiplos por cliente). */
export type Contact = {
  id: string;
  name: string;
  phone?: string;
  mobile?: string;
  email?: string;
};

/** Resumo do contrato/licenciamento exibido na listagem e no detalhe. */
export type ContractSummary = {
  plan: string;
  /** Modalidade (ex.: Advanced, Light). */
  modality: string;
  computersContracted: number;
  computersInstalled: number;
  /** Valor mensal final já calculado (assinatura ± ajustes + ferramentas). */
  monthlyValue: number;
  signStatus: ContractSignStatus;
  /** Data do contrato (ISO YYYY-MM-DD). Base do dia de pagamento automático. */
  contractDate: string;
};

/** Representação: a quem o cliente pertence (Matriz/Franquia/Representante). */
export type RepresentationOwner = "matriz" | "franquia" | "representante";
export type Representation = {
  owner: RepresentationOwner;
  franchiseName?: string;
  representativeName?: string;
  startDate?: string;
  /** Comissão (%). */
  commission?: number;
};

// ---------------------------------------------------------------------------
// Áreas do detalhe (abas). Mock-first: hoje preenchidas por um gerador
// determinístico (data/mocks/mock-customer-details). Com API real, virão do
// provider/mapper sem alterar estas estruturas.
// ---------------------------------------------------------------------------

/** Aditivo contratual (aba Comercial). */
export type AmendmentType =
  | "ajuste-anual"
  | "acrescimo-computadores"
  | "reducao-computadores"
  | "bonificacao"
  | "renegociacao"
  | "gratificacao"
  | "outros";

export type ContractAmendment = {
  id: string;
  /** Data (ISO YYYY-MM-DD). */
  date: string;
  type: AmendmentType;
  /** Impacto no valor (pode ser negativo). */
  value: number;
  note?: string;
  /** Usuário responsável pelo aditivo. */
  responsible: string;
};

/** Ferramenta adicional contratada (aba Comercial). */
export type ExtraTool = {
  id: string;
  name: string;
  active: boolean;
  /** Validade (ISO) quando aplicável. */
  validUntil?: string;
  value: number;
  licenses: number;
};

/** Sócio / representante legal (aba Administração — apenas PJ). */
export type Partner = {
  id: string;
  name: string;
  document: string;
  rg?: string;
  phone?: string;
  mobile?: string;
  email?: string;
  legalRepresentative: boolean;
  mustSign: boolean;
  signed: boolean;
  signedAt?: string;
};

/** Ambiente de uma integração. */
export type IntegrationEnvironment = "producao" | "homologacao" | "testes";

/** Servidor/integração do cliente (aba Integrações). */
export type ServerIntegration = {
  id: string;
  name: string;
  hostname: string;
  port: number;
  database: string;
  environment: IntegrationEnvironment;
  installedVersion: string;
  autoUpdate: boolean;
  updateOnNextCheck: boolean;
};

/** Credencial de API (aba Integrações). Segredos exibidos mascarados. */
export type ApiCredential = {
  id: string;
  name: string;
  clientId: string;
  /** Mascarado para exibição (nunca o valor real em claro). */
  secretMasked: string;
};

/** Instalação/ambiente em uso (aba Administração). */
export type Installation = {
  id: string;
  computerName: string;
  registeredAt: string;
  server: string;
  environment: string;
  type: string;
};

/** Tipo de evento do histórico (aba Administração). */
export type HistoryEntryType =
  | "cadastro"
  | "contrato"
  | "financeiro"
  | "bloqueio"
  | "desbloqueio"
  | "assinatura"
  | "integracao";

export type HistoryEntry = {
  id: string;
  /** Data/hora (ISO). */
  date: string;
  type: HistoryEntryType;
  title: string;
  description?: string;
  user?: string;
};

/** Anotação interna (não exibida ao cliente). */
export type Note = {
  id: string;
  date: string;
  author: string;
  text: string;
};

/** Registro de bloqueio do cliente (aba Administração). */
export type BlockInfo = {
  reason: string;
  responsible: string;
  date: string;
  note?: string;
};

/** Situação de uma fatura/cobrança (aba Financeiro). */
export type InvoiceStatus = "paga" | "aberta" | "atrasada" | "cancelada";

export type Invoice = {
  id: string;
  /** Competência (ex.: "Mai/2026"). */
  reference: string;
  dueDate: string;
  paidDate?: string;
  value: number;
  status: InvoiceStatus;
};

/** Situação de um chamado de suporte (aba Suporte). */
export type TicketStatus = "aberto" | "em-andamento" | "resolvido" | "fechado";
export type TicketPriority = "baixa" | "media" | "alta" | "urgente";

export type SupportTicket = {
  id: string;
  code: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  openedAt: string;
  /** Canal de origem (WhatsApp, Chat, Telefone...). */
  channel: string;
  agent?: string;
};

/**
 * Campos editáveis no cadastro/edição (CRUD). Não inclui `id`/`code`/`createdAt`
 * (gerados pelo sistema) nem as áreas do detalhe (preenchidas/derivadas depois).
 */
export type CustomerInput = {
  personType: PersonType;
  legalName: string;
  tradeName?: string;
  document: string;
  stateRegistration?: string;
  address: Address;
  contacts: Contact[];
  paymentMethod: PaymentMethod;
  status: CustomerStatus;
  financialStatus: FinancialStatus;
  contract: ContractSummary;
  representation: Representation;
  franchiseId?: string;
  representativeId?: string;
};

export type Customer = {
  id: string;
  /** Código do cliente. */
  code: string;
  personType: PersonType;
  /** Razão Social / Nome. */
  legalName: string;
  /** Fantasia / Apelido. */
  tradeName?: string;
  /** CPF/CNPJ já formatado para exibição. */
  document: string;
  /** RG / Inscrição Estadual. */
  stateRegistration?: string;
  address: Address;
  contacts: Contact[];
  paymentMethod: PaymentMethod;
  status: CustomerStatus;
  /** Situação financeira (em dia / atrasado / inadimplente). */
  financialStatus: FinancialStatus;
  /** Chamados de suporte em aberto. */
  openTickets: number;
  /** Rótulo do último atendimento (ex.: "Hoje 09:15"). */
  lastServiceLabel?: string;
  contract: ContractSummary;
  representation: Representation;

  // Vínculos de escopo (multiempresa) — filtram a listagem por accessScope.
  franchiseId?: string;
  representativeId?: string;

  /** Data de cadastro (ISO) para ordenação/exibição. */
  createdAt: string;

  // Áreas do detalhe (abas). Opcionais: a listagem carrega o cliente "enxuto"
  // e o detalhe é enriquecido pelo provider. Ausência → estado vazio na aba.
  /** Aditivos contratuais (Comercial). */
  amendments?: ContractAmendment[];
  /** Ferramentas adicionais contratadas (Comercial). */
  tools?: ExtraTool[];
  /** Sócios / representantes legais (Administração — PJ). */
  partners?: Partner[];
  /** Servidores / integrações (Integrações). */
  integrations?: ServerIntegration[];
  /** Credenciais de API (Integrações). */
  apiCredentials?: ApiCredential[];
  /** Instalações/ambientes em uso (Administração). */
  installations?: Installation[];
  /** Histórico de eventos (Administração). */
  history?: HistoryEntry[];
  /** Anotações internas (Administração). */
  notes?: Note[];
  /** Registro de bloqueio, quando aplicável (Administração). */
  block?: BlockInfo;
  /** Faturas/cobranças (Financeiro). */
  invoices?: Invoice[];
  /** Chamados de suporte (Suporte). */
  tickets?: SupportTicket[];
};
