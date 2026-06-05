// Scope: [M] module-customers
//
// Gerador determinístico dos dados das abas do detalhe (Comercial, Financeiro,
// Suporte, Integrações, Administração). Mock-first: deriva listas plausíveis a
// partir do próprio cliente (código, contrato, situação) — sem aleatoriedade,
// para que recarregar a tela mostre sempre os mesmos dados. Com API real, estas
// estruturas virão do provider/mapper e este arquivo é descartado.

import { CustomerRules } from "../../domain/models/customer-rules";
import type {
  ApiCredential,
  ContractAmendment,
  Customer,
  ExtraTool,
  HistoryEntry,
  Installation,
  Invoice,
  InvoiceStatus,
  Note,
  Partner,
  ServerIntegration,
  SupportTicket,
} from "../../domain/models/customer";

const MONTHS_PT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function iso(d: Date): string {
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, "0"),
    String(d.getDate()).padStart(2, "0"),
  ].join("-");
}

/** Slug simples para hostnames/e-mails a partir do nome fantasia/razão. */
function slug(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove diacríticos (combining marks)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// ---------------------------------------------------------------------------
// Geradores por área. Cada um recebe o cliente base e devolve a lista da aba.
// ---------------------------------------------------------------------------

function buildAmendments(base: Customer): ContractAmendment[] {
  if (base.contract.signStatus !== "assinado") return [];
  const { id, contract } = base;
  const responsible = "Equipe Comercial";
  const list: ContractAmendment[] = [
    {
      id: `${id}-am-1`,
      date: contract.contractDate,
      type: "ajuste-anual",
      value: Math.round(contract.monthlyValue * 0.08),
      note: "Reajuste anual previsto em contrato (IPCA).",
      responsible,
    },
  ];
  if (contract.computersContracted >= 6) {
    list.push({
      id: `${id}-am-2`,
      date: contract.contractDate,
      type: "acrescimo-computadores",
      value: Math.round(contract.monthlyValue * 0.15),
      note: "Inclusão de novos terminais.",
      responsible,
    });
  }
  if (base.financialStatus !== "em-dia") {
    list.push({
      id: `${id}-am-3`,
      date: contract.contractDate,
      type: "renegociacao",
      value: -Math.round(contract.monthlyValue * 0.1),
      note: "Renegociação por atraso — abatimento temporário.",
      responsible,
    });
  }
  return list;
}

function buildTools(base: Customer): ExtraTool[] {
  const catalog = ["Stock", "Delivery", "Sales", "Manager", "DoctorCar", "Chat Mobile"];
  const advanced = base.contract.modality === "Anual" || base.contract.plan === "Advanced";
  const count = base.contract.signStatus === "assinado" ? (advanced ? 3 : 1) : 0;
  const start = Number(base.code) % catalog.length;
  return Array.from({ length: count }, (_, i) => {
    const name = catalog[(start + i) % catalog.length];
    return {
      id: `${base.id}-tool-${i + 1}`,
      name,
      active: !(base.status === "suspenso" && i === count - 1),
      value: 60 + ((Number(base.code) + i * 37) % 5) * 20,
      licenses: 1 + ((Number(base.code) + i) % 3),
    } satisfies ExtraTool;
  });
}

function buildPartners(base: Customer): Partner[] {
  if (base.personType !== "pj") return [];
  const signed = base.contract.signStatus === "assinado";
  const primary: Partner = {
    id: `${base.id}-pt-1`,
    name: base.contacts[0]?.name ?? "Sócio Administrador",
    document: "000.000.000-00",
    rg: "00.000.000-0",
    mobile: base.contacts[0]?.mobile,
    email: base.contacts[0]?.email,
    legalRepresentative: true,
    mustSign: true,
    signed,
    signedAt: signed ? base.contract.contractDate : undefined,
  };
  const partners: Partner[] = [primary];
  if (base.contract.computersContracted >= 8) {
    partners.push({
      id: `${base.id}-pt-2`,
      name: "Sócio Cotista",
      document: "111.111.111-11",
      legalRepresentative: false,
      mustSign: false,
      signed: false,
    });
  }
  return partners;
}

function buildIntegrations(base: Customer): ServerIntegration[] {
  if (!CustomerRules.canReleaseKeys(base.contract.signStatus)) return [];
  const host = slug(base.tradeName ?? base.legalName);
  const list: ServerIntegration[] = [
    {
      id: `${base.id}-int-1`,
      name: "Servidor principal",
      hostname: `${host}.noturno.app`,
      port: 5432,
      database: `nt_${host.replace(/-/g, "_")}`,
      environment: "producao",
      installedVersion: "4.8.2",
      autoUpdate: true,
      updateOnNextCheck: false,
    },
  ];
  if (base.contract.computersContracted >= 6) {
    list.push({
      id: `${base.id}-int-2`,
      name: "Homologação",
      hostname: `homolog.${host}.noturno.app`,
      port: 5433,
      database: `nt_${host.replace(/-/g, "_")}_hml`,
      environment: "homologacao",
      installedVersion: "4.9.0-rc1",
      autoUpdate: false,
      updateOnNextCheck: true,
    });
  }
  return list;
}

function buildApiCredentials(base: Customer): ApiCredential[] {
  if (!CustomerRules.canReleaseKeys(base.contract.signStatus)) return [];
  const host = slug(base.tradeName ?? base.legalName);
  return [
    {
      id: `${base.id}-api-1`,
      name: "Integração principal",
      clientId: `nt_${host.replace(/-/g, "")}_${base.code}`,
      secretMasked: "••••••••••••3f9a",
    },
  ];
}

function buildInstallations(base: Customer): Installation[] {
  const host = slug(base.tradeName ?? base.legalName);
  return Array.from({ length: base.contract.computersInstalled }, (_, i) => ({
    id: `${base.id}-inst-${i + 1}`,
    computerName: `PC-${String(i + 1).padStart(2, "0")}`,
    registeredAt: base.contract.contractDate,
    server: `${host}.noturno.app`,
    environment: "Produção",
    type: i === 0 ? "Servidor" : "Terminal",
  }));
}

function buildInvoices(base: Customer, now: Date): Invoice[] {
  const value = base.contract.monthlyValue;
  if (value <= 0) return [];
  const payDay = CustomerRules.paymentDay(base.contract.contractDate);
  const overdue = base.financialStatus === "inadimplente" ? 2
    : base.financialStatus === "atrasado" ? 1 : 0;

  // 6 competências: 5 passadas (mais antiga primeiro) + a corrente.
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), payDay);
    return d;
  });

  return months.map((due, i) => {
    const fromEnd = months.length - 1 - i; // 0 = mês corrente
    let status: InvoiceStatus;
    let paidDate: string | undefined;
    if (fromEnd < overdue) {
      status = "atrasada";
    } else if (fromEnd === 0) {
      status = "aberta";
    } else {
      status = "paga";
      paidDate = iso(new Date(due.getFullYear(), due.getMonth(), Math.max(1, payDay - 2)));
    }
    return {
      id: `${base.id}-inv-${i + 1}`,
      reference: `${MONTHS_PT[due.getMonth()]}/${due.getFullYear()}`,
      dueDate: iso(due),
      paidDate,
      value,
      status,
    } satisfies Invoice;
  }).reverse(); // mais recente primeiro
}

const TICKET_SUBJECTS = [
  "Erro ao emitir nota fiscal",
  "Lentidão no carregamento do estoque",
  "Dúvida sobre fechamento de caixa",
  "Solicitação de nova licença",
  "Falha na sincronização do delivery",
  "Atualização de versão pendente",
];
const TICKET_CHANNELS = ["WhatsApp", "Chat", "Telefone", "E-mail"];

function buildTickets(base: Customer, now: Date): SupportTicket[] {
  const open = base.openTickets;
  const seed = Number(base.code);
  const tickets: SupportTicket[] = [];

  for (let i = 0; i < open; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    tickets.push({
      id: `${base.id}-tk-${i + 1}`,
      code: `#${seed}${i + 1}`,
      subject: TICKET_SUBJECTS[(seed + i) % TICKET_SUBJECTS.length],
      status: i === 0 ? "aberto" : "em-andamento",
      priority: i === 0 && base.financialStatus !== "em-dia" ? "urgente" : i === 0 ? "alta" : "media",
      openedAt: iso(d),
      channel: TICKET_CHANNELS[(seed + i) % TICKET_CHANNELS.length],
      agent: i === 0 ? undefined : "Suporte N1",
    });
  }

  // Sempre alguns resolvidos no histórico recente.
  for (let i = 0; i < 2; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (open + i) * 3 - 2);
    tickets.push({
      id: `${base.id}-tk-r-${i + 1}`,
      code: `#${seed}${open + i + 1}`,
      subject: TICKET_SUBJECTS[(seed + open + i) % TICKET_SUBJECTS.length],
      status: i === 0 ? "resolvido" : "fechado",
      priority: "baixa",
      openedAt: iso(d),
      channel: TICKET_CHANNELS[(seed + i) % TICKET_CHANNELS.length],
      agent: "Suporte N1",
    });
  }

  return tickets;
}

function buildBlock(base: Customer): Customer["block"] {
  if (base.status === "ativo") return undefined;
  const reason =
    base.status === "bloqueado"
      ? "Inadimplência"
      : base.status === "suspenso"
        ? "Solicitação administrativa"
        : "Encerramento de contrato";
  return {
    reason,
    responsible: "Administração",
    date: base.contract.contractDate,
    note:
      base.status === "cancelado"
        ? "Contrato encerrado e licenças desativadas."
        : "Reativação mediante regularização.",
  };
}

function buildHistory(base: Customer, now: Date): HistoryEntry[] {
  const { id } = base;
  const entries: HistoryEntry[] = [
    {
      id: `${id}-h-cad`,
      date: base.createdAt,
      type: "cadastro",
      title: "Cliente cadastrado",
      description: `Cadastro inicial (${base.personType === "pj" ? "PJ" : "PF"}).`,
      user: "Comercial",
    },
  ];
  if (base.contract.signStatus === "assinado") {
    entries.push({
      id: `${id}-h-sign`,
      date: base.contract.contractDate,
      type: "assinatura",
      title: "Contrato assinado (D4Sign)",
      description: "Liberação de chaves e ferramentas.",
      user: "D4Sign",
    });
    entries.push({
      id: `${id}-h-int`,
      date: base.contract.contractDate,
      type: "integracao",
      title: "Integração configurada",
      description: "Servidor de produção provisionado.",
      user: "Suporte",
    });
  }
  if (base.financialStatus !== "em-dia") {
    entries.push({
      id: `${id}-h-fin`,
      date: iso(new Date(now.getFullYear(), now.getMonth() - 1, 15)),
      type: "financeiro",
      title: "Fatura em atraso registrada",
      user: "Financeiro",
    });
  }
  const block = buildBlock(base);
  if (block) {
    entries.push({
      id: `${id}-h-blk`,
      date: block.date,
      type: "bloqueio",
      title: `Cliente ${base.status}`,
      description: `Motivo: ${block.reason}.`,
      user: block.responsible,
    });
  }
  // Mais recente primeiro.
  return entries.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function buildNotes(base: Customer): Note[] {
  const notes: Note[] = [
    {
      id: `${base.id}-note-1`,
      date: base.createdAt,
      author: "Comercial",
      text: "Cliente indicado por parceiro. Acompanhar primeiros 90 dias.",
    },
  ];
  if (base.financialStatus !== "em-dia") {
    notes.push({
      id: `${base.id}-note-2`,
      date: base.contract.contractDate,
      author: "Financeiro",
      text: "Histórico de atraso recorrente — priorizar contato de cobrança.",
    });
  }
  return notes;
}

/**
 * Enriquece um cliente "enxuto" (da listagem) com os dados das abas do detalhe.
 * Idempotente: se já enriquecido, devolve como está.
 */
export function withCustomerDetails(base: Customer): Customer {
  if (base.invoices) return base;
  const now = new Date();
  return {
    ...base,
    amendments: buildAmendments(base),
    tools: buildTools(base),
    partners: buildPartners(base),
    integrations: buildIntegrations(base),
    apiCredentials: buildApiCredentials(base),
    installations: buildInstallations(base),
    history: buildHistory(base, now),
    notes: buildNotes(base),
    block: buildBlock(base),
    invoices: buildInvoices(base, now),
    tickets: buildTickets(base, now),
  };
}
