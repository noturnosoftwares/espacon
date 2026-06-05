// Scope: [M] module-help
//
// UseCase da Central de Ajuda. Carrega o agregado de conteúdo. A Ajuda é
// universal (sem filtragem por permissão — ver home-layout.md), então o UseCase
// apenas repassa o resultado do repositório, mantendo o ponto de extensão para
// regras futuras (ex.: ocultar artigos por escopo).

import type { AsyncResult } from "@/shared/result/async-result";
import type { HelpCenter } from "../../domain/models/help-content";
import type { HelpRepository } from "../../domain/repositories/help-repository";

export class GetHelpCenterUseCase {
  constructor(private readonly repository: HelpRepository) {}

  execute(): Promise<AsyncResult<HelpCenter>> {
    return this.repository.getHelpCenter();
  }
}
