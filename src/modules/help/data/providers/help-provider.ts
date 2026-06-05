// Scope: [M] module-help
//
// Contrato do provider da Central de Ajuda. Única camada que conhece o formato
// externo (mock ou API REST de conhecimento). Trocar mock por API real não pode
// exigir mudança fora de Provider/Mapper.

import type { AsyncResult } from "@/shared/result/async-result";
import type { HelpCenter } from "../../domain/models/help-content";

export interface HelpProvider {
  getHelpCenter(): Promise<AsyncResult<HelpCenter>>;
}
