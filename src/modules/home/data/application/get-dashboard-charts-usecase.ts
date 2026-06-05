// Scope: [M] module-home
//
// UseCase dos gráficos do dashboard. Os gráficos são financeiros — só são
// carregados se o usuário tiver a permissão "financial.summary.view"
// (mantém a regra de visibilidade fora da presentation). Sem permissão →
// retorna null (a presentation simplesmente não exibe a seção).

import { PermissionExt } from "@/shared/extensions/permission-ext";
import { type AsyncResult, ok } from "@/shared/result/async-result";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { DashboardCharts } from "../../domain/models/dashboard-charts";
import type { HomeRepository } from "../../domain/repositories/home-repository";

const CHARTS_PERMISSION = "financial.summary.view";

export class GetDashboardChartsUseCase {
  constructor(private readonly repository: HomeRepository) {}

  async execute(
    user: AuthenticatedUser,
  ): Promise<AsyncResult<DashboardCharts | null>> {
    if (!PermissionExt.has(user.permissions, CHARTS_PERMISSION)) {
      return ok(null);
    }
    return this.repository.getDashboardCharts();
  }
}
