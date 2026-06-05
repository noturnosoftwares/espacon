// Scope: [M] module-customers
//
// Implementação do CustomerRepository. Recebe o provider por injeção e converte
// qualquer exceção inesperada em AppError — a presentation nunca recebe exception
// crua.

import { fail, type AsyncResult } from "@/shared/result/async-result";
import type { Customer, CustomerInput } from "../../domain/models/customer";
import type { CustomerRepository } from "../../domain/repositories/customer-repository";
import type { CustomerProvider } from "../providers/customer-provider";

export class CustomerRepositoryImpl implements CustomerRepository {
  constructor(private readonly provider: CustomerProvider) {}

  async listCustomers(): Promise<AsyncResult<Customer[]>> {
    try {
      return await this.provider.listCustomers();
    } catch (error) {
      return fail({
        message: "Não foi possível carregar os clientes. Tente novamente.",
        code: "customers/list-failed",
        cause: error,
      });
    }
  }

  async getCustomerById(id: string): Promise<AsyncResult<Customer | null>> {
    try {
      return await this.provider.getCustomerById(id);
    } catch (error) {
      return fail({
        message: "Não foi possível carregar o cliente. Tente novamente.",
        code: "customers/get-failed",
        cause: error,
      });
    }
  }

  async createCustomer(input: CustomerInput): Promise<AsyncResult<Customer>> {
    try {
      return await this.provider.createCustomer(input);
    } catch (error) {
      return fail({
        message: "Não foi possível salvar o cliente. Tente novamente.",
        code: "customers/create-failed",
        cause: error,
      });
    }
  }

  async updateCustomer(
    id: string,
    input: CustomerInput,
  ): Promise<AsyncResult<Customer>> {
    try {
      return await this.provider.updateCustomer(id, input);
    } catch (error) {
      return fail({
        message: "Não foi possível salvar as alterações. Tente novamente.",
        code: "customers/update-failed",
        cause: error,
      });
    }
  }
}
