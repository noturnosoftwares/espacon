// Scope: [M] module-home
//
// Contrato do provider da tela principal. É a única camada que conhece o formato
// externo (mock ou API REST). Trocar mock por API real não pode exigir mudança
// fora de Provider/Mapper.

import type { AsyncResult } from "@/shared/result/async-result";
import type { DashboardWidget } from "../../domain/models/dashboard-widget";
import type { DashboardCharts } from "../../domain/models/dashboard-charts";
import type { AppNotification } from "../../domain/models/notification";

export interface HomeProvider {
  getDashboardWidgets(): Promise<AsyncResult<DashboardWidget[]>>;
  getDashboardCharts(): Promise<AsyncResult<DashboardCharts>>;
  getNotifications(): Promise<AsyncResult<AppNotification[]>>;
}
