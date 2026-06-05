// Scope: [M] module-home
//
// UseCase do dashboard. Carrega os widgets e aplica a REGRA de exibição por
// permissão (cada widget tem a sua) com base nas permissões do usuário
// autenticado — mantendo a regra fora da presentation. Ordena pelo campo `order`.

import { PermissionExt } from "@/shared/extensions/permission-ext";
import { type AsyncResult, ok } from "@/shared/result/async-result";
import type { AuthenticatedUser } from "@/modules/auth/domain/models/authenticated-user";
import type { DashboardWidget } from "../../domain/models/dashboard-widget";
import type { HomeRepository } from "../../domain/repositories/home-repository";

export class GetDashboardUseCase {
  constructor(private readonly repository: HomeRepository) {}

  async execute(
    user: AuthenticatedUser,
  ): Promise<AsyncResult<DashboardWidget[]>> {
    const result = await this.repository.getDashboardWidgets();
    if (!result.success) return result;

    const visible = result.data
      .filter((widget) => PermissionExt.has(user.permissions, widget.permission))
      .sort((a, b) => a.order - b.order);

    return ok(visible);
  }
}
