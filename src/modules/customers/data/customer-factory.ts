// Scope: [M] module-customers
//
// Composição explícita do módulo customers (sem container global de DI). Liga
// provider → repository → usecases. Trocar o mock pela API real significa
// substituir o provider instanciado aqui (e adicionar o mapper correspondente).

import { ListCustomersUseCase } from "./application/list-customers-usecase";
import { GetCustomerUseCase } from "./application/get-customer-usecase";
import { CreateCustomerUseCase } from "./application/create-customer-usecase";
import { UpdateCustomerUseCase } from "./application/update-customer-usecase";
import { MockCustomerProvider } from "./providers/mock-customer-provider";
import { CustomerRepositoryImpl } from "./repositories/customer-repository-impl";

function makeCustomerRepository(): CustomerRepositoryImpl {
  return new CustomerRepositoryImpl(new MockCustomerProvider());
}

export function makeListCustomersUseCase(): ListCustomersUseCase {
  return new ListCustomersUseCase(makeCustomerRepository());
}

export function makeGetCustomerUseCase(): GetCustomerUseCase {
  return new GetCustomerUseCase(makeCustomerRepository());
}

export function makeCreateCustomerUseCase(): CreateCustomerUseCase {
  return new CreateCustomerUseCase(makeCustomerRepository());
}

export function makeUpdateCustomerUseCase(): UpdateCustomerUseCase {
  return new UpdateCustomerUseCase(makeCustomerRepository());
}
