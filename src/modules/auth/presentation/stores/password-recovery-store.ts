// Scope: [M] module-auth
//
// Store da tela de recuperação de senha. Estende apenas BaseStore (não é CRUD).
// Orquestra Page → Store → UseCase. Instância POR TELA: guarda o estado do fluxo
// (concluído + e-mail-alvo) que não deve vazar entre telas.

import { BaseStore, type BaseState } from "@/shared/stores/base-store";
import type { RecoverPasswordUseCase } from "../../data/application/recover-password-usecase";

type PasswordRecoveryState = BaseState & {
  /** Marca que a solicitação foi enviada com sucesso (tela de confirmação). */
  completed: boolean;
  /** E-mail-alvo da solicitação concluída (exibido na confirmação). */
  sentToEmail: string | null;
};

export class PasswordRecoveryStore extends BaseStore<PasswordRecoveryState> {
  constructor(private readonly useCase: RecoverPasswordUseCase) {
    super({
      ...BaseStore.baseState(),
      completed: false,
      sentToEmail: null,
    });
  }

  /** Solicita a recuperação. Em sucesso, ativa o estado de confirmação. */
  async recover(email: string): Promise<void> {
    this.setState({ loading: true, errorMessage: null });

    const result = await this.useCase.execute({ email });

    if (result.success) {
      this.setState({
        loading: false,
        completed: true,
        sentToEmail: result.data.email,
      });
      return;
    }

    this.setState({ loading: false, errorMessage: result.error.message });
  }

  /** Volta ao formulário (ex.: "tentar outro e-mail"). */
  reset(): void {
    this.setState({ completed: false, sentToEmail: null, errorMessage: null });
  }
}
