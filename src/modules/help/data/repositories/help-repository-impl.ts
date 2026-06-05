// Scope: [M] module-help
//
// Implementação do HelpRepository. Recebe o provider por injeção (construtor) e
// converte qualquer exceção inesperada em AppError — a presentation nunca recebe
// exception crua.

import { fail, type AsyncResult } from "@/shared/result/async-result";
import type { HelpCenter } from "../../domain/models/help-content";
import type { HelpRepository } from "../../domain/repositories/help-repository";
import type { HelpProvider } from "../providers/help-provider";

export class HelpRepositoryImpl implements HelpRepository {
  constructor(private readonly provider: HelpProvider) {}

  async getHelpCenter(): Promise<AsyncResult<HelpCenter>> {
    try {
      return await this.provider.getHelpCenter();
    } catch (error) {
      return fail({
        message: "Não foi possível carregar a Central de Ajuda. Tente novamente.",
        code: "help/center-load-failed",
        cause: error,
      });
    }
  }
}
