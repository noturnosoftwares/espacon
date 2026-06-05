// Scope: [M] module-home
//
// Contrato do repositório da tela principal (domain). Fornece os dados dinâmicos
// do dashboard e da central de notificações. A implementação (data/repositories)
// decide o provider (mock ou API real).

import type { AsyncResult } from "@/shared/result/async-result";
import type { DashboardWidget } from "../models/dashboard-widget";
import type { DashboardCharts } from "../models/dashboard-charts";
import type { AppNotification } from "../models/notification";

export interface HomeRepository {
  /** Widgets do dashboard (já como model interno; a filtragem por permissão é regra do UseCase). */
  getDashboardWidgets(): Promise<AsyncResult<DashboardWidget[]>>;

  /** Gráficos do dashboard (fluxo de caixa + resumo financeiro). */
  getDashboardCharts(): Promise<AsyncResult<DashboardCharts>>;

  /** Notificações da central. */
  getNotifications(): Promise<AsyncResult<AppNotification[]>>;
}
