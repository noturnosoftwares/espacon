// Scope: [M] module-customers
//
// Rótulos e tons de exibição (presentation) para os enums do cliente. Mantém os
// textos pt-BR e o mapeamento para a paleta Noturno fora dos models (domain
// permanece livre de UI). Tons resolvem cores via design-system/tones.

import type { Tone } from "@/shared/design-system/tones";
import type { CustomerStatus } from "../domain/enums/customer-status";
import type { ContractSignStatus } from "../domain/enums/contract-sign-status";
import type { PersonType } from "../domain/enums/person-type";
import type {
  AmendmentType,
  FinancialStatus,
  IntegrationEnvironment,
  InvoiceStatus,
  PaymentMethod,
  RepresentationOwner,
  TicketPriority,
  TicketStatus,
} from "../domain/models/customer";

export const STATUS_LABEL: Record<CustomerStatus, string> = {
  ativo: "Ativo",
  bloqueado: "Bloqueado",
  cancelado: "Cancelado",
  suspenso: "Suspenso",
};

export const STATUS_TONE: Record<CustomerStatus, Tone> = {
  ativo: "green",
  bloqueado: "red",
  cancelado: "neutral",
  suspenso: "orange",
};

export const SIGN_LABEL: Record<ContractSignStatus, string> = {
  aguardando: "Aguardando assinatura",
  parcial: "Parcialmente assinado",
  assinado: "Assinado",
  cancelado: "Cancelado",
  expirado: "Expirado",
};

export const SIGN_TONE: Record<ContractSignStatus, Tone> = {
  aguardando: "orange",
  parcial: "blue",
  assinado: "green",
  cancelado: "neutral",
  expirado: "red",
};

export const PERSON_TYPE_LABEL: Record<PersonType, string> = {
  pf: "Pessoa Física",
  pj: "Pessoa Jurídica",
};

export const PERSON_TYPE_SHORT: Record<PersonType, string> = {
  pf: "PF",
  pj: "PJ",
};

export const FINANCIAL_LABEL: Record<FinancialStatus, string> = {
  "em-dia": "Em dia",
  atrasado: "Atrasado",
  inadimplente: "Inadimplente",
};

export const FINANCIAL_TONE: Record<FinancialStatus, Tone> = {
  "em-dia": "green",
  atrasado: "orange",
  inadimplente: "red",
};

export const PAYMENT_METHOD_LABEL: Record<PaymentMethod, string> = {
  boleto: "Boleto",
  pix: "PIX",
  cartao: "Cartão",
  transferencia: "Transferência",
};

export const OWNER_LABEL: Record<RepresentationOwner, string> = {
  matriz: "Matriz",
  franquia: "Franquia",
  representante: "Representante",
};

export const AMENDMENT_LABEL: Record<AmendmentType, string> = {
  "ajuste-anual": "Ajuste anual",
  "acrescimo-computadores": "Acréscimo de computadores",
  "reducao-computadores": "Redução de computadores",
  bonificacao: "Bonificação",
  renegociacao: "Renegociação",
  gratificacao: "Gratificação",
  outros: "Outros ajustes",
};

export const ENVIRONMENT_LABEL: Record<IntegrationEnvironment, string> = {
  producao: "Produção",
  homologacao: "Homologação",
  testes: "Testes",
};

export const ENVIRONMENT_TONE: Record<IntegrationEnvironment, Tone> = {
  producao: "green",
  homologacao: "orange",
  testes: "blue",
};

export const INVOICE_LABEL: Record<InvoiceStatus, string> = {
  paga: "Paga",
  aberta: "Aberta",
  atrasada: "Atrasada",
  cancelada: "Cancelada",
};

export const INVOICE_TONE: Record<InvoiceStatus, Tone> = {
  paga: "green",
  aberta: "blue",
  atrasada: "red",
  cancelada: "neutral",
};

export const TICKET_STATUS_LABEL: Record<TicketStatus, string> = {
  aberto: "Aberto",
  "em-andamento": "Em andamento",
  resolvido: "Resolvido",
  fechado: "Fechado",
};

export const TICKET_STATUS_TONE: Record<TicketStatus, Tone> = {
  aberto: "orange",
  "em-andamento": "blue",
  resolvido: "green",
  fechado: "neutral",
};

export const TICKET_PRIORITY_LABEL: Record<TicketPriority, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  urgente: "Urgente",
};

export const TICKET_PRIORITY_TONE: Record<TicketPriority, Tone> = {
  baixa: "neutral",
  media: "blue",
  alta: "orange",
  urgente: "red",
};
