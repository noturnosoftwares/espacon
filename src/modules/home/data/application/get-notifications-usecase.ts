// Scope: [M] module-home
//
// UseCase da central de notificações. Hoje apenas delega ao repositório; isolado
// para acomodar futuras regras (ex.: filtrar por escopo/permissão, marcar como
// lida no backend) sem tocar na presentation.

import type { AsyncResult } from "@/shared/result/async-result";
import type { AppNotification } from "../../domain/models/notification";
import type { HomeRepository } from "../../domain/repositories/home-repository";

export class GetNotificationsUseCase {
  constructor(private readonly repository: HomeRepository) {}

  async execute(): Promise<AsyncResult<AppNotification[]>> {
    return this.repository.getNotifications();
  }
}
