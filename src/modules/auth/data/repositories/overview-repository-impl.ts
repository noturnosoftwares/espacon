import { type AsyncResult, guard, serverError } from '@/shared/result'
import { type LoginOverview, loginOverviewFromJson } from '../../domain/models'
import type { OverviewRepository } from '../../domain/repositories'
import { MockOverviewProvider } from '../providers/mock-overview-provider'

/**
 * OverviewRepositoryImpl — implementação do panorama público do login.
 *
 * Converte JSON → model (mapper) e protege a presentation de exceptions cruas
 * (`guard`). A falha vira `AppError` discreto (não bloqueia o login). O provider
 * é injetado para permitir a troca mock → REST sem afetar camadas superiores.
 */
export class OverviewRepositoryImpl implements OverviewRepository {
  constructor(private readonly provider: MockOverviewProvider) {}

  getOverview(): Promise<AsyncResult<LoginOverview>> {
    return guard(
      async () => {
        const json = await this.provider.getOverview()
        return loginOverviewFromJson(json)
      },
      (cause) => serverError('Não foi possível carregar.', { cause }),
    )
  }
}
