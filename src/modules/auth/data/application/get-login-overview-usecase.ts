import type { AsyncResult } from '@/shared/result'
import type { LoginOverview } from '../../domain/models'
import type { OverviewRepository } from '../../domain/repositories'
import { OverviewRepositoryImpl } from '../repositories/overview-repository-impl'
import { MockOverviewProvider } from '../providers/mock-overview-provider'

export type GetLoginOverviewUseCase = () => Promise<AsyncResult<LoginOverview>>

/**
 * makeGetLoginOverviewUseCase — compõe o carregamento do panorama público por
 * factory explícita: UseCase → OverviewRepository → MockOverviewProvider.
 *
 * TROCA POR API REAL: troque `MockOverviewProvider` por um `RestOverviewProvider`
 * (via `HttpClient`) nesta factory; nada acima muda (ver ADR-001/007).
 */
export function makeGetLoginOverviewUseCase(): GetLoginOverviewUseCase {
  const provider = new MockOverviewProvider()
  const repository: OverviewRepository = new OverviewRepositoryImpl(provider)
  return () => repository.getOverview()
}
