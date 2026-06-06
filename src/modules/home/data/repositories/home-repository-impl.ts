import { type AsyncResult, guard, serverError } from '@/shared/result'
import { type HomeDashboard, homeDashboardFromJson } from '../../domain/models'
import type { HomeRepository } from '../../domain/repositories'
import { MockHomeProvider } from '../providers/mock-home-provider'

/**
 * HomeRepositoryImpl — implementação do painel inicial. Converte JSON → model e
 * protege a presentation de exceptions cruas (`guard`). Provider injetado para
 * troca mock → REST.
 */
export class HomeRepositoryImpl implements HomeRepository {
  constructor(private readonly provider: MockHomeProvider) {}

  getDashboard(): Promise<AsyncResult<HomeDashboard>> {
    return guard(
      async () => {
        const json = await this.provider.getDashboard()
        return homeDashboardFromJson(json)
      },
      (cause) => serverError('Não foi possível carregar o painel.', { cause }),
    )
  }
}
