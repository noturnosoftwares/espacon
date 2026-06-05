// Scope: [M] module-customers
//
// UseCase de edição de Cliente. Mesmas regras de aplicação do create: exige
// permissão de escrita (`clients.edit`) e valida os campos (guarda) antes de
// delegar a atualização ao repositório.

import { fail, type AsyncResult } from "@/shared/result/async-result";
import { PermissionExt } from "@/shared/extensions/permission-ext";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { Customer, CustomerInput } from "../../domain/models/customer";
import { CustomerRules } from "../../domain/models/customer-rules";
import type { CustomerRepository } from "../../domain/repositories/customer-repository";

export class UpdateCustomerUseCase {
  constructor(private readonly repository: CustomerRepository) {}

  async execute(
    user: AuthenticatedUser,
    id: string,
    input: CustomerInput,
  ): Promise<AsyncResult<Customer>> {
    if (!PermissionExt.has(user.permissions, "clients.edit")) {
      return fail({
        message: "Você não tem permissão para editar clientes.",
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

    return this.repository.updateCustomer(id, input);
  }
}
