// Scope: [M] module-help
//
// Composição explícita do módulo help (sem container global de DI). Liga
// provider → repository → usecase. Trocar o mock pela API real significa
// substituir o provider instanciado aqui (e adicionar o mapper correspondente).

import { GetHelpCenterUseCase } from "./application/get-help-center-usecase";
import { MockHelpProvider } from "./providers/mock-help-provider";
import { HelpRepositoryImpl } from "./repositories/help-repository-impl";

function makeHelpRepository(): HelpRepositoryImpl {
  return new HelpRepositoryImpl(new MockHelpProvider());
}

export function makeGetHelpCenterUseCase(): GetHelpCenterUseCase {
  return new GetHelpCenterUseCase(makeHelpRepository());
}
