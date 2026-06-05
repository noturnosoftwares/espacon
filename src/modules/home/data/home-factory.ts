// Scope: [M] module-home
//
// Composição explícita do módulo home (sem container global de DI). Liga
// provider → repository → usecases. Trocar o mock pela API real significa
// substituir o provider instanciado aqui (e adicionar o mapper correspondente).

import { GetDashboardUseCase } from "./application/get-dashboard-usecase";
import { GetDashboardChartsUseCase } from "./application/get-dashboard-charts-usecase";
import { GetNotificationsUseCase } from "./application/get-notifications-usecase";
import { MockHomeProvider } from "./providers/mock-home-provider";
import { HomeRepositoryImpl } from "./repositories/home-repository-impl";

/** Repositório do home com o provider mock atual (reusado pelos usecases). */
function makeHomeRepository(): HomeRepositoryImpl {
  return new HomeRepositoryImpl(new MockHomeProvider());
}

export function makeGetDashboardUseCase(): GetDashboardUseCase {
  return new GetDashboardUseCase(makeHomeRepository());
}

export function makeGetDashboardChartsUseCase(): GetDashboardChartsUseCase {
  return new GetDashboardChartsUseCase(makeHomeRepository());
}

export function makeGetNotificationsUseCase(): GetNotificationsUseCase {
  return new GetNotificationsUseCase(makeHomeRepository());
}
