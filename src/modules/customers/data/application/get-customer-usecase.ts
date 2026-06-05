// Scope: [M] module-customers
//
// UseCase de detalhe do Cliente. Carrega o cliente por id. Mantém ponto de
// extensão para validar o escopo de acesso do usuário sobre o cliente (ex.: um
// franqueado não pode abrir cliente de outra franquia) quando a tela de detalhe
// passar a receber o usuário autenticado.

import type { AsyncResult } from "@/shared/result/async-result";
import type { Customer } from "../../domain/models/customer";
import type { CustomerRepository } from "../../domain/repositories/customer-repository";

export class GetCustomerUseCase {
  constructor(private readonly repository: CustomerRepository) {}

  execute(id: string): Promise<AsyncResult<Customer | null>> {
    return this.repository.getCustomerById(id);
  }
}
