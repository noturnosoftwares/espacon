// Scope: [M] module-help
//
// Contrato do repositório da Central de Ajuda (domain). Fornece o agregado de
// conteúdo (categorias, artigos, tutoriais, novidades, FAQ). A implementação
// (data/repositories) escolhe o provider (mock ou API real de conhecimento).

import type { AsyncResult } from "@/shared/result/async-result";
import type { HelpCenter } from "../models/help-content";

export interface HelpRepository {
  /** Carrega todo o conteúdo da Central de Ajuda em uma única chamada. */
  getHelpCenter(): Promise<AsyncResult<HelpCenter>>;
}
