// Scope: [M] module-help
//
// Provider mockado da Central de Ajuda (mock-first). Simula latência de rede e
// devolve o conteúdo fixo do mock. Quando existir contrato real, criar um
// ApiHelpProvider + mapper (data/mappers) e trocar o provider injetado no
// repository — sem impacto nas camadas acima.

import { delay } from "@/shared/helpers/delay";
import { ok, type AsyncResult } from "@/shared/result/async-result";
import type { HelpCenter } from "../../domain/models/help-content";
import { MOCK_HELP_CENTER } from "../mocks/mock-help-center";
import type { HelpProvider } from "./help-provider";

export class MockHelpProvider implements HelpProvider {
  async getHelpCenter(): Promise<AsyncResult<HelpCenter>> {
    await delay(400);
    return ok(MOCK_HELP_CENTER);
  }
}
