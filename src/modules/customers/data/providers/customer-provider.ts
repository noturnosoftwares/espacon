// Scope: [M] module-customers
//
// Contrato do provider de Clientes. Única camada que conhece o formato externo
// (mock ou API REST). Trocar mock por API real não pode exigir mudança fora de
// Provider/Mapper.

import type { AsyncResult } from "@/shared/result/async-result";
import type { Customer, CustomerInput } from "../../domain/models/customer";

export interface CustomerProvider {
  listCustomers(): Promise<AsyncResult<Customer[]>>;
  getCustomerById(id: string): Promise<AsyncResult<Customer | null>>;
  /** Cria um cliente (gera id/código/data). Falha em documento duplicado. */
  createCustomer(input: CustomerInput): Promise<AsyncResult<Customer>>;
  /** Atualiza os campos editáveis de um cliente existente. */
  updateCustomer(id: string, input: CustomerInput): Promise<AsyncResult<Customer>>;
}
