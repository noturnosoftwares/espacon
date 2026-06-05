// Scope: [M] module-customers
//
// Store do detalhe do Cliente. Estende BaseStore. Carrega um cliente por id e
// expõe estado de "não encontrado" para a presentation tratar 404 amigável.
// Instância POR TELA.

import { BaseStore, type BaseState } from "@/shared/stores/base-store";
import type { Customer } from "../../domain/models/customer";
import type { GetCustomerUseCase } from "../../data/application/get-customer-usecase";

type CustomerDetailState = BaseState & {
  customer: Customer | null;
  notFound: boolean;
};

export class CustomerDetailStore extends BaseStore<CustomerDetailState> {
  constructor(private readonly getCustomer: GetCustomerUseCase) {
    super({
      ...BaseStore.baseState(),
      customer: null,
      notFound: false,
    });
  }

  async load(id: string): Promise<void> {
    this.setState({ loading: true, errorMessage: null, notFound: false });
    const result = await this.getCustomer.execute(id);

    if (!result.success) {
      this.setState({
        loading: false,
        isInitialized: true,
        errorMessage: result.error.message,
      });
      return;
    }

    this.setState({
      customer: result.data,
      notFound: result.data === null,
      loading: false,
      isInitialized: true,
    });
  }
}
