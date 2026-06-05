// Scope: [M] module-customers
//
// Contrato do repositório de Clientes (domain). A filtragem por escopo de acesso
// (multiempresa) e por permissão é REGRA do UseCase; a busca/ordenação/paginação
// da UI fica na store. A implementação escolhe o provider (mock ou API real).

import type { AsyncResult } from "@/shared/result/async-result";
import type { Customer, CustomerInput } from "../models/customer";

export interface CustomerRepository {
  /** Lista todos os clientes (model interno). Filtros de escopo no UseCase. */
  listCustomers(): Promise<AsyncResult<Customer[]>>;

  /** Busca um cliente pelo id. */
  getCustomerById(id: string): Promise<AsyncResult<Customer | null>>;

  /** Cria um cliente. */
  createCustomer(input: CustomerInput): Promise<AsyncResult<Customer>>;

  /** Atualiza um cliente existente. */
  updateCustomer(id: string, input: CustomerInput): Promise<AsyncResult<Customer>>;
}
