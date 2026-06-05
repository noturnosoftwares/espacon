// Scope: [M] module-customers
//
// UseCase de criação de Cliente. Concentra as REGRAS de aplicação fora da
// presentation: (1) exige permissão de escrita (`clients.edit`); (2) valida os
// campos obrigatórios (regra pura `CustomerRules.validateInput`) como guarda,
// mesmo que a store já valide para feedback inline. A persistência/duplicidade
// fica no repositório/provider.

import { fail, type AsyncResult } from "@/shared/result/async-result";
import { PermissionExt } from "@/shared/extensions/permission-ext";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { Customer, CustomerInput } from "../../domain/models/customer";
import { CustomerRules } from "../../domain/models/customer-rules";
import type { CustomerRepository } from "../../domain/repositories/customer-repository";

export class CreateCustomerUseCase {
  constructor(private readonly repository: CustomerRepository) {}

  async execute(
    user: AuthenticatedUser,
    input: CustomerInput,
  ): Promise<AsyncResult<Customer>> {
    if (!PermissionExt.has(user.permissions, "clients.edit")) {
      return fail({
        message: "Você não tem permissão para cadastrar clientes.",
        code: "customers/forbidden",
      });
    }

    const errors = CustomerRules.validateInput(input);
    if (Object.keys(errors).length > 0) {
      return fail({
        message: "Verifique os campos obrigatórios.",
        code: "customers/invalid-input",
      });
    }

    return this.repository.createCustomer(input);
  }
}
