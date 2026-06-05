// Scope: [M] module-home
//
// Implementação do HomeRepository. Recebe o provider por injeção (construtor) e
// converte qualquer exceção inesperada em AppError — a presentation nunca recebe
// exception crua.

import { fail, type AsyncResult } from "@/shared/result/async-result";
import type { DashboardWidget } from "../../domain/models/dashboard-widget";
import type { DashboardCharts } from "../../domain/models/dashboard-charts";
import type { AppNotification } from "../../domain/models/notification";
import type { HomeRepository } from "../../domain/repositories/home-repository";
import type { HomeProvider } from "../providers/home-provider";

export class HomeRepositoryImpl implements HomeRepository {
  constructor(private readonly provider: HomeProvider) {}

  async getDashboardWidgets(): Promise<AsyncResult<DashboardWidget[]>> {
    try {
      return await this.provider.getDashboardWidgets();
    } catch (error) {
      return fail({
        message: "Não foi possível carregar o dashboard. Tente novamente.",
        code: "home/dashboard-load-failed",
        cause: error,
      });
    }
  }

  async getDashboardCharts(): Promise<AsyncResult<DashboardCharts>> {
    try {
      return await this.provider.getDashboardCharts();
    } catch (error) {
      return fail({
        message: "Não foi possível carregar os gráficos do dashboard.",
        code: "home/charts-load-failed",
        cause: error,
      });
    }
  }

  async getNotifications(): Promise<AsyncResult<AppNotification[]>> {
    try {
      return await this.provider.getNotifications();
    } catch (error) {
      return fail({
        message: "Não foi possível carregar as notificações.",
        code: "home/notifications-load-failed",
        cause: error,
      });
    }
  }
}
