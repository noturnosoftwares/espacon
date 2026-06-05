// Scope: [M] module-customers
//
// Provider mockado de Clientes (mock-first). Simula latência e devolve os dados
// fixos. As escritas (create/update) mutam o array em memória — persistem durante
// a sessão e somem ao recarregar (decisão "mock em memória" desta fase). Quando
// existir contrato real, criar ApiCustomerProvider + mapper (data/mappers) e
// trocar o provider injetado no repository — sem impacto acima.

import { delay } from "@/shared/helpers/delay";
import { fail, ok, type AsyncResult } from "@/shared/result/async-result";
import { toISODate } from "@/shared/helpers/format";
import type { Customer, CustomerInput } from "../../domain/models/customer";
import { MOCK_CUSTOMERS } from "../mocks/mock-customers";
import { withCustomerDetails } from "../mocks/mock-customer-details";
import type { CustomerProvider } from "./customer-provider";

function digits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Documento duplicado? (ignora o próprio cliente em edição). */
function documentExists(document: string, exceptId?: string): boolean {
  const doc = digits(document);
  if (!doc) return false;
  return MOCK_CUSTOMERS.some(
    (c) => c.id !== exceptId && digits(c.document) === doc,
  );
}

/** Próximo código sequencial a partir do maior existente. */
function nextCode(): string {
  const max = MOCK_CUSTOMERS.reduce((m, c) => Math.max(m, Number(c.code) || 0), 1000);
  return String(max + 1);
}

export class MockCustomerProvider implements CustomerProvider {
  async listCustomers(): Promise<AsyncResult<Customer[]>> {
    await delay(500);
    return ok(MOCK_CUSTOMERS);
  }

  async getCustomerById(id: string): Promise<AsyncResult<Customer | null>> {
    await delay(400);
    const found = MOCK_CUSTOMERS.find((c) => c.id === id);
    // Detalhe é enriquecido com os dados das abas (gerador determinístico).
    return ok(found ? withCustomerDetails(found) : null);
  }

  async createCustomer(input: CustomerInput): Promise<AsyncResult<Customer>> {
    await delay(450);
    if (documentExists(input.document)) {
      return fail({
        message: "Já existe um cliente com este documento.",
        code: "customers/duplicate-document",
      });
    }
    const code = nextCode();
    const customer: Customer = {
      id: `c-${code}`,
      code,
      ...input,
      openTickets: 0,
      createdAt: toISODate(new Date()),
    };
    // Mais novo no topo da listagem.
    MOCK_CUSTOMERS.unshift(customer);
    return ok(customer);
  }

  async updateCustomer(
    id: string,
    input: CustomerInput,
  ): Promise<AsyncResult<Customer>> {
    await delay(450);
    const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
    if (index < 0) {
      return fail({
        message: "Cliente não encontrado para atualização.",
        code: "customers/not-found",
      });
    }
    if (documentExists(input.document, id)) {
      return fail({
        message: "Já existe outro cliente com este documento.",
        code: "customers/duplicate-document",
      });
    }
    const current = MOCK_CUSTOMERS[index];
    const updated: Customer = {
      ...current,
      ...input,
      // Preserva identidade e métricas não editáveis no formulário.
      id: current.id,
      code: current.code,
      createdAt: current.createdAt,
      openTickets: current.openTickets,
      lastServiceLabel: current.lastServiceLabel,
    };
    MOCK_CUSTOMERS.splice(index, 1, updated);
    return ok(updated);
  }
}
