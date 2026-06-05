// Scope: [M] module-home
//
// Provider mockado da tela principal (mock-first). Simula latência de rede e
// devolve os dados fixos dos mocks. Quando existir contrato real de API, criar um
// ApiHomeProvider + mapper (data/mappers) e trocar o provider injetado no
// repository — sem impacto nas camadas acima.

import { delay } from "@/shared/helpers/delay";
import { ok, type AsyncResult } from "@/shared/result/async-result";
import type { DashboardWidget } from "../../domain/models/dashboard-widget";
import type { DashboardCharts } from "../../domain/models/dashboard-charts";
import type { AppNotification } from "../../domain/models/notification";
import { MOCK_DASHBOARD_WIDGETS } from "../mocks/mock-dashboard-widgets";
import { MOCK_DASHBOARD_CHARTS } from "../mocks/mock-dashboard-charts";
import { MOCK_NOTIFICATIONS } from "../mocks/mock-notifications";
import type { HomeProvider } from "./home-provider";

export class MockHomeProvider implements HomeProvider {
  async getDashboardWidgets(): Promise<AsyncResult<DashboardWidget[]>> {
    await delay(500);
    return ok(MOCK_DASHBOARD_WIDGETS);
  }

  async getDashboardCharts(): Promise<AsyncResult<DashboardCharts>> {
    await delay(500);
    return ok(MOCK_DASHBOARD_CHARTS);
  }

  async getNotifications(): Promise<AsyncResult<AppNotification[]>> {
    await delay(500);
    return ok(MOCK_NOTIFICATIONS);
  }
}
