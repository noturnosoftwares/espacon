// Scope: [M] module-customers
//
// UseCase de listagem de Clientes. Aplica a REGRA de visibilidade por escopo de
// acesso (multiempresa), mantendo-a fora da presentation:
//
//  - global (matriz)       → todos os clientes;
//  - franchise (franqueado)→ clientes da sua franquia (franchiseId);
//  - representative        → clientes do seu representante (representativeId);
//  - technician / customer → fora do escopo desta tela → lista vazia.
//
// Busca, ordenação e paginação são responsabilidade de UI (store). Aqui só entra
// regra de negócio.

import { type AsyncResult, ok } from "@/shared/result/async-result";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { Customer } from "../../domain/models/customer";
import type { CustomerRepository } from "../../domain/repositories/customer-repository";

export class ListCustomersUseCase {
  constructor(private readonly repository: CustomerRepository) {}

  async execute(user: AuthenticatedUser): Promise<AsyncResult<Customer[]>> {
    const result = await this.repository.listCustomers();
    if (!result.success) return result;

    return ok(result.data.filter((c) => this.isVisible(c, user)));
  }

  private isVisible(customer: Customer, user: AuthenticatedUser): boolean {
    switch (user.accessScope) {
      case "global":
        return true;
      case "franchise":
        return !!user.franchiseId && customer.franchiseId === user.franchiseId;
      case "representative":
        return (
          !!user.representativeId &&
          customer.representativeId === user.representativeId
        );
      default:
        return false;
    }
  }
}
